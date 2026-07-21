-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_StoryView" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "storyId" TEXT NOT NULL,
    "userId" TEXT,
    CONSTRAINT "StoryView_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "StoryView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_StoryView" ("createdAt", "id", "storyId") SELECT "createdAt", "id", "storyId" FROM "StoryView";
DROP TABLE "StoryView";
ALTER TABLE "new_StoryView" RENAME TO "StoryView";
CREATE INDEX "StoryView_userId_idx" ON "StoryView"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
