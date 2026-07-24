import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Pool } from "pg"
import fs from "fs"
import path from "path"
import bcrypt from "bcryptjs"

export const dynamic = "force-dynamic"

async function applySchema(): Promise<string> {
  const schemaPath = path.join(process.cwd(), "schema.sql")
  if (!fs.existsSync(schemaPath)) return "schema.sql not found"

  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const sql = fs.readFileSync(schemaPath, "utf8")

  const stmts: string[] = []
  let current = ""
  for (const line of sql.split("\n")) {
    const trimmed = line.trim()
    if (trimmed.startsWith("--") || trimmed === "") continue
    current += line + "\n"
    if (trimmed.endsWith(";")) {
      stmts.push(current.trim())
      current = ""
    }
  }
  if (current.trim()) stmts.push(current.trim())

  let ok = 0
  let fail = 0
  const errors: string[] = []
  for (const s of stmts) {
    try {
      await pool.query(s)
      ok++
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string }
      if (e.code === "42P07" || e.code === "42710") {
        ok++
      } else {
        fail++
        if (fail <= 5) errors.push(e.message || String(e))
      }
    }
  }
  await pool.end()
  return `${ok} ok, ${fail} failed${errors.length ? ": " + errors.join("; ") : ""}`
}

async function seed(): Promise<string> {
  const existing = await prisma.user.count()
  if (existing > 0) return `Skipped — ${existing} users already exist`

  const admin = await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@likhaverse.com",
      password: await bcrypt.hash("admin123", 10),
      provider: "email",
      role: "SUPER_ADMIN",
      isVerified: true,
    },
  })

  const author = await prisma.user.create({
    data: {
      name: "Author",
      email: "author@likhaverse.com",
      password: await bcrypt.hash("author123", 10),
      provider: "email",
      role: "AUTHOR",
      isVerified: true,
    },
  })

  return `Created admin (${admin.id}) and author (${author.id})`
}

export async function GET() {
  const results: Record<string, unknown> = {}
  results.schema = await applySchema()
  results.seed = await seed()
  return NextResponse.json({ status: "ok", results })
}
