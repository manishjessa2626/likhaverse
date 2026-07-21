-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "password" TEXT,
    "phone" TEXT,
    "provider" TEXT NOT NULL DEFAULT 'email',
    "providerId" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "role" TEXT NOT NULL DEFAULT 'READER',
    "bio" TEXT,
    "avatar" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "premium" BOOLEAN NOT NULL DEFAULT false,
    "premiumSince" DATETIME,
    "aiGenerationCount" INTEGER NOT NULL DEFAULT 0,
    "aiGenerationResetAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("aiGenerationCount", "aiGenerationResetAt", "avatar", "bio", "createdAt", "email", "emailVerified", "id", "name", "password", "premium", "premiumSince", "role", "updatedAt") SELECT "aiGenerationCount", "aiGenerationResetAt", "avatar", "bio", "createdAt", "email", "emailVerified", "id", "name", "password", "premium", "premiumSince", "role", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");
CREATE INDEX "User_role_idx" ON "User"("role");
CREATE INDEX "User_name_idx" ON "User"("name");
CREATE TABLE "new_VerificationCode" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'EMAIL_VERIFY',
    "target" TEXT,
    "expiresAt" DATETIME NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    CONSTRAINT "VerificationCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_VerificationCode" ("code", "createdAt", "expiresAt", "id", "type", "used", "userId") SELECT "code", "createdAt", "expiresAt", "id", "type", "used", "userId" FROM "VerificationCode";
DROP TABLE "VerificationCode";
ALTER TABLE "new_VerificationCode" RENAME TO "VerificationCode";
CREATE INDEX "VerificationCode_target_idx" ON "VerificationCode"("target");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");
