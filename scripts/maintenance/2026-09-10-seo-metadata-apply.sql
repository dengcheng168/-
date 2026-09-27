-- Generated from docs/audits/seo-metadata-plan-20260910.json.
-- REVIEW ONLY. Back up the database and run on an isolated copy before production.
.bail on
PRAGMA foreign_keys = ON;
BEGIN IMMEDIATE;
CREATE TABLE IF NOT EXISTS seo_metadata_backup_20260910 (
    entityType TEXT NOT NULL,
    slug TEXT NOT NULL,
    locale TEXT NOT NULL,
    oldSeoTitle TEXT,
    oldSeoDescription TEXT,
    backedUpAt TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (entityType, slug, locale)
  );
-- category:commercial-ro-water-purification-systems:en
INSERT OR IGNORE INTO seo_metadata_backup_20260910 (entityType, slug, locale, oldSeoTitle, oldSeoDescription)
SELECT 'category', 'commercial-ro-water-purification-systems', 'en', e.seoTitle, e.seoDescription FROM product_categories e WHERE e.slug='commercial-ro-water-purification-systems';
UPDATE product_categories AS e SET seoTitle='Commercial RO Systems | OEM Manufacturer', updatedAt=datetime('now') WHERE e.id IN (SELECT e.id FROM product_categories e WHERE e.slug='commercial-ro-water-purification-systems');
-- category:countertop-ro-water-purifiers:es
INSERT OR IGNORE INTO seo_metadata_backup_20260910 (entityType, slug, locale, oldSeoTitle, oldSeoDescription)
SELECT 'category', 'countertop-ro-water-purifiers', 'es', e.seoTitle, e.seoDescription FROM product_category_translations e JOIN product_categories p ON p.id=e.categoryId WHERE p.slug='countertop-ro-water-purifiers' AND e.locale='es';
UPDATE product_category_translations AS e SET seoDescription='Explore purificadores de agua RO de sobremesa Li-Men para distribuidores, mayoristas y proyectos OEM/ODM de marca privada.', updatedAt=datetime('now') WHERE e.id IN (SELECT e.id FROM product_category_translations e JOIN product_categories p ON p.id=e.categoryId WHERE p.slug='countertop-ro-water-purifiers' AND e.locale='es');
-- product:600g-tankless-under-sink-ro-water-purifier-with-universal-filters:es
INSERT OR IGNORE INTO seo_metadata_backup_20260910 (entityType, slug, locale, oldSeoTitle, oldSeoDescription)
SELECT 'product', '600g-tankless-under-sink-ro-water-purifier-with-universal-filters', 'es', e.seoTitle, e.seoDescription FROM product_translations e JOIN products p ON p.id=e.productId WHERE p.slug='600g-tankless-under-sink-ro-water-purifier-with-universal-filters' AND e.locale='es';
UPDATE product_translations AS e SET seoTitle='Purificador RO 600G con filtros universales | C05', updatedAt=datetime('now') WHERE e.id IN (SELECT e.id FROM product_translations e JOIN products p ON p.id=e.productId WHERE p.slug='600g-tankless-under-sink-ro-water-purifier-with-universal-filters' AND e.locale='es');
-- product:5-stage-100g-under-sink-ro-water-purifier-with-3-2g-tank:es
INSERT OR IGNORE INTO seo_metadata_backup_20260910 (entityType, slug, locale, oldSeoTitle, oldSeoDescription)
SELECT 'product', '5-stage-100g-under-sink-ro-water-purifier-with-3-2g-tank', 'es', e.seoTitle, e.seoDescription FROM product_translations e JOIN products p ON p.id=e.productId WHERE p.slug='5-stage-100g-under-sink-ro-water-purifier-with-3-2g-tank' AND e.locale='es';
UPDATE product_translations AS e SET seoTitle='Purificador RO 100G de 5 etapas y depósito | A06', updatedAt=datetime('now') WHERE e.id IN (SELECT e.id FROM product_translations e JOIN products p ON p.id=e.productId WHERE p.slug='5-stage-100g-under-sink-ro-water-purifier-with-3-2g-tank' AND e.locale='es');
-- product:100g-countertop-ro-water-purifier-with-touchscreen-temperature-control:es
INSERT OR IGNORE INTO seo_metadata_backup_20260910 (entityType, slug, locale, oldSeoTitle, oldSeoDescription)
SELECT 'product', '100g-countertop-ro-water-purifier-with-touchscreen-temperature-control', 'es', e.seoTitle, e.seoDescription FROM product_translations e JOIN products p ON p.id=e.productId WHERE p.slug='100g-countertop-ro-water-purifier-with-touchscreen-temperature-control' AND e.locale='es';
UPDATE product_translations AS e SET seoTitle='Purificador RO 100G de sobremesa con pantalla | A09', updatedAt=datetime('now') WHERE e.id IN (SELECT e.id FROM product_translations e JOIN products p ON p.id=e.productId WHERE p.slug='100g-countertop-ro-water-purifier-with-touchscreen-temperature-control' AND e.locale='es');
-- product:100g-smart-ro-water-purifier-with-large-touchscreen-optional-ice-maker:en
INSERT OR IGNORE INTO seo_metadata_backup_20260910 (entityType, slug, locale, oldSeoTitle, oldSeoDescription)
SELECT 'product', '100g-smart-ro-water-purifier-with-large-touchscreen-optional-ice-maker', 'en', e.seoTitle, e.seoDescription FROM products e WHERE e.slug='100g-smart-ro-water-purifier-with-large-touchscreen-optional-ice-maker';
UPDATE products AS e SET seoTitle='100G Smart RO Purifier with Ice Option | A10', updatedAt=datetime('now') WHERE e.id IN (SELECT e.id FROM products e WHERE e.slug='100g-smart-ro-water-purifier-with-large-touchscreen-optional-ice-maker');
-- product:100g-smart-ro-water-purifier-with-large-touchscreen-optional-ice-maker:es
INSERT OR IGNORE INTO seo_metadata_backup_20260910 (entityType, slug, locale, oldSeoTitle, oldSeoDescription)
SELECT 'product', '100g-smart-ro-water-purifier-with-large-touchscreen-optional-ice-maker', 'es', e.seoTitle, e.seoDescription FROM product_translations e JOIN products p ON p.id=e.productId WHERE p.slug='100g-smart-ro-water-purifier-with-large-touchscreen-optional-ice-maker' AND e.locale='es';
UPDATE product_translations AS e SET seoTitle='Purificador RO 100G con opción de hielo | A10', updatedAt=datetime('now') WHERE e.id IN (SELECT e.id FROM product_translations e JOIN products p ON p.id=e.productId WHERE p.slug='100g-smart-ro-water-purifier-with-large-touchscreen-optional-ice-maker' AND e.locale='es');
-- product:100g-compact-ro-water-purifier-with-integrated-waterway:es
INSERT OR IGNORE INTO seo_metadata_backup_20260910 (entityType, slug, locale, oldSeoTitle, oldSeoDescription)
SELECT 'product', '100g-compact-ro-water-purifier-with-integrated-waterway', 'es', e.seoTitle, e.seoDescription FROM product_translations e JOIN products p ON p.id=e.productId WHERE p.slug='100g-compact-ro-water-purifier-with-integrated-waterway' AND e.locale='es';
UPDATE product_translations AS e SET seoTitle='Purificador RO 100G con circuito integrado | M01', updatedAt=datetime('now') WHERE e.id IN (SELECT e.id FROM product_translations e JOIN products p ON p.id=e.productId WHERE p.slug='100g-compact-ro-water-purifier-with-integrated-waterway' AND e.locale='es');
-- product:100g-800g-multi-flow-under-sink-ro-water-purifier:es
INSERT OR IGNORE INTO seo_metadata_backup_20260910 (entityType, slug, locale, oldSeoTitle, oldSeoDescription)
SELECT 'product', '100g-800g-multi-flow-under-sink-ro-water-purifier', 'es', e.seoTitle, e.seoDescription FROM product_translations e JOIN products p ON p.id=e.productId WHERE p.slug='100g-800g-multi-flow-under-sink-ro-water-purifier' AND e.locale='es';
UPDATE product_translations AS e SET seoTitle='Purificador RO multicaudal 100G–800G | M13', updatedAt=datetime('now') WHERE e.id IN (SELECT e.id FROM product_translations e JOIN products p ON p.id=e.productId WHERE p.slug='100g-800g-multi-flow-under-sink-ro-water-purifier' AND e.locale='es');
-- product:600g-800g-compact-high-flow-tankless-ro-water-purifier:es
INSERT OR IGNORE INTO seo_metadata_backup_20260910 (entityType, slug, locale, oldSeoTitle, oldSeoDescription)
SELECT 'product', '600g-800g-compact-high-flow-tankless-ro-water-purifier', 'es', e.seoTitle, e.seoDescription FROM product_translations e JOIN products p ON p.id=e.productId WHERE p.slug='600g-800g-compact-high-flow-tankless-ro-water-purifier' AND e.locale='es';
UPDATE product_translations AS e SET seoDescription='Purificador RO M18 compacto de 600G–800G con caudal de 1,57–2,1 L/min, pantalla a color y cuerpo de 165 mm para proyectos OEM/ODM.', updatedAt=datetime('now') WHERE e.id IN (SELECT e.id FROM product_translations e JOIN products p ON p.id=e.productId WHERE p.slug='600g-800g-compact-high-flow-tankless-ro-water-purifier' AND e.locale='es');
-- product:100g-800g-smart-four-cartridge-ro-water-purifier-series:es
INSERT OR IGNORE INTO seo_metadata_backup_20260910 (entityType, slug, locale, oldSeoTitle, oldSeoDescription)
SELECT 'product', '100g-800g-smart-four-cartridge-ro-water-purifier-series', 'es', e.seoTitle, e.seoDescription FROM product_translations e JOIN products p ON p.id=e.productId WHERE p.slug='100g-800g-smart-four-cartridge-ro-water-purifier-series' AND e.locale='es';
UPDATE product_translations AS e SET seoDescription='Serie RO M19 de 100G, 600G y 800G con pantalla TDS a color, cuatro cartuchos y bomba integrada para distribuidores y proyectos OEM/ODM.', updatedAt=datetime('now') WHERE e.id IN (SELECT e.id FROM product_translations e JOIN products p ON p.id=e.productId WHERE p.slug='100g-800g-smart-four-cartridge-ro-water-purifier-series' AND e.locale='es');
-- product:5-stage-compact-ultrafiltration-water-purifier-with-backwash:es
INSERT OR IGNORE INTO seo_metadata_backup_20260910 (entityType, slug, locale, oldSeoTitle, oldSeoDescription)
SELECT 'product', '5-stage-compact-ultrafiltration-water-purifier-with-backwash', 'es', e.seoTitle, e.seoDescription FROM product_translations e JOIN products p ON p.id=e.productId WHERE p.slug='5-stage-compact-ultrafiltration-water-purifier-with-backwash' AND e.locale='es';
UPDATE product_translations AS e SET seoTitle='Purificador UF con retrolavado de 5 etapas | A11', updatedAt=datetime('now') WHERE e.id IN (SELECT e.id FROM product_translations e JOIN products p ON p.id=e.productId WHERE p.slug='5-stage-compact-ultrafiltration-water-purifier-with-backwash' AND e.locale='es');
-- product:15-inch-dual-stage-high-flow-water-filter-system:es
INSERT OR IGNORE INTO seo_metadata_backup_20260910 (entityType, slug, locale, oldSeoTitle, oldSeoDescription)
SELECT 'product', '15-inch-dual-stage-high-flow-water-filter-system', 'es', e.seoTitle, e.seoDescription FROM product_translations e JOIN products p ON p.id=e.productId WHERE p.slug='15-inch-dual-stage-high-flow-water-filter-system' AND e.locale='es';
UPDATE product_translations AS e SET seoDescription='Filtro D01 de 15 pulgadas y 2 etapas con PP ranurado, bloque de carbón y caudal de 4–6 L/min para distribuidores y proyectos OEM/ODM.', updatedAt=datetime('now') WHERE e.id IN (SELECT e.id FROM product_translations e JOIN products p ON p.id=e.productId WHERE p.slug='15-inch-dual-stage-high-flow-water-filter-system' AND e.locale='es');
-- product:15-inch-three-stage-high-flow-water-filter-system:es
INSERT OR IGNORE INTO seo_metadata_backup_20260910 (entityType, slug, locale, oldSeoTitle, oldSeoDescription)
SELECT 'product', '15-inch-three-stage-high-flow-water-filter-system', 'es', e.seoTitle, e.seoDescription FROM product_translations e JOIN products p ON p.id=e.productId WHERE p.slug='15-inch-three-stage-high-flow-water-filter-system' AND e.locale='es';
UPDATE product_translations AS e SET seoDescription='Filtro D02 de 15 pulgadas y 3 etapas con medios PP, UDF y CTO, caudal de 6–8 L/min y capacidad de 4.000 L para proyectos OEM/ODM.', updatedAt=datetime('now') WHERE e.id IN (SELECT e.id FROM product_translations e JOIN products p ON p.id=e.productId WHERE p.slug='15-inch-three-stage-high-flow-water-filter-system' AND e.locale='es');
-- product:15-inch-four-stage-ultrafiltration-water-purifier:en
INSERT OR IGNORE INTO seo_metadata_backup_20260910 (entityType, slug, locale, oldSeoTitle, oldSeoDescription)
SELECT 'product', '15-inch-four-stage-ultrafiltration-water-purifier', 'en', e.seoTitle, e.seoDescription FROM products e WHERE e.slug='15-inch-four-stage-ultrafiltration-water-purifier';
UPDATE products AS e SET seoDescription='D03 four-stage UF purifier with PP, CTO, hollow-fiber UF and UDF filters, 8–10 L/min flow and 4,000 L capacity for OEM/ODM projects.', updatedAt=datetime('now') WHERE e.id IN (SELECT e.id FROM products e WHERE e.slug='15-inch-four-stage-ultrafiltration-water-purifier');
-- product:15-inch-four-stage-ultrafiltration-water-purifier:es
INSERT OR IGNORE INTO seo_metadata_backup_20260910 (entityType, slug, locale, oldSeoTitle, oldSeoDescription)
SELECT 'product', '15-inch-four-stage-ultrafiltration-water-purifier', 'es', e.seoTitle, e.seoDescription FROM product_translations e JOIN products p ON p.id=e.productId WHERE p.slug='15-inch-four-stage-ultrafiltration-water-purifier' AND e.locale='es';
UPDATE product_translations AS e SET seoDescription='Purificador UF D03 de 4 etapas con PP, CTO, fibra hueca y UDF, caudal de 8–10 L/min y capacidad de 4.000 L para proyectos OEM/ODM.', updatedAt=datetime('now') WHERE e.id IN (SELECT e.id FROM product_translations e JOIN products p ON p.id=e.productId WHERE p.slug='15-inch-four-stage-ultrafiltration-water-purifier' AND e.locale='es');
-- product:20-inch-2-stage-ultrafiltration-water-purifier:en
INSERT OR IGNORE INTO seo_metadata_backup_20260910 (entityType, slug, locale, oldSeoTitle, oldSeoDescription)
SELECT 'product', '20-inch-2-stage-ultrafiltration-water-purifier', 'en', e.seoTitle, e.seoDescription FROM products e WHERE e.slug='20-inch-2-stage-ultrafiltration-water-purifier';
UPDATE products AS e SET seoDescription='D05 20-inch two-stage UF purifier with composite and UF filters, delivering 5–10 L/min flow for commercial, household and OEM projects.', updatedAt=datetime('now') WHERE e.id IN (SELECT e.id FROM products e WHERE e.slug='20-inch-2-stage-ultrafiltration-water-purifier');
-- product:20-inch-4-stage-ultrafiltration-water-purifier-2:es
INSERT OR IGNORE INTO seo_metadata_backup_20260910 (entityType, slug, locale, oldSeoTitle, oldSeoDescription)
SELECT 'product', '20-inch-4-stage-ultrafiltration-water-purifier-2', 'es', e.seoTitle, e.seoDescription FROM product_translations e JOIN products p ON p.id=e.productId WHERE p.slug='20-inch-4-stage-ultrafiltration-water-purifier-2' AND e.locale='es';
UPDATE product_translations AS e SET seoDescription='Purificador UF D07 de 20 pulgadas y 4 etapas con PP, CTO, UF y carbón, y caudal de 15–20 L/min para aplicaciones comerciales OEM/ODM.', updatedAt=datetime('now') WHERE e.id IN (SELECT e.id FROM product_translations e JOIN products p ON p.id=e.productId WHERE p.slug='20-inch-4-stage-ultrafiltration-water-purifier-2' AND e.locale='es');
-- product:20-inch-5-stage-ultrafiltration-water-purifier:en
INSERT OR IGNORE INTO seo_metadata_backup_20260910 (entityType, slug, locale, oldSeoTitle, oldSeoDescription)
SELECT 'product', '20-inch-5-stage-ultrafiltration-water-purifier', 'en', e.seoTitle, e.seoDescription FROM products e WHERE e.slug='20-inch-5-stage-ultrafiltration-water-purifier';
UPDATE products AS e SET seoDescription='D08 20-inch five-stage UF purifier with PC, UF and carbon filtration, delivering 15–20 L/min flow for commercial and high-demand projects.', updatedAt=datetime('now') WHERE e.id IN (SELECT e.id FROM products e WHERE e.slug='20-inch-5-stage-ultrafiltration-water-purifier');
-- product:20-inch-5-stage-ultrafiltration-water-purifier:es
INSERT OR IGNORE INTO seo_metadata_backup_20260910 (entityType, slug, locale, oldSeoTitle, oldSeoDescription)
SELECT 'product', '20-inch-5-stage-ultrafiltration-water-purifier', 'es', e.seoTitle, e.seoDescription FROM product_translations e JOIN products p ON p.id=e.productId WHERE p.slug='20-inch-5-stage-ultrafiltration-water-purifier' AND e.locale='es';
UPDATE product_translations AS e SET seoDescription='Purificador UF D08 de 20 pulgadas y 5 etapas con caudal de 15–20 L/min para aplicaciones comerciales de alta demanda y proyectos OEM/ODM.', updatedAt=datetime('now') WHERE e.id IN (SELECT e.id FROM product_translations e JOIN products p ON p.id=e.productId WHERE p.slug='20-inch-5-stage-ultrafiltration-water-purifier' AND e.locale='es');
-- product:1000g-under-sink-ro-water-purifier:en
INSERT OR IGNORE INTO seo_metadata_backup_20260910 (entityType, slug, locale, oldSeoTitle, oldSeoDescription)
SELECT 'product', '1000g-under-sink-ro-water-purifier', 'en', e.seoTitle, e.seoDescription FROM products e WHERE e.slug='1000g-under-sink-ro-water-purifier';
UPDATE products AS e SET seoDescription='A03 1000G under-sink RO purifier with a high-performance membrane, low-noise pump and single or dual-outlet faucet options for OEM projects.', updatedAt=datetime('now') WHERE e.id IN (SELECT e.id FROM products e WHERE e.slug='1000g-under-sink-ro-water-purifier');
-- product:under-sink-ro-water-purifier-400g-600g-800g:es
INSERT OR IGNORE INTO seo_metadata_backup_20260910 (entityType, slug, locale, oldSeoTitle, oldSeoDescription)
SELECT 'product', 'under-sink-ro-water-purifier-400g-600g-800g', 'es', e.seoTitle, e.seoDescription FROM product_translations e JOIN products p ON p.id=e.productId WHERE p.slug='under-sink-ro-water-purifier-400g-600g-800g' AND e.locale='es';
UPDATE product_translations AS e SET seoDescription='Purificador RO D10 bajo fregadero de 400G, 600G y 800G con membrana de 0,0001 micras para distribuidores y proyectos OEM/ODM.', updatedAt=datetime('now') WHERE e.id IN (SELECT e.id FROM product_translations e JOIN products p ON p.id=e.productId WHERE p.slug='under-sink-ro-water-purifier-400g-600g-800g' AND e.locale='es');
-- product:316l-stainless-steel-high-flow-whole-house-pre-filter:es
INSERT OR IGNORE INTO seo_metadata_backup_20260910 (entityType, slug, locale, oldSeoTitle, oldSeoDescription)
SELECT 'product', '316l-stainless-steel-high-flow-whole-house-pre-filter', 'es', e.seoTitle, e.seoDescription FROM product_translations e JOIN products p ON p.id=e.productId WHERE p.slug='316l-stainless-steel-high-flow-whole-house-pre-filter' AND e.locale='es';
UPDATE product_translations AS e SET seoDescription='Prefiltro M24 con malla 316L, filtración de 30–50 micras, caudal de 4–8 m³/h y conexiones configurables para proyectos OEM/ODM.', updatedAt=datetime('now') WHERE e.id IN (SELECT e.id FROM product_translations e JOIN products p ON p.id=e.productId WHERE p.slug='316l-stainless-steel-high-flow-whole-house-pre-filter' AND e.locale='es');
-- product:316l-stainless-steel-whole-house-pre-filter-2:es
INSERT OR IGNORE INTO seo_metadata_backup_20260910 (entityType, slug, locale, oldSeoTitle, oldSeoDescription)
SELECT 'product', '316l-stainless-steel-whole-house-pre-filter-2', 'es', e.seoTitle, e.seoDescription FROM product_translations e JOIN products p ON p.id=e.productId WHERE p.slug='316l-stainless-steel-whole-house-pre-filter-2' AND e.locale='es';
UPDATE product_translations AS e SET seoDescription='Prefiltro M25 con malla 316L, filtración de 30–50 micras, caudal de 4–7 m³/h y conexión de 1 pulgada para distribuidores y OEM/ODM.', updatedAt=datetime('now') WHERE e.id IN (SELECT e.id FROM product_translations e JOIN products p ON p.id=e.productId WHERE p.slug='316l-stainless-steel-whole-house-pre-filter-2' AND e.locale='es');
-- product:commercial-ro-water-purification-system-1200g-3600g:en
INSERT OR IGNORE INTO seo_metadata_backup_20260910 (entityType, slug, locale, oldSeoTitle, oldSeoDescription)
SELECT 'product', 'commercial-ro-water-purification-system-1200g-3600g', 'en', e.seoTitle, e.seoDescription FROM products e WHERE e.slug='commercial-ro-water-purification-system-1200g-3600g';
UPDATE products AS e SET seoTitle='1200G–3600G Commercial RO System | D12', seoDescription='D12 commercial RO system in 1200G–3600G capacities with 0.0001-micron membrane filtration for high-demand facilities and OEM projects.', updatedAt=datetime('now') WHERE e.id IN (SELECT e.id FROM products e WHERE e.slug='commercial-ro-water-purification-system-1200g-3600g');
-- product:commercial-ro-water-purification-system-1200g-3600g:es
INSERT OR IGNORE INTO seo_metadata_backup_20260910 (entityType, slug, locale, oldSeoTitle, oldSeoDescription)
SELECT 'product', 'commercial-ro-water-purification-system-1200g-3600g', 'es', e.seoTitle, e.seoDescription FROM product_translations e JOIN products p ON p.id=e.productId WHERE p.slug='commercial-ro-water-purification-system-1200g-3600g' AND e.locale='es';
UPDATE product_translations AS e SET seoDescription='Sistema comercial RO D12 de 1200G–3600G con membrana de 0,0001 micras para instalaciones de alta demanda y proyectos OEM/ODM.', updatedAt=datetime('now') WHERE e.id IN (SELECT e.id FROM product_translations e JOIN products p ON p.id=e.productId WHERE p.slug='commercial-ro-water-purification-system-1200g-3600g' AND e.locale='es');
-- product:commercial-ro-water-purification-system-800g-1600g:en
INSERT OR IGNORE INTO seo_metadata_backup_20260910 (entityType, slug, locale, oldSeoTitle, oldSeoDescription)
SELECT 'product', 'commercial-ro-water-purification-system-800g-1600g', 'en', e.seoTitle, e.seoDescription FROM products e WHERE e.slug='commercial-ro-water-purification-system-800g-1600g';
UPDATE products AS e SET seoDescription='D13 commercial RO system with 800G, 1200G and 1600G options and 0.0001-micron membrane filtration for high-demand commercial projects.', updatedAt=datetime('now') WHERE e.id IN (SELECT e.id FROM products e WHERE e.slug='commercial-ro-water-purification-system-800g-1600g');
-- product:commercial-ro-water-purification-system-800g-1600g:es
INSERT OR IGNORE INTO seo_metadata_backup_20260910 (entityType, slug, locale, oldSeoTitle, oldSeoDescription)
SELECT 'product', 'commercial-ro-water-purification-system-800g-1600g', 'es', e.seoTitle, e.seoDescription FROM product_translations e JOIN products p ON p.id=e.productId WHERE p.slug='commercial-ro-water-purification-system-800g-1600g' AND e.locale='es';
UPDATE product_translations AS e SET seoDescription='Sistema comercial RO D13 de 800G–1600G con membrana de 0,0001 micras para instalaciones de alta demanda y proyectos OEM/ODM.', updatedAt=datetime('now') WHERE e.id IN (SELECT e.id FROM product_translations e JOIN products p ON p.id=e.productId WHERE p.slug='commercial-ro-water-purification-system-800g-1600g' AND e.locale='es');
-- blog:li-men-explores-global-e-commerce-opportunities-at-shenzhen-cross-border-e-commerce-exhibition:en
INSERT OR IGNORE INTO seo_metadata_backup_20260910 (entityType, slug, locale, oldSeoTitle, oldSeoDescription)
SELECT 'blog', 'li-men-explores-global-e-commerce-opportunities-at-shenzhen-cross-border-e-commerce-exhibition', 'en', e.seoTitle, e.seoDescription FROM blog_posts e WHERE e.slug='li-men-explores-global-e-commerce-opportunities-at-shenzhen-cross-border-e-commerce-exhibition';
UPDATE blog_posts AS e SET seoTitle='Li-Men at Shenzhen E-Commerce Exhibition | Water OEM', seoDescription='Li-Men attended a Shenzhen cross-border e-commerce exhibition to explore export, logistics and OEM/ODM opportunities with global water purifier buyers.', updatedAt=datetime('now') WHERE e.id IN (SELECT e.id FROM blog_posts e WHERE e.slug='li-men-explores-global-e-commerce-opportunities-at-shenzhen-cross-border-e-commerce-exhibition');
-- blog:from-manufacturing-to-global-markets-how-an-integrated-water-purifier-factory-creates-long-term-value:es
INSERT OR IGNORE INTO seo_metadata_backup_20260910 (entityType, slug, locale, oldSeoTitle, oldSeoDescription)
SELECT 'blog', 'from-manufacturing-to-global-markets-how-an-integrated-water-purifier-factory-creates-long-term-value', 'es', e.seoTitle, e.seoDescription FROM blog_post_translations e JOIN blog_posts p ON p.id=e.postId WHERE p.slug='from-manufacturing-to-global-markets-how-an-integrated-water-purifier-factory-creates-long-term-value' AND e.locale='es';
UPDATE blog_post_translations AS e SET seoDescription='Conozca cómo Li-Men integra fabricación, control de calidad, personalización OEM/ODM y exportación para distribuidores y marcas de purificación de agua.', updatedAt=datetime('now') WHERE e.id IN (SELECT e.id FROM blog_post_translations e JOIN blog_posts p ON p.id=e.postId WHERE p.slug='from-manufacturing-to-global-markets-how-an-integrated-water-purifier-factory-creates-long-term-value' AND e.locale='es');
COMMIT;
SELECT 'backup rows', COUNT(*) FROM seo_metadata_backup_20260910;
PRAGMA foreign_key_check;
PRAGMA integrity_check;
