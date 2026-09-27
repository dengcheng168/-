ALTER TABLE "certificates" ADD COLUMN "applicableProductType" TEXT;
ALTER TABLE "certificates" ADD COLUMN "applicableModels" TEXT NOT NULL DEFAULT '[]';
