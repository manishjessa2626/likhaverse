-- CreateTable
CREATE TABLE "StoryAnalysis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "storyId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    CONSTRAINT "StoryAnalysis_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "StoryAnalysis_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StoryboardScene" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "sceneNumber" INTEGER NOT NULL,
    "imageUrl" TEXT,
    "chapterTitle" TEXT,
    "chapterNumber" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "storyId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    CONSTRAINT "StoryboardScene_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "StoryboardScene_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Story" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "cover" TEXT,
    "tags" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "accessType" TEXT NOT NULL DEFAULT 'FREE_PREVIEW',
    "freePreviewCount" INTEGER NOT NULL DEFAULT 1,
    "wordCount" INTEGER NOT NULL DEFAULT 0,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "completedAt" DATETIME,
    "studioBadge" BOOLEAN NOT NULL DEFAULT false,
    "completedBadge" BOOLEAN NOT NULL DEFAULT false,
    "original" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "authorId" TEXT NOT NULL,
    CONSTRAINT "Story_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Story" ("authorId", "completedAt", "completedBadge", "cover", "createdAt", "description", "freePreviewCount", "id", "status", "studioBadge", "tags", "title", "updatedAt", "viewCount", "wordCount") SELECT "authorId", "completedAt", "completedBadge", "cover", "createdAt", "description", "freePreviewCount", "id", "status", "studioBadge", "tags", "title", "updatedAt", "viewCount", "wordCount" FROM "Story";
DROP TABLE "Story";
ALTER TABLE "new_Story" RENAME TO "Story";
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
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
INSERT INTO "new_User" ("avatar", "bio", "createdAt", "email", "emailVerified", "id", "name", "password", "premium", "premiumSince", "role", "updatedAt") SELECT "avatar", "bio", "createdAt", "email", "emailVerified", "id", "name", "password", "premium", "premiumSince", "role", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
