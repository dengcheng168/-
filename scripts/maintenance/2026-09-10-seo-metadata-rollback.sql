-- Roll back only the 2026-09-10 SEO metadata batch from its captured values.
.bail on
PRAGMA foreign_keys = ON;
BEGIN IMMEDIATE;
-- blog:from-manufacturing-to-global-markets-how-an-integrated-water-purifier-factory-creates-long-term-value:es
UPDATE blog_post_translations AS e SET
  seoTitle=(SELECT oldSeoTitle FROM seo_metadata_backup_20260910 WHERE entityType='blog' AND slug='from-manufacturing-to-global-markets-how-an-integrated-water-purifier-factory-creates-long-term-value' AND locale='es'),
  seoDescription=(SELECT oldSeoDescription FROM seo_metadata_backup_20260910 WHERE entityType='blog' AND slug='from-manufacturing-to-global-markets-how-an-integrated-water-purifier-factory-creates-long-term-value' AND locale='es'),
  updatedAt=datetime('now')
WHERE e.id IN (SELECT e.id FROM blog_post_translations e JOIN blog_posts p ON p.id=e.postId WHERE p.slug='from-manufacturing-to-global-markets-how-an-integrated-water-purifier-factory-creates-long-term-value' AND e.locale='es')
  AND EXISTS (SELECT 1 FROM seo_metadata_backup_20260910 WHERE entityType='blog' AND slug='from-manufacturing-to-global-markets-how-an-integrated-water-purifier-factory-creates-long-term-value' AND locale='es');
-- blog:li-men-explores-global-e-commerce-opportunities-at-shenzhen-cross-border-e-commerce-exhibition:en
UPDATE blog_posts AS e SET
  seoTitle=(SELECT oldSeoTitle FROM seo_metadata_backup_20260910 WHERE entityType='blog' AND slug='li-men-explores-global-e-commerce-opportunities-at-shenzhen-cross-border-e-commerce-exhibition' AND locale='en'),
  seoDescription=(SELECT oldSeoDescription FROM seo_metadata_backup_20260910 WHERE entityType='blog' AND slug='li-men-explores-global-e-commerce-opportunities-at-shenzhen-cross-border-e-commerce-exhibition' AND locale='en'),
  updatedAt=datetime('now')
WHERE e.id IN (SELECT e.id FROM blog_posts e WHERE e.slug='li-men-explores-global-e-commerce-opportunities-at-shenzhen-cross-border-e-commerce-exhibition')
  AND EXISTS (SELECT 1 FROM seo_metadata_backup_20260910 WHERE entityType='blog' AND slug='li-men-explores-global-e-commerce-opportunities-at-shenzhen-cross-border-e-commerce-exhibition' AND locale='en');
-- product:commercial-ro-water-purification-system-800g-1600g:es
UPDATE product_translations AS e SET
  seoTitle=(SELECT oldSeoTitle FROM seo_metadata_backup_20260910 WHERE entityType='product' AND slug='commercial-ro-water-purification-system-800g-1600g' AND locale='es'),
  seoDescription=(SELECT oldSeoDescription FROM seo_metadata_backup_20260910 WHERE entityType='product' AND slug='commercial-ro-water-purification-system-800g-1600g' AND locale='es'),
  updatedAt=datetime('now')
WHERE e.id IN (SELECT e.id FROM product_translations e JOIN products p ON p.id=e.productId WHERE p.slug='commercial-ro-water-purification-system-800g-1600g' AND e.locale='es')
  AND EXISTS (SELECT 1 FROM seo_metadata_backup_20260910 WHERE entityType='product' AND slug='commercial-ro-water-purification-system-800g-1600g' AND locale='es');
-- product:commercial-ro-water-purification-system-800g-1600g:en
UPDATE products AS e SET
  seoTitle=(SELECT oldSeoTitle FROM seo_metadata_backup_20260910 WHERE entityType='product' AND slug='commercial-ro-water-purification-system-800g-1600g' AND locale='en'),
  seoDescription=(SELECT oldSeoDescription FROM seo_metadata_backup_20260910 WHERE entityType='product' AND slug='commercial-ro-water-purification-system-800g-1600g' AND locale='en'),
  updatedAt=datetime('now')
