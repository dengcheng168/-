-- CreateTable
CREATE TABLE "factory_gallery_items" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "imageUrl" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "factory_gallery_item_translations" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "itemId" INTEGER NOT NULL,
    "locale" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "translationStatus" TEXT NOT NULL DEFAULT 'DRAFT',
    "updatedBy" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "factory_gallery_item_translations_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "factory_gallery_items" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "factory_gallery_items_published_idx" ON "factory_gallery_items"("published");

-- CreateIndex
CREATE INDEX "factory_gallery_item_translations_locale_idx" ON "factory_gallery_item_translations"("locale");

-- CreateIndex
CREATE UNIQUE INDEX "factory_gallery_item_translations_itemId_locale_key" ON "factory_gallery_item_translations"("itemId", "locale");
