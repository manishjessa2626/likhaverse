-- CreateIndex
CREATE INDEX "Story_status_idx" ON "Story"("status");

-- CreateIndex
CREATE INDEX "Story_title_idx" ON "Story"("title");

-- CreateIndex
CREATE INDEX "Story_tags_idx" ON "Story"("tags");

-- CreateIndex
CREATE INDEX "User_name_idx" ON "User"("name");
