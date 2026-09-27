-- C02 identifies itself as an under-sink RO purifier in its verified Product Type specification.
-- Resolve the destination by slug rather than a deployment-specific numeric id.
UPDATE "products"
SET "categoryId" = (
  SELECT "id" FROM "product_categories" WHERE "slug" = 'under-sink-ro-water-purifiers' AND "deletedAt" IS NULL
)
WHERE "slug" = '100g-under-sink-ro-water-purifier-with-pressure-tank'
  AND EXISTS (
    SELECT 1 FROM "product_categories" WHERE "slug" = 'under-sink-ro-water-purifiers' AND "deletedAt" IS NULL
  );
