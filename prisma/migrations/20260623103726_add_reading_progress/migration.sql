-- CreateTable
CREATE TABLE "ReadingProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "scrollPosition" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    CONSTRAINT "ReadingProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ReadingProgress_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ReadingProgress_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ReadingProgress_userId_storyId_key" ON "ReadingProgress"("userId", "storyId");
