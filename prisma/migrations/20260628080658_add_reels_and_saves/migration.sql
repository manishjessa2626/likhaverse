-- CreateTable
CREATE TABLE "PostSave" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "PostSave_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PostSave_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Reel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "videoUrl" TEXT NOT NULL,
    "caption" TEXT,
    "musicUrl" TEXT,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Reel_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReelLike" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reelId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "ReelLike_reelId_fkey" FOREIGN KEY ("reelId") REFERENCES "Reel" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ReelLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReelComment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "text" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reelId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "ReelComment_reelId_fkey" FOREIGN KEY ("reelId") REFERENCES "Reel" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ReelComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "PostSave_postId_userId_key" ON "PostSave"("postId", "userId");

-- CreateIndex
CREATE INDEX "Reel_userId_idx" ON "Reel"("userId");

-- CreateIndex
CREATE INDEX "Reel_createdAt_idx" ON "Reel"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ReelLike_reelId_userId_key" ON "ReelLike"("reelId", "userId");

-- CreateIndex
CREATE INDEX "ReelComment_reelId_idx" ON "ReelComment"("reelId");
