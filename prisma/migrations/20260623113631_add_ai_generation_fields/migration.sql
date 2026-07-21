-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AIGeneration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "style" TEXT,
    "enhancedPrompt" TEXT,
    "imageUrl" TEXT,
    "thumbnailUrl" TEXT,
    "metadata" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
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
INSERT INTO "new_AIGeneration" ("characterId", "createdAt", "durationMs", "errorMessage", "id", "imageUrl", "metadata", "modelUsed", "prompt", "provider", "status", "storyId", "type", "userId") SELECT "characterId", "createdAt", "durationMs", "errorMessage", "id", "imageUrl", "metadata", "modelUsed", "prompt", "provider", "status", "storyId", "type", "userId" FROM "AIGeneration";
DROP TABLE "AIGeneration";
ALTER TABLE "new_AIGeneration" RENAME TO "AIGeneration";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
