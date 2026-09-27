-- Make the About-page gallery editable by section instead of relying on fixed row IDs.
ALTER TABLE "factory_gallery_items" ADD COLUMN "galleryGroup" TEXT NOT NULL DEFAULT 'manufacturing';

-- Preserve the current production arrangement. Rows outside this original set
-- remain in Manufacturing Workflow and can be moved from the admin panel.
UPDATE "factory_gallery_items"
SET "galleryGroup" = 'quality'
WHERE "id" IN (3, 7, 9, 10);

UPDATE "factory_gallery_items"
SET "galleryGroup" = 'visits'
WHERE "id" IN (13, 14, 15, 16);

-- Retain the public card order that was previously encoded in the frontend.
-- sortOrder is intentionally independent inside each galleryGroup.
UPDATE "factory_gallery_items"
SET "sortOrder" = CASE "id"
  WHEN 12 THEN 1 WHEN 8 THEN 2 WHEN 11 THEN 3 WHEN 5 THEN 4
  WHEN 6 THEN 5 WHEN 1 THEN 6 WHEN 2 THEN 7 WHEN 4 THEN 8
  WHEN 9 THEN 1 WHEN 10 THEN 2 WHEN 7 THEN 3 WHEN 3 THEN 4
  WHEN 13 THEN 1 WHEN 15 THEN 2 WHEN 14 THEN 3 WHEN 16 THEN 4
  ELSE "sortOrder"
END
WHERE "id" IN (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);

-- Normalize every category to a continuous 1..N sequence, including any
-- gallery rows created before this migration but outside the original 16.
WITH ranked AS (
  SELECT "id", ROW_NUMBER() OVER (
    PARTITION BY "galleryGroup"
    ORDER BY "sortOrder" ASC, "id" ASC
  ) AS position
  FROM "factory_gallery_items"
  WHERE "deletedAt" IS NULL
)
UPDATE "factory_gallery_items"
SET "sortOrder" = (SELECT position FROM ranked WHERE ranked."id" = "factory_gallery_items"."id")
WHERE "id" IN (SELECT "id" FROM ranked);
