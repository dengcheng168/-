-- Restore the four redirect destinations observed before this repair.

BEGIN IMMEDIATE;

UPDATE redirects SET
  toPath = CASE fromPath
    WHEN '/products/category/commercial-water-purification-systems' THEN '/products/category/under-sink-ro-water-purifiers'
    WHEN '/es/products/category/commercial-water-purification-systems' THEN '/es/products/category/under-sink-ro-water-purifiers'
    WHEN '/products/category/whole-house-ultrafiltration-systems' THEN '/products/category/instant-hot-water-dispensers'
    WHEN '/es/products/category/whole-house-ultrafiltration-systems' THEN '/es/products/category/instant-hot-water-dispensers'
  END,
  statusCode = 301,
  updatedAt = CAST(strftime('%s','now') AS INTEGER) * 1000
WHERE fromPath IN (
  '/products/category/commercial-water-purification-systems',
  '/es/products/category/commercial-water-purification-systems',
  '/products/category/whole-house-ultrafiltration-systems',
  '/es/products/category/whole-house-ultrafiltration-systems'
);

COMMIT;
