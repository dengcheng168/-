-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_admin_users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'SUPER_ADMIN',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" DATETIME,
    "unlockedAt" DATETIME,
    "sessionVersion" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_admin_users" ("createdAt", "email", "id", "isActive", "lastLoginAt", "name", "passwordHash", "role", "updatedAt") SELECT "createdAt", "email", "id", "isActive", "lastLoginAt", "name", "passwordHash", "role", "updatedAt" FROM "admin_users";
DROP TABLE "admin_users";
ALTER TABLE "new_admin_users" RENAME TO "admin_users";
CREATE UNIQUE INDEX "admin_users_email_key" ON "admin_users"("email");
CREATE TABLE "new_audit_logs" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "adminUserId" INTEGER,
    "adminEmail" TEXT NOT NULL,
    "actorRole" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "summary" TEXT NOT NULL,
    "result" TEXT NOT NULL DEFAULT 'SUCCESS',
    "beforeData" TEXT,
    "afterData" TEXT,
    "metadata" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_logs_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "admin_users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_audit_logs" ("action", "adminEmail", "adminUserId", "createdAt", "entityId", "entityType", "id", "ipAddress", "summary") SELECT "action", "adminEmail", "adminUserId", "createdAt", "entityId", "entityType", "id", "ipAddress", "summary" FROM "audit_logs";
DROP TABLE "audit_logs";
ALTER TABLE "new_audit_logs" RENAME TO "audit_logs";
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");
CREATE INDEX "audit_logs_adminUserId_idx" ON "audit_logs"("adminUserId");
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "login_logs_ipAddress_createdAt_idx" ON "login_logs"("ipAddress", "createdAt");

-- CreateIndex
CREATE INDEX "login_logs_email_ipAddress_createdAt_idx" ON "login_logs"("email", "ipAddress", "createdAt");
