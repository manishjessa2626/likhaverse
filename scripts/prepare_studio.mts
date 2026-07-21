import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaLibSql } from "@prisma/adapter-libsql"

const adapter = new PrismaLibSql({ url: "file:./dev.db" })
const p = new PrismaClient({ adapter })

// Mark premium creator's story as COMPLETED so we can test studio submission
const u = await p.user.findUnique({ where: { email: "premium@likhaverse.com" } })
if (!u) { console.log("Premium user not found"); process.exit(1) }

const story = await p.story.findFirst({ where: { authorId: u.id, status: "PUBLISHED" } })
if (story) {
  await p.story.update({
    where: { id: story.id },
    data: { status: "COMPLETED", completedAt: new Date("2026-06-20"), completedBadge: true },
  })
  console.log("Updated story '" + story.title + "' to COMPLETED")
} else {
  console.log("No published story found for premium creator")
}

await p.$disconnect()