WHERE e.id IN (SELECT e.id FROM products e WHERE e.slug='commercial-ro-water-purification-system-800g-1600g')
  AND EXISTS (SELECT 1 FROM seo_metadata_backup_20260910 WHERE entityType='product' AND slug='commercial-ro-water-purification-system-800g-1600g' AND locale='en');
-- product:commercial-ro-water-purification-system-1200g-3600g:es
UPDATE product_translations AS e SET
  seoTitle=(SELECT oldSeoTitle FROM seo_metadata_backup_20260910 WHERE entityType='product' AND slug='commercial-ro-water-purification-system-1200g-3600g' AND locale='es'),
  seoDescription=(SELECT oldSeoDescription FROM seo_metadata_backup_20260910 WHERE entityType='product' AND slug='commercial-ro-water-purification-system-1200g-3600g' AND locale='es'),
  updatedAt=datetime('now')
WHERE e.id IN (SELECT e.id FROM product_translations e JOIN products p ON p.id=e.productId WHERE p.slug='commercial-ro-water-purification-system-1200g-3600g' AND e.locale='es')
  AND EXISTS (SELECT 1 FROM seo_metadata_backup_20260910 WHERE entityType='product' AND slug='commercial-ro-water-purification-system-1200g-3600g' AND locale='es');
-- product:commercial-ro-water-purification-system-1200g-3600g:en
UPDATE products AS e SET
  seoTitle=(SELECT oldSeoTitle FROM seo_metadata_backup_20260910 WHERE entityType='product' AND slug='commercial-ro-water-purification-system-1200g-3600g' AND locale='en'),
  seoDescription=(SELECT oldSeoDescription FROM seo_metadata_backup_20260910 WHERE entityType='product' AND slug='commercial-ro-water-purification-system-1200g-3600g' AND locale='en'),
  updatedAt=datetime('now')
WHERE e.id IN (SELECT e.id FROM products e WHERE e.slug='commercial-ro-water-purification-system-1200g-3600g')
  AND EXISTS (SELECT 1 FROM seo_metadata_backup_20260910 WHERE entityType='product' AND slug='commercial-ro-water-purification-system-1200g-3600g' AND locale='en');
-- product:316l-stainless-steel-whole-house-pre-filter-2:es
UPDATE product_translations AS e SET
  seoTitle=(SELECT oldSeoTitle FROM seo_metadata_backup_20260910 WHERE entityType='product' AND slug='316l-stainless-steel-whole-house-pre-filter-2' AND locale='es'),
  seoDescription=(SELECT oldSeoDescription FROM seo_metadata_backup_20260910 WHERE entityType='product' AND slug='316l-stainless-steel-whole-house-pre-filter-2' AND locale='es'),
  updatedAt=datetime('now')
WHERE e.id IN (SELECT e.id FROM product_translations e JOIN products p ON p.id=e.productId WHERE p.slug='316l-stainless-steel-whole-house-pre-filter-2' AND e.locale='es')
  AND EXISTS (SELECT 1 FROM seo_metadata_backup_20260910 WHERE entityType='product' AND slug='316l-stainless-steel-whole-house-pre-filter-2' AND locale='es');
-- product:316l-stainless-steel-high-flow-whole-house-pre-filter:es
UPDATE product_translations AS e SET
  seoTitle=(SELECT oldSeoTitle FROM seo_metadata_backup_20260910 WHERE entityType='product' AND slug='316l-stainless-steel-high-flow-whole-house-pre-filter' AND locale='es'),
  seoDescription=(SELECT oldSeoDescription FROM seo_metadata_backup_20260910 WHERE entityType='product' AND slug='316l-stainless-steel-high-flow-whole-house-pre-filter' AND locale='es'),
  updatedAt=datetime('now')
WHERE e.id IN (SELECT e.id FROM product_translations e JOIN products p ON p.id=e.productId WHERE p.slug='316l-stainless-steel-high-flow-whole-house-pre-filter' AND e.locale='es')
  AND EXISTS (SELECT 1 FROM seo_metadata_backup_20260910 WHERE entityType='product' AND slug='316l-stainless-steel-high-flow-whole-house-pre-filter' AND locale='es');
