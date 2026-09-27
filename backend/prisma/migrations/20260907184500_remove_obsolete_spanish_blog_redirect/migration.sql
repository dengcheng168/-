-- This post has a published Spanish translation. The old redirect prevented the
-- translated canonical URL from rendering and caused every Spanish blog list to
-- link through a 301. Preserve the article; remove only the obsolete redirect.
DELETE FROM "redirects"
WHERE "fromPath" = '/es/blog/from-manufacturing-to-global-markets-how-an-integrated-water-purifier-factory-creates-long-term-value'
  AND "toPath" = '/es/blog';
