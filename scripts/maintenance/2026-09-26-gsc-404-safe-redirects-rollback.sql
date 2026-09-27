-- Roll back only the redirect rows introduced by the 2026-09-26 GSC remediation.
-- Before using this file in production, retain the pre-deployment database backup.

BEGIN IMMEDIATE;

DELETE FROM redirects
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
);

COMMIT;

SELECT COUNT(*) AS remaining_release_redirects
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
);
