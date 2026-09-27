ALTER TABLE "site_settings" ADD COLUMN "googleAdsId" TEXT;

-- Preserve valid legacy Ads IDs, without interpreting pasted HTML as code.
UPDATE "site_settings"
SET "googleAdsId" = trim("googlePixelId"), "googlePixelId" = NULL
WHERE trim("googlePixelId") LIKE 'AW-%'
  AND length(substr(trim("googlePixelId"), 4)) > 0
  AND substr(trim("googlePixelId"), 4) NOT GLOB '*[^0-9]*';
