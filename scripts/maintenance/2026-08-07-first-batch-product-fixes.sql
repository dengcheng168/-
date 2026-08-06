-- 2026-08-07 第一批产品/分类修复
--
-- 背景：
--   1) FAQ 页面另有前端 SSR 修复，与本脚本无关。
--   2) K02(qw-ro-100g-k02)、K03(qw-ro-600g-k03) 是 Under-Sink 型号，之前被放在
--      "Countertop RO Water Purifiers" 分类下——新建 Under-Sink 分类并把两者迁移过去。
--      K01、K04 保留在原 Countertop 分类，未发现任何资料证明它们不应该在那里。
--   3) K03 的 name 字段结尾是小写 "k03"（英文和西语翻译都是），统一改成大写 "K03"，
--      slug 本来就是全小写 "qw-ro-600g-k03"，不需要改 URL、不需要 301。
--   4) K04 的 Features 字段之前是把 Specifications 逐条拼成 "标签: 值" 字符串，
--      与规格表完全重复，改成真正的产品卖点文案（Specifications 字段本身未改动）。
--   5) K01 的 name/slug 字段错误地写成 "600G"，但 shortDescription／specs／features／
--      SEO 字段（英文和西语）全部一致写的是 100G/100 GPD——网站所有者已正式确认真实
--      容量为 100G，本脚本把 name/slug（以及西语 name）改正为 100G 版本。旧 URL 的
--      301/308 永久重定向在 frontend/next.config.ts 的 async redirects() 里实现
--      （项目里另有一张 `redirects` 数据库表 + 后台 CRUD 页面，但从未接入任何运行时
--      重定向逻辑，找不到任何地方调用 findRedirectByFromPath，本脚本不依赖那张表）。
--
-- 执行前必须先跑一次本文件顶部列出的"执行前断言"（见下），全部符合预期才继续；
-- 任意一条不符，立即停止，不得执行 BEGIN 之后的任何语句。
--
-- 执行前断言（预期结果，2026-08-07 对生产库备份验证通过）：
--   SELECT COUNT(*) FROM products WHERE sku='K01';                        -- 期望 1
--   SELECT name, slug FROM products WHERE sku='K01';                     -- 期望 QW-RO-600G-K01 / qw-ro-600g-k01
--   SELECT COUNT(*) FROM products WHERE slug='qw-ro-100g-k01';            -- 期望 0（无冲突）
--   SELECT COUNT(*) FROM products WHERE sku='K02';                        -- 期望 1
--   SELECT COUNT(*) FROM products WHERE sku='K03';                        -- 期望 1
--   SELECT COUNT(*) FROM product_translations pt JOIN products p ON p.id=pt.productId
--     WHERE p.sku='K04' AND pt.locale='es';                               -- 期望 1
--   SELECT COUNT(*) FROM product_categories WHERE slug='under-sink-ro-water-purifiers'; -- 期望 0（尚未创建）
--
-- 用法：
--   sqlite3 <db文件> < 2026-08-07-first-batch-product-fixes.sql
--   （先在生产库的隔离副本上跑一遍，核对下方"执行后校验"全部通过，再对生产库执行）

.bail on
PRAGMA foreign_keys = ON;

BEGIN TRANSACTION;

-- 1) 新建 Under-Sink 分类
INSERT INTO product_categories (name, slug, description, image, sortOrder, published, seoTitle, seoDescription, deletedAt, createdAt, updatedAt)
VALUES (
  'Under-Sink RO Water Purifiers',
  'under-sink-ro-water-purifiers',
  'Under-sink reverse osmosis water purifiers for cabinet installation, available in a range of capacities for kitchens and space-limited projects. OEM/ODM customization available.',
  NULL,
  0,
  1,
  'Under-Sink RO Water Purifiers for OEM & Wholesale | Li-Men',
  'Explore Li-Men under-sink reverse osmosis water purifiers for distributors, wholesalers and private-label projects.',
  NULL,
  datetime('now'),
  datetime('now')
);

-- 2) 分类的西语翻译
INSERT INTO product_category_translations (categoryId, locale, name, description, seoTitle, seoDescription, translationStatus, updatedBy, createdAt, updatedAt)
VALUES (
  (SELECT id FROM product_categories WHERE slug = 'under-sink-ro-water-purifiers'),
  'es',
  'Purificadores de agua por ósmosis inversa bajo fregadero',
  'Purificadores de agua por ósmosis inversa bajo fregadero para instalación en gabinete, disponibles en diferentes capacidades para cocinas y proyectos con espacio limitado. Personalización OEM/ODM disponible.',
  'Purificadores de Ósmosis Inversa Bajo Fregadero para OEM y Mayoreo | Li-Men',
  'Descubra los purificadores de agua por ósmosis inversa bajo fregadero de Li-Men para distribuidores, mayoristas y proyectos de marca privada.',
  'PUBLISHED',
  NULL,
  datetime('now'),
  datetime('now')
);

