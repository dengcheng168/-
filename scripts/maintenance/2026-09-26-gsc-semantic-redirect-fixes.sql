-- Correct four legacy category redirects whose current destinations are topically wrong.
-- This changes redirect data only; no frontend layout or styling is modified.

BEGIN IMMEDIATE;

INSERT INTO redirects (fromPath, toPath, statusCode, createdAt, updatedAt)
VALUES
  ('/products/category/commercial-water-purification-systems',
   '/products/category/commercial-ro-water-purification-systems', 301,
   CAST(strftime('%s','now') AS INTEGER) * 1000,
   CAST(strftime('%s','now') AS INTEGER) * 1000),
  ('/es/products/category/commercial-water-purification-systems',
   '/es/products/category/commercial-ro-water-purification-systems', 301,
   CAST(strftime('%s','now') AS INTEGER) * 1000,
   CAST(strftime('%s','now') AS INTEGER) * 1000),
  ('/products/category/whole-house-ultrafiltration-systems',
   '/products/category/ultrafiltration-water-purifiers', 301,
   CAST(strftime('%s','now') AS INTEGER) * 1000,
   CAST(strftime('%s','now') AS INTEGER) * 1000),
  ('/es/products/category/whole-house-ultrafiltration-systems',
   '/es/products/category/ultrafiltration-water-purifiers', 301,
   CAST(strftime('%s','now') AS INTEGER) * 1000,
   CAST(strftime('%s','now') AS INTEGER) * 1000)
ON CONFLICT(fromPath) DO UPDATE SET
  toPath = excluded.toPath,
  statusCode = excluded.statusCode,
  updatedAt = excluded.updatedAt;

COMMIT;

SELECT fromPath, toPath, statusCode
FROM redirects
WHERE fromPath IN (
  '/products/category/commercial-water-purification-systems',
  '/es/products/category/commercial-water-purification-systems',
  '/products/category/whole-house-ultrafiltration-systems',
  '/es/products/category/whole-house-ultrafiltration-systems'
)
ORDER BY fromPath;
