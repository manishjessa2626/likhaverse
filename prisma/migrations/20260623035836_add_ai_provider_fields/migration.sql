-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AIGeneration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "imageUrl" TEXT,
    "metadata" TEXT,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "provider" TEXT NOT NULL DEFAULT 'mock',
    "modelUsed" TEXT,
    "errorMessage" TEXT,
    "durationMs" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "storyId" TEXT,
    "characterId" TEXT,
    CONSTRAINT "AIGeneration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AIGeneration_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "AIGeneration_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_AIGeneration" ("characterId", "createdAt", "id", "imageUrl", "metadata", "prompt", "storyId", "type", "userId") SELECT "characterId", "createdAt", "id", "imageUrl", "metadata", "prompt", "storyId", "type", "userId" FROM "AIGeneration";
DROP TABLE "AIGeneration";
ALTER TABLE "new_AIGeneration" RENAME TO "AIGeneration";
CREATE TABLE "new_Story" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "cover" TEXT,
    "tags" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "accessType" TEXT NOT NULL DEFAULT 'FREEMIUM',
    "freePreviewChapters" INTEGER NOT NULL DEFAULT 1,
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
INSERT INTO "new_Story" ("accessType", "authorId", "completedAt", "completedBadge", "cover", "createdAt", "description", "freePreviewChapters", "id", "original", "status", "studioBadge", "tags", "title", "updatedAt", "viewCount", "wordCount") SELECT "accessType", "authorId", "completedAt", "completedBadge", "cover", "createdAt", "description", "freePreviewChapters", "id", "original", "status", "studioBadge", "tags", "title", "updatedAt", "viewCount", "wordCount" FROM "Story";
DROP TABLE "Story";
ALTER TABLE "new_Story" RENAME TO "Story";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
