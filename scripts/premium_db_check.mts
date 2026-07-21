import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaLibSql } from "@prisma/adapter-libsql"

const adapter = new PrismaLibSql({ url: "file:./dev.db" })
const p = new PrismaClient({ adapter })

// First mark the story as COMPLETED for studio submission test
const u = await p.user.findUnique({ where: { email: "premium@likhaverse.com" } })
if (!u) { console.log("  [FAIL] Premium user not found"); await p.$disconnect(); process.exit(1) }

const story = await p.story.findFirst({ where: { authorId: u.id, status: "PUBLISHED" } })
if (story) {
  await p.story.update({
    where: { id: story.id },
    data: { status: "COMPLETED", completedAt: new Date("2026-06-20"), completedBadge: true },
  })
  console.log("  [INFO] Marked story '" + story.title + "' as COMPLETED for studio test")
}

// Now verify all data
const user = await p.user.findUnique({ where: { email: "premium@likhaverse.com" } })
console.log("  User: " + user!.name + " | Role: " + user!.role + " | Premium: " + user!.premium)
console.log("  AI Gen Count: " + (user!.aiGenerationCount ?? 0))

const stories = await p.story.findMany({
  where: { authorId: user!.id },
  include: { _count: { select: { chapters: true } } },
})
console.log("  Stories: " + stories.length)
for (const s of stories) {
  console.log('    "' + s.title + '" [' + s.status + "] ch=" + s._count.chapters + " words=" + s.wordCount + " completedAt=" + (s.completedAt ? "SET" : "null"))
}

const chars = await p.character.count({ where: { authorId: user!.id } })
console.log("  Characters: " + chars)
const gens = await p.aIGeneration.count({ where: { userId: user!.id } })
console.log("  AI Generations: " + gens)
const apps = await p.studioApplication.count({ where: { authorId: user!.id } })
console.log("  Studio Applications: " + apps)

const { getGenerationLimit } = await import("../src/lib/ai/types")
console.log("  AI Cover Limit: " + getGenerationLimit("PREMIUM_CREATOR", "COVER") + "/month")

const { bypassesAllLimits } = await import("../src/lib/permissions")
console.log("  Bypasses AI limits: " + bypassesAllLimits("PREMIUM_CREATOR"))

await p.$disconnect()
