import { PrismaClient } from "@/generated/prisma/client"
import { Pool } from "pg"
import { PrismaPg } from "@prisma/adapter-pg"
import { readFileSync, existsSync } from "fs"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function createClient() {
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

// Auto-create tables if they don't exist
prisma.$connect()
  .then(() => prisma.$executeRawUnsafe(`SELECT 1 FROM "Story" LIMIT 1`))
  .then(() => prisma.$disconnect())
  .catch(() => {
    try {
      const possiblePaths = [
        "/app/schema.sql",
        process.cwd() + "/schema.sql",
        __dirname + "/../../../schema.sql",
      ]
      const schemaPath = possiblePaths.find(existsSync)
      if (!schemaPath) return
      const sql = readFileSync(schemaPath, "utf8")
      const statements = sql.split(";").map(s => s.trim()).filter(s => s.length > 0 && !s.startsWith("--"))
      prisma.$connect().then(async () => {
        for (const stmt of statements) {
          try { await prisma.$executeRawUnsafe(stmt + ";") } catch {}
        }
        console.log("[prisma] Schema synced")
        prisma.$disconnect()
      })
    } catch {}
  })
