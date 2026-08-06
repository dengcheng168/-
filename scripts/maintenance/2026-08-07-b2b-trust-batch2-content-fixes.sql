-- 2026-08-07 B2B 可信度增强第二批：证书页/About页/首页文案修复
--
-- 背景：
--   1) 首页 Core Advantages 第一张卡片（site_settings.coreAdvantages 索引0）英文正文写的是
--      "5-8 years of OEM/ODM manufacturing experience"，西语翻译（translations 表
--      key='settings.coreAdvantages.0.description'）对应写的是 "De 5 a 8 años de experiencia"——
--      网站所有者尚未确认准确年限，本脚本删除这个不确定表述，改成不含年限的 OEM/ODM 服务
--      描述（标题/正文见下方 UPDATE 语句），第2、3张卡片（Quality Control / Global Shipping）
--      不改动。
--   2) 证书页（Page.slug='certificates'）的 title/bodyHtml/seoDescription 更新为新的
--      Hero 文案和 SEO 描述，与前端新增的分类展示（Product Approvals / Compliance &
--      Component Test Documents / Historical-Expired）保持一致；证书本身的图片、
--      持证方名称、证书编号、签发/失效日期完全不动。
--   3) About 页（Page.slug='about'）的 title/bodyHtml 更新为新的 Company Overview 文案
--      （已核对 site_settings.companyName = "Zhongshan Li-Men Technology Co., Ltd."，
--      不是编造）；不改动 heroImage/heroImageMobile，不改动 sections 字段（仍为空，
--      "What We Support"/图库分组/底部CTA 改在前端用结构化组件渲染，不写进这个字段）。
--   4) FactoryGalleryItem（About 页 16 组素材）本身一条记录都不改，16 张原图、原始英西语
--      标题/说明全部保留，只在前端按 id 重新分组展示（见
--      frontend/src/lib/about/gallery-groups.ts），本脚本不涉及这张表。
--   5) Certificate 表本身也不改：生产库里 WRAS Product Approval 被重复发布了 3 次
--      （id 5/6/9，同一个 Approval Number 240902711），本轮选择在前端用展示白名单
--      （frontend/src/lib/certificates/display-config.ts）只渲染 id 9（内容最完整、
--      唯一有西语翻译的版本），不在数据库层面 unpublish id 5/6，避免不必要的写操作。
--
-- 执行前必须先跑一次本文件顶部列出的"执行前断言"（见下），全部符合预期才继续；
-- 任意一条不符，立即停止，不得执行 BEGIN 之后的任何语句。
--
-- 执行前断言（预期结果，2026-08-07 对生产库备份验证通过）：
--   SELECT coreAdvantages FROM site_settings LIMIT 1;
--     -- 期望：索引0 description 包含 "5-8 years of OEM/ODM manufacturing experience"
--   SELECT value FROM translations WHERE key='settings.coreAdvantages.0.description';
--     -- 期望：包含 "De 5 a 8 años de experiencia"
--   SELECT title,bodyHtml FROM pages WHERE slug='certificates';
--     -- 期望：title='Certificates'
--   SELECT title,bodyHtml FROM pages WHERE slug='about';
--     -- 期望：title='About Us'
--   SELECT companyName FROM site_settings LIMIT 1;
--     -- 期望：'Zhongshan Li-Men Technology Co., Ltd.'（用于核实 About 文案没有编造公司全称）
--
-- 用法：
--   sqlite3 <db文件> < 2026-08-07-b2b-trust-batch2-content-fixes.sql
--   （先在生产库的隔离副本上跑一遍，核对下方"执行后校验"全部通过，再对生产库执行）

.bail on
PRAGMA foreign_keys = ON;

BEGIN TRANSACTION;

-- 1) 首页 Core Advantages 第一张卡片：删除 "5-8 years" 不确定表述（英文）
--    第2、3张卡片（Quality Control / Global Shipping）原样保留，逐字符复制自当前生产库
UPDATE site_settings
SET coreAdvantages = '[{"title":"OEM & ODM Support","description":"OEM and ODM support for logo, packaging and appearance customization, with project coordination for distributors and private-label customers."},{"title":"Quality Control","description":"Full-process quality inspection – incoming material checks, in-line production monitoring, 100% finished-goods testing and pre-shipment sampling, covering water quality, leak/seal integrity and electrical safety."},{"title":"Global Shipping","description":"Reliable export logistics to customers worldwide, supporting both sea and air freight to meet different order volumes and delivery timelines."}]',
    updatedAt = datetime('now')
