/*
  Warnings:

  - You are about to drop the column `facebookUrl` on the `site_settings` table. All the data in the column will be lost.
  - You are about to drop the column `linkedinUrl` on the `site_settings` table. All the data in the column will be lost.
  - You are about to drop the column `otherSocial` on the `site_settings` table. All the data in the column will be lost.
  - You are about to drop the column `youtubeUrl` on the `site_settings` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_site_settings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "companyName" TEXT NOT NULL DEFAULT '',
    "companyLogoUrl" TEXT,
    "companyAddress" TEXT,
    "companyEmail" TEXT,
    "companyPhone" TEXT,
    "whatsappNumber" TEXT,
    "whatsappLink" TEXT,
    "socialLinks" TEXT NOT NULL DEFAULT '[]',
    "smtpEnabled" BOOLEAN NOT NULL DEFAULT false,
    "smtpHost" TEXT,
    "smtpPort" INTEGER,
    "smtpUser" TEXT,
    "smtpPassword" TEXT,
    "smtpFromEmail" TEXT,
    "turnstileEnabled" BOOLEAN NOT NULL DEFAULT false,
    "turnstileSiteKey" TEXT,
    "turnstileSecretKey" TEXT,
    "defaultSeoTitle" TEXT,
    "defaultSeoDescription" TEXT,
    "defaultOgImage" TEXT,
    "heroHeadline" TEXT NOT NULL DEFAULT 'OEM & ODM Water Purifier Manufacturer',
    "heroSubheadline" TEXT NOT NULL DEFAULT 'Reliable water purification solutions for global brands, distributors and commercial projects.',
    "heroButton1Text" TEXT NOT NULL DEFAULT 'Get a Quote',
    "heroButton1Link" TEXT NOT NULL DEFAULT '/contact',
    "heroButton2Text" TEXT NOT NULL DEFAULT 'View Products',
    "heroButton2Link" TEXT NOT NULL DEFAULT '/products',
    "heroDesktopImage" TEXT,
    "heroMobileImage" TEXT,
    "coreAdvantages" TEXT NOT NULL DEFAULT '[]',
    "stats" TEXT NOT NULL DEFAULT '[]',
    "oemProcessSteps" TEXT NOT NULL DEFAULT '[]',
    "factoryStats" TEXT NOT NULL DEFAULT '[]',
    "factoryPhotos" TEXT NOT NULL DEFAULT '[]',
    "partnerRegions" TEXT NOT NULL DEFAULT '[]',
    "footerText" TEXT,
    "footerColumns" TEXT,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_site_settings" ("companyAddress", "companyEmail", "companyLogoUrl", "companyName", "companyPhone", "coreAdvantages", "defaultOgImage", "defaultSeoDescription", "defaultSeoTitle", "factoryPhotos", "factoryStats", "footerColumns", "footerText", "heroButton1Link", "heroButton1Text", "heroButton2Link", "heroButton2Text", "heroDesktopImage", "heroHeadline", "heroMobileImage", "heroSubheadline", "id", "oemProcessSteps", "partnerRegions", "smtpEnabled", "smtpFromEmail", "smtpHost", "smtpPassword", "smtpPort", "smtpUser", "stats", "turnstileEnabled", "turnstileSecretKey", "turnstileSiteKey", "updatedAt", "whatsappLink", "whatsappNumber") SELECT "companyAddress", "companyEmail", "companyLogoUrl", "companyName", "companyPhone", "coreAdvantages", "defaultOgImage", "defaultSeoDescription", "defaultSeoTitle", "factoryPhotos", "factoryStats", "footerColumns", "footerText", "heroButton1Link", "heroButton1Text", "heroButton2Link", "heroButton2Text", "heroDesktopImage", "heroHeadline", "heroMobileImage", "heroSubheadline", "id", "oemProcessSteps", "partnerRegions", "smtpEnabled", "smtpFromEmail", "smtpHost", "smtpPassword", "smtpPort", "smtpUser", "stats", "turnstileEnabled", "turnstileSecretKey", "turnstileSiteKey", "updatedAt", "whatsappLink", "whatsappNumber" FROM "site_settings";
DROP TABLE "site_settings";
ALTER TABLE "new_site_settings" RENAME TO "site_settings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
