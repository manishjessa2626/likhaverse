import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaLibSql } from "@prisma/adapter-libsql"

const adapter = new PrismaLibSql({ url: "file:./dev.db" })
const p = new PrismaClient({ adapter })

const u = await p.user.findUnique({ where: { email: "admin@likhaverse.com" } })
if (!u) { console.log("  [FAIL] Admin not found"); await p.$disconnect(); process.exit(1) }
console.log("  User: " + u.name + " | Role: " + u.role + " | Premium: " + u.premium)
console.log("  AI Gen Count: " + (u.aiGenerationCount ?? 0))

const stories = await p.story.findMany({ where: { authorId: u.id }, include: { _count: { select: { chapters: true } } } })
console.log("  Own stories: " + stories.length)
for (const s of stories) console.log('    "' + s.title + '" [' + s.status + "] " + s._count.chapters + " ch, original=" + s.original + ", studioBadge=" + s.studioBadge + ", completedAt=" + (s.completedAt ? "SET" : "null"))

const allStories = await p.story.count()
const allChapters = await p.chapter.count()
const allUsers = await p.user.count()
const allApps = await p.studioApplication.count()
const allGens = await p.aIGeneration.count()
console.log("  Total stories: " + allStories)
console.log("  Total chapters: " + allChapters)
console.log("  Total users: " + allUsers)
console.log("  Studio applications: " + allApps)
console.log("  AI generations: " + allGens)

const { bypassesAllLimits } = await import("../src/lib/permissions")
const { getGenerationLimit } = await import("../src/lib/ai/types")
console.log("  bypassesAllLimits(SUPER_ADMIN): " + bypassesAllLimits("SUPER_ADMIN"))
console.log("  getGenerationLimit(SUPER_ADMIN, COVER): " + getGenerationLimit("SUPER_ADMIN", "COVER"))

// Check all user roles
const users = await p.user.findMany({ select: { email: true, name: true, role: true, premium: true, aiGenerationCount: true } })
console.log("\n  All users:")
for (const usr of users) {
  console.log("    " + (usr.name ?? "").padEnd(20) + " | " + usr.role.padEnd(16) + " | premium=" + usr.premium + " | AI=" + (usr.aiGenerationCount ?? 0))
}

await p.$disconnect()
