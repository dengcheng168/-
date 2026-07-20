-- CreateTable
CREATE TABLE "translations" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "locale" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "translations_locale_idx" ON "translations"("locale");

-- CreateIndex
CREATE UNIQUE INDEX "translations_locale_key_key" ON "translations"("locale", "key");