-- product:under-sink-ro-water-purifier-400g-600g-800g:es
UPDATE product_translations AS e SET
  seoTitle=(SELECT oldSeoTitle FROM seo_metadata_backup_20260910 WHERE entityType='product' AND slug='under-sink-ro-water-purifier-400g-600g-800g' AND locale='es'),
  seoDescription=(SELECT oldSeoDescription FROM seo_metadata_backup_20260910 WHERE entityType='product' AND slug='under-sink-ro-water-purifier-400g-600g-800g' AND locale='es'),
  updatedAt=datetime('now')
WHERE e.id IN (SELECT e.id FROM product_translations e JOIN products p ON p.id=e.productId WHERE p.slug='under-sink-ro-water-purifier-400g-600g-800g' AND e.locale='es')
  AND EXISTS (SELECT 1 FROM seo_metadata_backup_20260910 WHERE entityType='product' AND slug='under-sink-ro-water-purifier-400g-600g-800g' AND locale='es');
-- product:1000g-under-sink-ro-water-purifier:en
UPDATE products AS e SET
  seoTitle=(SELECT oldSeoTitle FROM seo_metadata_backup_20260910 WHERE entityType='product' AND slug='1000g-under-sink-ro-water-purifier' AND locale='en'),
  seoDescription=(SELECT oldSeoDescription FROM seo_metadata_backup_20260910 WHERE entityType='product' AND slug='1000g-under-sink-ro-water-purifier' AND locale='en'),
  updatedAt=datetime('now')
WHERE e.id IN (SELECT e.id FROM products e WHERE e.slug='1000g-under-sink-ro-water-purifier')
  AND EXISTS (SELECT 1 FROM seo_metadata_backup_20260910 WHERE entityType='product' AND slug='1000g-under-sink-ro-water-purifier' AND locale='en');
-- product:20-inch-5-stage-ultrafiltration-water-purifier:es
UPDATE product_translations AS e SET
  seoTitle=(SELECT oldSeoTitle FROM seo_metadata_backup_20260910 WHERE entityType='product' AND slug='20-inch-5-stage-ultrafiltration-water-purifier' AND locale='es'),
  seoDescription=(SELECT oldSeoDescription FROM seo_metadata_backup_20260910 WHERE entityType='product' AND slug='20-inch-5-stage-ultrafiltration-water-purifier' AND locale='es'),
  updatedAt=datetime('now')
WHERE e.id IN (SELECT e.id FROM product_translations e JOIN products p ON p.id=e.productId WHERE p.slug='20-inch-5-stage-ultrafiltration-water-purifier' AND e.locale='es')
  AND EXISTS (SELECT 1 FROM seo_metadata_backup_20260910 WHERE entityType='product' AND slug='20-inch-5-stage-ultrafiltration-water-purifier' AND locale='es');
-- product:20-inch-5-stage-ultrafiltration-water-purifier:en
UPDATE products AS e SET
  seoTitle=(SELECT oldSeoTitle FROM seo_metadata_backup_20260910 WHERE entityType='product' AND slug='20-inch-5-stage-ultrafiltration-water-purifier' AND locale='en'),
  seoDescription=(SELECT oldSeoDescription FROM seo_metadata_backup_20260910 WHERE entityType='product' AND slug='20-inch-5-stage-ultrafiltration-water-purifier' AND locale='en'),
  updatedAt=datetime('now')
WHERE e.id IN (SELECT e.id FROM products e WHERE e.slug='20-inch-5-stage-ultrafiltration-water-purifier')
  AND EXISTS (SELECT 1 FROM seo_metadata_backup_20260910 WHERE entityType='product' AND slug='20-inch-5-stage-ultrafiltration-water-purifier' AND locale='en');
-- product:20-inch-4-stage-ultrafiltration-water-purifier-2:es
UPDATE product_translations AS e SET
  seoTitle=(SELECT oldSeoTitle FROM seo_metadata_backup_20260910 WHERE entityType='product' AND slug='20-inch-4-stage-ultrafiltration-water-purifier-2' AND locale='es'),
  seoDescription=(SELECT oldSeoDescription FROM seo_metadata_backup_20260910 WHERE entityType='product' AND slug='20-inch-4-stage-ultrafiltration-water-purifier-2' AND locale='es'),
  updatedAt=datetime('now')
WHERE e.id IN (SELECT e.id FROM product_translations e JOIN products p ON p.id=e.productId WHERE p.slug='20-inch-4-stage-ultrafiltration-water-purifier-2' AND e.locale='es')
  AND EXISTS (SELECT 1 FROM seo_metadata_backup_20260910 WHERE entityType='product' AND slug='20-inch-4-stage-ultrafiltration-water-purifier-2' AND locale='es');
