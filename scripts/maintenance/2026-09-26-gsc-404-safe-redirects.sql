-- GSC 404 remediation: only redirect retired URLs with a clear topical successor.
-- Intentionally does not redirect deleted demo products, placeholder posts, /$, /&,
-- or the retired faucet/shower category because no equivalent live destination exists.
-- Idempotent and safe to run more than once.

BEGIN IMMEDIATE;

INSERT INTO redirects (fromPath, toPath, statusCode, createdAt, updatedAt)
VALUES
  ('/products/category/reverse-osmosis-systems',
   '/products/category/under-sink-ro-water-purifiers', 301,
   CAST(strftime('%s','now') AS INTEGER) * 1000,
   CAST(strftime('%s','now') AS INTEGER) * 1000),
  ('/es/products/category/reverse-osmosis-systems',
   '/es/products/category/under-sink-ro-water-purifiers', 301,
   CAST(strftime('%s','now') AS INTEGER) * 1000,
   CAST(strftime('%s','now') AS INTEGER) * 1000),
  ('/products/category/commercial-industrial-filtration',
   '/products/category/commercial-ro-water-purification-systems', 301,
   CAST(strftime('%s','now') AS INTEGER) * 1000,
   CAST(strftime('%s','now') AS INTEGER) * 1000),
  ('/es/products/category/commercial-industrial-filtration',
   '/es/products/category/commercial-ro-water-purification-systems', 301,
   CAST(strftime('%s','now') AS INTEGER) * 1000,
   CAST(strftime('%s','now') AS INTEGER) * 1000),
  ('/products/category/whole-house-water-filters',
   '/products/category/pre-filters', 301,
   CAST(strftime('%s','now') AS INTEGER) * 1000,
   CAST(strftime('%s','now') AS INTEGER) * 1000),
  ('/es/products/category/whole-house-water-filters',
   '/es/products/category/pre-filters', 301,
   CAST(strftime('%s','now') AS INTEGER) * 1000,
   CAST(strftime('%s','now') AS INTEGER) * 1000),
  ('/blog/how-to-choose-a-reliable-water-purifier-manufacturer-for-oem-and-wholesale',
   '/blog/how-to-evaluate-a-water-purifier-manufacturer', 301,
   CAST(strftime('%s','now') AS INTEGER) * 1000,
   CAST(strftime('%s','now') AS INTEGER) * 1000),
  ('/es/blog/how-to-choose-a-reliable-water-purifier-manufacturer-for-oem-and-wholesale',
   '/es/blog/how-to-evaluate-a-water-purifier-manufacturer', 301,
   CAST(strftime('%s','now') AS INTEGER) * 1000,
   CAST(strftime('%s','now') AS INTEGER) * 1000),
  ('/blog/how-to-choose-the-right-oem-water-purifier-partner',
   '/blog/how-to-evaluate-a-water-purifier-manufacturer', 301,
   CAST(strftime('%s','now') AS INTEGER) * 1000,
   CAST(strftime('%s','now') AS INTEGER) * 1000),
  ('/es/blog/how-to-choose-the-right-oem-water-purifier-partner',
   '/es/blog/how-to-evaluate-a-water-purifier-manufacturer', 301,
   CAST(strftime('%s','now') AS INTEGER) * 1000,
   CAST(strftime('%s','now') AS INTEGER) * 1000),
  ('/blog/category/company-news', '/blog', 301,
   CAST(strftime('%s','now') AS INTEGER) * 1000,
   CAST(strftime('%s','now') AS INTEGER) * 1000),
  ('/es/blog/category/company-news', '/es/blog', 301,
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
  '/products/category/reverse-osmosis-systems',
  '/es/products/category/reverse-osmosis-systems',
  '/products/category/commercial-industrial-filtration',
  '/es/products/category/commercial-industrial-filtration',
  '/products/category/whole-house-water-filters',
  '/es/products/category/whole-house-water-filters',
  '/blog/how-to-choose-a-reliable-water-purifier-manufacturer-for-oem-and-wholesale',
  '/es/blog/how-to-choose-a-reliable-water-purifier-manufacturer-for-oem-and-wholesale',
  '/blog/how-to-choose-the-right-oem-water-purifier-partner',
  '/es/blog/how-to-choose-the-right-oem-water-purifier-partner',
  '/blog/category/company-news',
  '/es/blog/category/company-news'
)
ORDER BY fromPath;