-- 3) K02、K03 迁移到新分类（K01、K04 保留在原分类，不动）
UPDATE products
SET categoryId = (SELECT id FROM product_categories WHERE slug = 'under-sink-ro-water-purifiers'),
    updatedAt = datetime('now')
WHERE sku IN ('K02', 'K03');

-- 4) K03 名称大小写修正（英文）
UPDATE products
SET name = 'QW-RO-600G-K03',
    updatedAt = datetime('now')
WHERE sku = 'K03';

-- 5) K03 名称大小写修正（西语翻译）
UPDATE product_translations
SET name = 'QW-RO-600G-K03',
    updatedAt = datetime('now')
WHERE productId = (SELECT id FROM products WHERE sku = 'K03') AND locale = 'es';

-- 6) K04 Features 改为真正卖点文案（英文，Specifications 字段未改动）
UPDATE products
SET features = '[{"title":"Easy-Refill Removable Water Tank","description":"The transparent side tank can be removed for convenient refilling and routine cleaning."},{"title":"Simple Smart Display Control","description":"The integrated display panel provides clear and convenient daily operation."},{"title":"Compact Countertop Design","description":"The space-saving body is suitable for kitchens, offices, apartments and pantry areas."},{"title":"Convenient Front Dispensing","description":"The front dispensing area allows easy cup placement and everyday water access."},{"title":"Easy-to-Clean Drip Tray","description":"The removable drip tray helps simplify routine cleaning and maintenance."},{"title":"OEM & ODM Options","description":"OEM and ODM cooperation is available according to confirmed project requirements."}]',
    updatedAt = datetime('now')
WHERE sku = 'K04';

-- 7) K04 Features 改为真正卖点文案（西语）
UPDATE product_translations
SET features = '[{"title":"Depósito extraíble de fácil llenado","description":"El depósito lateral transparente puede extraerse para facilitar el llenado y la limpieza habitual."},{"title":"Control sencillo mediante pantalla inteligente","description":"El panel de visualización integrado permite un manejo diario claro y cómodo."},{"title":"Diseño compacto de sobremesa","description":"Su estructura compacta es adecuada para cocinas, oficinas, apartamentos y zonas de descanso."},{"title":"Dispensación frontal práctica","description":"La zona de dispensación frontal facilita la colocación del vaso y el acceso diario al agua."},{"title":"Bandeja de goteo fácil de limpiar","description":"La bandeja de goteo extraíble facilita la limpieza y el mantenimiento habituales."},{"title":"Opciones OEM y ODM","description":"La cooperación OEM y ODM está disponible según los requisitos confirmados de cada proyecto."}]',
    updatedAt = datetime('now')
WHERE productId = (SELECT id FROM products WHERE sku = 'K04') AND locale = 'es';

-- 8) K01 name/slug 更正为已确认的 100G 版本（英文）——SKU 保持 K01 不变，
--    Specifications/Features/shortDescription/SEO 字段本来就是 100G，不在本次改动范围内
UPDATE products
SET name = 'QW-RO-100G-K01',
    slug = 'qw-ro-100g-k01',
    updatedAt = datetime('now')
WHERE sku = 'K01';

-- 9) K01 name 更正（西语翻译；ProductTranslation 没有独立的 slug 字段，
--    西语页面共用英文 products.slug，第 8 步已经改过）
UPDATE product_translations
SET name = 'QW-RO-100G-K01',
    updatedAt = datetime('now')
WHERE productId = (SELECT id FROM products WHERE sku = 'K01') AND locale = 'es';

COMMIT;

-- 执行后校验（应当自动打印以下结果，逐条核对）
SELECT '--- categories ---' AS section;
SELECT id, name, slug, sortOrder FROM product_categories WHERE slug = 'under-sink-ro-water-purifiers';

SELECT '--- category translation ---' AS section;
SELECT categoryId, locale, name FROM product_category_translations
  WHERE categoryId = (SELECT id FROM product_categories WHERE slug = 'under-sink-ro-water-purifiers');

SELECT '--- K01/K02/K03/K04 summary ---' AS section;
SELECT sku, name, slug, categoryId FROM products WHERE sku IN ('K01','K02','K03','K04') ORDER BY sku;

SELECT '--- K01/K03 es translations ---' AS section;
SELECT p.sku, pt.locale, pt.name FROM product_translations pt
  JOIN products p ON p.id = pt.productId
  WHERE p.sku IN ('K01','K03') AND pt.locale = 'es';

SELECT '--- K04 features (en) ---' AS section;
SELECT features FROM products WHERE sku = 'K04';

SELECT '--- K04 features (es) ---' AS section;
SELECT pt.features FROM product_translations pt JOIN products p ON p.id = pt.productId
  WHERE p.sku = 'K04' AND pt.locale = 'es';

SELECT '--- duplicate slug check (expect 0 rows) ---' AS section;
SELECT slug, COUNT(*) c FROM products GROUP BY slug HAVING c > 1;

SELECT '--- foreign_key_check (expect 0 rows) ---' AS section;
PRAGMA foreign_key_check;

SELECT '--- integrity_check (expect "ok") ---' AS section;
PRAGMA integrity_check;