-- product:20-inch-2-stage-ultrafiltration-water-purifier:en
UPDATE products AS e SET
  seoTitle=(SELECT oldSeoTitle FROM seo_metadata_backup_20260910 WHERE entityType='product' AND slug='20-inch-2-stage-ultrafiltration-water-purifier' AND locale='en'),
  seoDescription=(SELECT oldSeoDescription FROM seo_metadata_backup_20260910 WHERE entityType='product' AND slug='20-inch-2-stage-ultrafiltration-water-purifier' AND locale='en'),
  updatedAt=datetime('now')
WHERE e.id IN (SELECT e.id FROM products e WHERE e.slug='20-inch-2-stage-ultrafiltration-water-purifier')
  AND EXISTS (SELECT 1 FROM seo_metadata_backup_20260910 WHERE entityType='product' AND slug='20-inch-2-stage-ultrafiltration-water-purifier' AND locale='en');
-- product:15-inch-four-stage-ultrafiltration-water-purifier:es
UPDATE product_translations AS e SET
  seoTitle=(SELECT oldSeoTitle FROM seo_metadata_backup_20260910 WHERE entityType='product' AND slug='15-inch-four-stage-ultrafiltration-water-purifier' AND locale='es'),
  seoDescription=(SELECT oldSeoDescription FROM seo_metadata_backup_20260910 WHERE entityType='product' AND slug='15-inch-four-stage-ultrafiltration-water-purifier' AND locale='es'),
  updatedAt=datetime('now')
WHERE e.id IN (SELECT e.id FROM product_translations e JOIN products p ON p.id=e.productId WHERE p.slug='15-inch-four-stage-ultrafiltration-water-purifier' AND e.locale='es')
  AND EXISTS (SELECT 1 FROM seo_metadata_backup_20260910 WHERE entityType='product' AND slug='15-inch-four-stage-ultrafiltration-water-purifier' AND locale='es');
-- product:15-inch-four-stage-ultrafiltration-water-purifier:en
UPDATE products AS e SET
  seoTitle=(SELECT oldSeoTitle FROM seo_metadata_backup_20260910 WHERE entityType='product' AND slug='15-inch-four-stage-ultrafiltration-water-purifier' AND locale='en'),
  seoDescription=(SELECT oldSeoDescription FROM seo_metadata_backup_20260910 WHERE entityType='product' AND slug='15-inch-four-stage-ultrafiltration-water-purifier' AND locale='en'),
  updatedAt=datetime('now')
WHERE e.id IN (SELECT e.id FROM products e WHERE e.slug='15-inch-four-stage-ultrafiltration-water-purifier')
  AND EXISTS (SELECT 1 FROM seo_metadata_backup_20260910 WHERE entityType='product' AND slug='15-inch-four-stage-ultrafiltration-water-purifier' AND locale='en');
-- product:15-inch-three-stage-high-flow-water-filter-system:es
UPDATE product_translations AS e SET
  seoTitle=(SELECT oldSeoTitle FROM seo_metadata_backup_20260910 WHERE entityType='product' AND slug='15-inch-three-stage-high-flow-water-filter-system' AND locale='es'),
  seoDescription=(SELECT oldSeoDescription FROM seo_metadata_backup_20260910 WHERE entityType='product' AND slug='15-inch-three-stage-high-flow-water-filter-system' AND locale='es'),
  updatedAt=datetime('now')
WHERE e.id IN (SELECT e.id FROM product_translations e JOIN products p ON p.id=e.productId WHERE p.slug='15-inch-three-stage-high-flow-water-filter-system' AND e.locale='es')
  AND EXISTS (SELECT 1 FROM seo_metadata_backup_20260910 WHERE entityType='product' AND slug='15-inch-three-stage-high-flow-water-filter-system' AND locale='es');
-- product:15-inch-dual-stage-high-flow-water-filter-system:es
UPDATE product_translations AS e SET
  seoTitle=(SELECT oldSeoTitle FROM seo_metadata_backup_20260910 WHERE entityType='product' AND slug='15-inch-dual-stage-high-flow-water-filter-system' AND locale='es'),
  seoDescription=(SELECT oldSeoDescription FROM seo_metadata_backup_20260910 WHERE entityType='product' AND slug='15-inch-dual-stage-high-flow-water-filter-system' AND locale='es'),
  updatedAt=datetime('now')
