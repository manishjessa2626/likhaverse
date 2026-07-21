-- CreateTable
CREATE TABLE "StoryLike" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    CONSTRAINT "StoryLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "StoryLike_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "StoryLike_storyId_idx" ON "StoryLike"("storyId");

-- CreateIndex
CREATE UNIQUE INDEX "StoryLike_userId_storyId_key" ON "StoryLike"("userId", "storyId");
