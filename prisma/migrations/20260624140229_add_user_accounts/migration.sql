-- CreateTable
CREATE TABLE "UserAccount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "provider" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    CONSTRAINT "UserAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "UserAccount_userId_idx" ON "UserAccount"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserAccount_provider_providerId_key" ON "UserAccount"("provider", "providerId");