WHERE e.id IN (SELECT e.id FROM product_translations e JOIN products p ON p.id=e.productId WHERE p.slug='15-inch-dual-stage-high-flow-water-filter-system' AND e.locale='es')
  AND EXISTS (SELECT 1 FROM seo_metadata_backup_20260910 WHERE entityType='product' AND slug='15-inch-dual-stage-high-flow-water-filter-system' AND locale='es');
-- product:5-stage-compact-ultrafiltration-water-purifier-with-backwash:es
UPDATE product_translations AS e SET
  seoTitle=(SELECT oldSeoTitle FROM seo_metadata_backup_20260910 WHERE entityType='product' AND slug='5-stage-compact-ultrafiltration-water-purifier-with-backwash' AND locale='es'),
  seoDescription=(SELECT oldSeoDescription FROM seo_metadata_backup_20260910 WHERE entityType='product' AND slug='5-stage-compact-ultrafiltration-water-purifier-with-backwash' AND locale='es'),
  updatedAt=datetime('now')
WHERE e.id IN (SELECT e.id FROM product_translations e JOIN products p ON p.id=e.productId WHERE p.slug='5-stage-compact-ultrafiltration-water-purifier-with-backwash' AND e.locale='es')
  AND EXISTS (SELECT 1 FROM seo_metadata_backup_20260910 WHERE entityType='product' AND slug='5-stage-compact-ultrafiltration-water-purifier-with-backwash' AND locale='es');
-- product:100g-800g-smart-four-cartridge-ro-water-purifier-series:es
UPDATE product_translations AS e SET
  seoTitle=(SELECT oldSeoTitle FROM seo_metadata_backup_20260910 WHERE entityType='product' AND slug='100g-800g-smart-four-cartridge-ro-water-purifier-series' AND locale='es'),
  seoDescription=(SELECT oldSeoDescription FROM seo_metadata_backup_20260910 WHERE entityType='product' AND slug='100g-800g-smart-four-cartridge-ro-water-purifier-series' AND locale='es'),
  updatedAt=datetime('now')
WHERE e.id IN (SELECT e.id FROM product_translations e JOIN products p ON p.id=e.productId WHERE p.slug='100g-800g-smart-four-cartridge-ro-water-purifier-series' AND e.locale='es')
  AND EXISTS (SELECT 1 FROM seo_metadata_backup_20260910 WHERE entityType='product' AND slug='100g-800g-smart-four-cartridge-ro-water-purifier-series' AND locale='es');
-- product:600g-800g-compact-high-flow-tankless-ro-water-purifier:es
UPDATE product_translations AS e SET
  seoTitle=(SELECT oldSeoTitle FROM seo_metadata_backup_20260910 WHERE entityType='product' AND slug='600g-800g-compact-high-flow-tankless-ro-water-purifier' AND locale='es'),
  seoDescription=(SELECT oldSeoDescription FROM seo_metadata_backup_20260910 WHERE entityType='product' AND slug='600g-800g-compact-high-flow-tankless-ro-water-purifier' AND locale='es'),
  updatedAt=datetime('now')
WHERE e.id IN (SELECT e.id FROM product_translations e JOIN products p ON p.id=e.productId WHERE p.slug='600g-800g-compact-high-flow-tankless-ro-water-purifier' AND e.locale='es')
  AND EXISTS (SELECT 1 FROM seo_metadata_backup_20260910 WHERE entityType='product' AND slug='600g-800g-compact-high-flow-tankless-ro-water-purifier' AND locale='es');
-- product:100g-800g-multi-flow-under-sink-ro-water-purifier:es
UPDATE product_translations AS e SET
  seoTitle=(SELECT oldSeoTitle FROM seo_metadata_backup_20260910 WHERE entityType='product' AND slug='100g-800g-multi-flow-under-sink-ro-water-purifier' AND locale='es'),
  seoDescription=(SELECT oldSeoDescription FROM seo_metadata_backup_20260910 WHERE entityType='product' AND slug='100g-800g-multi-flow-under-sink-ro-water-purifier' AND locale='es'),
  updatedAt=datetime('now')
