import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaLibSql } from "@prisma/adapter-libsql"

const adapter = new PrismaLibSql({ url: "file:./dev.db" })
const p = new PrismaClient({ adapter })

const u = await p.user.findUnique({ where: { email: "premium@likhaverse.com" } })
if (!u) { console.log("Premium user not found"); process.exit(1) }
console.log("User:", u.name, "| Role:", u.role, "| Premium:", u.premium, "| AI Count:", u.aiGenerationCount)

const stories = await p.story.findMany({
  where: { authorId: u.id },
  include: { _count: { select: { chapters: true } } },
})
console.log("Stories:")
for (const s of stories) {
  console.log('  "' + s.title + '" [' + s.status + "] completedAt=" + s.completedAt + " ch=" + s._count.chapters + " words=" + s.wordCount)
}

const apps = await p.studioApplication.findMany({ where: { authorId: u.id } })
console.log("Existing applications:", apps.length)

await p.$disconnect()
