-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_StudioApplication" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "genre" TEXT NOT NULL,
    "totalChapters" INTEGER NOT NULL,
    "wordCount" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "visualStyle" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reviewedAt" DATETIME,
    "reviewNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "storyId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    CONSTRAINT "StudioApplication_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "StudioApplication_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_StudioApplication" ("authorId", "createdAt", "genre", "id", "reason", "reviewNotes", "reviewedAt", "status", "storyId", "totalChapters", "visualStyle", "wordCount") SELECT "authorId", "createdAt", "genre", "id", "reason", "reviewNotes", "reviewedAt", "status", "storyId", "totalChapters", "visualStyle", "wordCount" FROM "StudioApplication";
DROP TABLE "StudioApplication";
ALTER TABLE "new_StudioApplication" RENAME TO "StudioApplication";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