WHERE e.id IN (SELECT e.id FROM product_translations e JOIN products p ON p.id=e.productId WHERE p.slug='100g-800g-multi-flow-under-sink-ro-water-purifier' AND e.locale='es')
  AND EXISTS (SELECT 1 FROM seo_metadata_backup_20260910 WHERE entityType='product' AND slug='100g-800g-multi-flow-under-sink-ro-water-purifier' AND locale='es');
-- product:100g-compact-ro-water-purifier-with-integrated-waterway:es
UPDATE product_translations AS e SET
  seoTitle=(SELECT oldSeoTitle FROM seo_metadata_backup_20260910 WHERE entityType='product' AND slug='100g-compact-ro-water-purifier-with-integrated-waterway' AND locale='es'),
  seoDescription=(SELECT oldSeoDescription FROM seo_metadata_backup_20260910 WHERE entityType='product' AND slug='100g-compact-ro-water-purifier-with-integrated-waterway' AND locale='es'),
  updatedAt=datetime('now')
WHERE e.id IN (SELECT e.id FROM product_translations e JOIN products p ON p.id=e.productId WHERE p.slug='100g-compact-ro-water-purifier-with-integrated-waterway' AND e.locale='es')
  AND EXISTS (SELECT 1 FROM seo_metadata_backup_20260910 WHERE entityType='product' AND slug='100g-compact-ro-water-purifier-with-integrated-waterway' AND locale='es');
-- product:100g-smart-ro-water-purifier-with-large-touchscreen-optional-ice-maker:es
UPDATE product_translations AS e SET
  seoTitle=(SELECT oldSeoTitle FROM seo_metadata_backup_20260910 WHERE entityType='product' AND slug='100g-smart-ro-water-purifier-with-large-touchscreen-optional-ice-maker' AND locale='es'),
  seoDescription=(SELECT oldSeoDescription FROM seo_metadata_backup_20260910 WHERE entityType='product' AND slug='100g-smart-ro-water-purifier-with-large-touchscreen-optional-ice-maker' AND locale='es'),
  updatedAt=datetime('now')
WHERE e.id IN (SELECT e.id FROM product_translations e JOIN products p ON p.id=e.productId WHERE p.slug='100g-smart-ro-water-purifier-with-large-touchscreen-optional-ice-maker' AND e.locale='es')
  AND EXISTS (SELECT 1 FROM seo_metadata_backup_20260910 WHERE entityType='product' AND slug='100g-smart-ro-water-purifier-with-large-touchscreen-optional-ice-maker' AND locale='es');
-- product:100g-smart-ro-water-purifier-with-large-touchscreen-optional-ice-maker:en
UPDATE products AS e SET
  seoTitle=(SELECT oldSeoTitle FROM seo_metadata_backup_20260910 WHERE entityType='product' AND slug='100g-smart-ro-water-purifier-with-large-touchscreen-optional-ice-maker' AND locale='en'),
  seoDescription=(SELECT oldSeoDescription FROM seo_metadata_backup_20260910 WHERE entityType='product' AND slug='100g-smart-ro-water-purifier-with-large-touchscreen-optional-ice-maker' AND locale='en'),
  updatedAt=datetime('now')
WHERE e.id IN (SELECT e.id FROM products e WHERE e.slug='100g-smart-ro-water-purifier-with-large-touchscreen-optional-ice-maker')
  AND EXISTS (SELECT 1 FROM seo_metadata_backup_20260910 WHERE entityType='product' AND slug='100g-smart-ro-water-purifier-with-large-touchscreen-optional-ice-maker' AND locale='en');
-- product:100g-countertop-ro-water-purifier-with-touchscreen-temperature-control:es
UPDATE product_translations AS e SET
  seoTitle=(SELECT oldSeoTitle FROM seo_metadata_backup_20260910 WHERE entityType='product' AND slug='100g-countertop-ro-water-purifier-with-touchscreen-temperature-control' AND locale='es'),
  seoDescription=(SELECT oldSeoDescription FROM seo_metadata_backup_20260910 WHERE entityType='product' AND slug='100g-countertop-ro-water-purifier-with-touchscreen-temperature-control' AND locale='es'),
  updatedAt=datetime('now')