WHERE id = (SELECT id FROM site_settings LIMIT 1);

-- 2) 首页 Core Advantages 第一张卡片：删除 "De 5 a 8 años" 不确定表述（西语）
UPDATE translations
SET value = 'Servicios OEM y ODM',
    updatedAt = datetime('now')
WHERE key = 'settings.coreAdvantages.0.title';

UPDATE translations
SET value = 'Servicios OEM y ODM para la personalización de logotipo, embalaje y apariencia, con coordinación de proyectos para distribuidores y marcas privadas.',
    updatedAt = datetime('now')
WHERE key = 'settings.coreAdvantages.0.description';

-- 3) 证书页 Hero 文案 + SEO 描述（英文），证书数据本身不动
UPDATE pages
SET title = 'Certificates & Test Reports',
    bodyHtml = '<p>Review product approvals, compliance documents and test reports for specific Li-Men water purification products and related components.</p>',
    seoDescription = 'Review product approvals, compliance documents and test reports for specific Li-Men water purification products and related components.',
    updatedAt = datetime('now')
WHERE slug = 'certificates';

-- 4) 证书页 Hero 文案（西语）
UPDATE page_translations
SET title = 'Certificados y Informes de Ensayo',
    bodyHtml = '<p>Consulte las aprobaciones de productos, los documentos de conformidad y los informes de ensayo de productos específicos de purificación de agua Li-Men y componentes relacionados.</p>',
    updatedAt = datetime('now')
WHERE pageId = (SELECT id FROM pages WHERE slug = 'certificates') AND locale = 'es';

-- 5) About 页 Company Overview 文案（英文）——companyName 已核实为
--    "Zhongshan Li-Men Technology Co., Ltd."，不是编造；不新增成立年份/员工数量/厂房面积等
UPDATE pages
SET title = 'Water Purification Manufacturing and OEM/ODM Support',
    bodyHtml = '<p>Zhongshan Li-Men Technology Co., Ltd. supports distributors, private-label brands and project customers with water purification products, manufacturing coordination, quality inspection, packaging and export services.</p><p>From material inspection and product assembly to performance testing and shipment preparation, our team works to maintain a clear and traceable production process for each confirmed project.</p>',
    seoDescription = 'Zhongshan Li-Men Technology Co., Ltd. supports distributors, private-label brands and project customers with water purification products, manufacturing coordination, quality inspection, packaging and export services.',
    updatedAt = datetime('now')
WHERE slug = 'about';

-- 6) About 页 Company Overview 文案（西语）
UPDATE page_translations
SET title = 'Fabricación de Purificación de Agua y Soporte OEM/ODM',
    bodyHtml = '<p>Zhongshan Li-Men Technology Co., Ltd. apoya a distribuidores, marcas privadas y clientes de proyectos con productos de purificación de agua, coordinación de fabricación, inspección de calidad, embalaje y servicios de exportación.</p><p>Desde la inspección de materiales y el ensamblaje del producto hasta las pruebas de rendimiento y la preparación del envío, nuestro equipo trabaja para mantener un proceso de producción claro y trazable en cada proyecto confirmado.</p>',
    updatedAt = datetime('now')
WHERE pageId = (SELECT id FROM pages WHERE slug = 'about') AND locale = 'es';

COMMIT;

-- 执行后校验（应当自动打印以下结果，逐条核对）
SELECT '--- core advantages (en, expect no "5-8") ---' AS section;
SELECT coreAdvantages FROM site_settings LIMIT 1;

SELECT '--- core advantages (es, expect no "5 a 8") ---' AS section;
SELECT key, value FROM translations WHERE key LIKE 'settings.coreAdvantages.0.%';

SELECT '--- certificates page (en) ---' AS section;
SELECT title, bodyHtml, seoDescription FROM pages WHERE slug = 'certificates';

SELECT '--- certificates page (es) ---' AS section;
SELECT title, bodyHtml FROM page_translations WHERE pageId = (SELECT id FROM pages WHERE slug = 'certificates') AND locale = 'es';

SELECT '--- about page (en) ---' AS section;
SELECT title, bodyHtml, seoDescription FROM pages WHERE slug = 'about';

SELECT '--- about page (es) ---' AS section;
SELECT title, bodyHtml FROM page_translations WHERE pageId = (SELECT id FROM pages WHERE slug = 'about') AND locale = 'es';

SELECT '--- foreign_key_check (expect 0 rows) ---' AS section;
PRAGMA foreign_key_check;

SELECT '--- integrity_check (expect "ok") ---' AS section;
PRAGMA integrity_check;
