-- AlterTable
ALTER TABLE "inquiries" ADD COLUMN "pageLanguage" TEXT;

-- CreateIndex
CREATE INDEX "inquiries_pageLanguage_idx" ON "inquiries"("pageLanguage");