WHERE e.id IN (SELECT e.id FROM product_translations e JOIN products p ON p.id=e.productId WHERE p.slug='100g-countertop-ro-water-purifier-with-touchscreen-temperature-control' AND e.locale='es')
  AND EXISTS (SELECT 1 FROM seo_metadata_backup_20260910 WHERE entityType='product' AND slug='100g-countertop-ro-water-purifier-with-touchscreen-temperature-control' AND locale='es');
-- product:5-stage-100g-under-sink-ro-water-purifier-with-3-2g-tank:es
UPDATE product_translations AS e SET
  seoTitle=(SELECT oldSeoTitle FROM seo_metadata_backup_20260910 WHERE entityType='product' AND slug='5-stage-100g-under-sink-ro-water-purifier-with-3-2g-tank' AND locale='es'),
  seoDescription=(SELECT oldSeoDescription FROM seo_metadata_backup_20260910 WHERE entityType='product' AND slug='5-stage-100g-under-sink-ro-water-purifier-with-3-2g-tank' AND locale='es'),
  updatedAt=datetime('now')
WHERE e.id IN (SELECT e.id FROM product_translations e JOIN products p ON p.id=e.productId WHERE p.slug='5-stage-100g-under-sink-ro-water-purifier-with-3-2g-tank' AND e.locale='es')
  AND EXISTS (SELECT 1 FROM seo_metadata_backup_20260910 WHERE entityType='product' AND slug='5-stage-100g-under-sink-ro-water-purifier-with-3-2g-tank' AND locale='es');
-- product:600g-tankless-under-sink-ro-water-purifier-with-universal-filters:es
UPDATE product_translations AS e SET
  seoTitle=(SELECT oldSeoTitle FROM seo_metadata_backup_20260910 WHERE entityType='product' AND slug='600g-tankless-under-sink-ro-water-purifier-with-universal-filters' AND locale='es'),
  seoDescription=(SELECT oldSeoDescription FROM seo_metadata_backup_20260910 WHERE entityType='product' AND slug='600g-tankless-under-sink-ro-water-purifier-with-universal-filters' AND locale='es'),
  updatedAt=datetime('now')
WHERE e.id IN (SELECT e.id FROM product_translations e JOIN products p ON p.id=e.productId WHERE p.slug='600g-tankless-under-sink-ro-water-purifier-with-universal-filters' AND e.locale='es')
  AND EXISTS (SELECT 1 FROM seo_metadata_backup_20260910 WHERE entityType='product' AND slug='600g-tankless-under-sink-ro-water-purifier-with-universal-filters' AND locale='es');
-- category:countertop-ro-water-purifiers:es
UPDATE product_category_translations AS e SET
  seoTitle=(SELECT oldSeoTitle FROM seo_metadata_backup_20260910 WHERE entityType='category' AND slug='countertop-ro-water-purifiers' AND locale='es'),
  seoDescription=(SELECT oldSeoDescription FROM seo_metadata_backup_20260910 WHERE entityType='category' AND slug='countertop-ro-water-purifiers' AND locale='es'),
  updatedAt=datetime('now')
WHERE e.id IN (SELECT e.id FROM product_category_translations e JOIN product_categories p ON p.id=e.categoryId WHERE p.slug='countertop-ro-water-purifiers' AND e.locale='es')
  AND EXISTS (SELECT 1 FROM seo_metadata_backup_20260910 WHERE entityType='category' AND slug='countertop-ro-water-purifiers' AND locale='es');
-- category:commercial-ro-water-purification-systems:en
UPDATE product_categories AS e SET
  seoTitle=(SELECT oldSeoTitle FROM seo_metadata_backup_20260910 WHERE entityType='category' AND slug='commercial-ro-water-purification-systems' AND locale='en'),
  seoDescription=(SELECT oldSeoDescription FROM seo_metadata_backup_20260910 WHERE entityType='category' AND slug='commercial-ro-water-purification-systems' AND locale='en'),
  updatedAt=datetime('now')
WHERE e.id IN (SELECT e.id FROM product_categories e WHERE e.slug='commercial-ro-water-purification-systems')
  AND EXISTS (SELECT 1 FROM seo_metadata_backup_20260910 WHERE entityType='category' AND slug='commercial-ro-water-purification-systems' AND locale='en');
COMMIT;
PRAGMA foreign_key_check;
PRAGMA integrity_check;
