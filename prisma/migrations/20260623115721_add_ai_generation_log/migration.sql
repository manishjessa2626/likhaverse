-- AlterTable
ALTER TABLE "AIGeneration" ADD COLUMN "cost" REAL;
ALTER TABLE "AIGeneration" ADD COLUMN "providerId" TEXT;

-- CreateTable
CREATE TABLE "AIGenerationLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "generationId" TEXT NOT NULL,
    "providerName" TEXT NOT NULL,
    "modelUsed" TEXT,
    "cost" REAL,
    "tokensIn" INTEGER,
    "tokensOut" INTEGER,
    "durationMs" INTEGER,
    "status" TEXT NOT NULL,
    "errorMessage" TEXT,
    "rawResponse" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AIGenerationLog_generationId_fkey" FOREIGN KEY ("generationId") REFERENCES "AIGeneration" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "AIGenerationLog_generationId_key" ON "AIGenerationLog"("generationId");
