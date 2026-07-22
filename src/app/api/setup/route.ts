import { NextResponse } from "next/server"
import { execSync } from "child_process"
import fs from "fs"
import path from "path"

export const dynamic = "force-dynamic"

function findPrismaBin(): string {
  const cwd = process.cwd()
  const candidates = [
    path.join(cwd, "node_modules", ".bin", "prisma"),
    path.join(cwd, "..", "node_modules", ".bin", "prisma"),
    path.join("/app", "node_modules", ".bin", "prisma"),
  ]
  for (const c of candidates) {
    try {
      fs.accessSync(c, fs.constants.X_OK)
      return c
    } catch {}
  }
  return "npx prisma"
}

function findRoot(): string {
  const cwd = process.cwd()
  // Check if schema exists in cwd or parent
  for (const dir of [cwd, path.join(cwd, ".."), "/app"]) {
    if (fs.existsSync(path.join(dir, "prisma", "schema.prisma"))) return dir
  }
  return cwd
}

function run(cmd: string): string {
  try {
    return execSync(cmd, {
      cwd: process.cwd(),
      env: {
        ...process.env,
        DATABASE_URL: process.env.DATABASE_URL,
      },
      encoding: "utf8",
      timeout: 120000,
    }).toString()
  } catch (e: unknown) {
    const err = e as { stderr?: Buffer | string; stdout?: Buffer | string; message?: string }
    return (err.stdout?.toString() || "") + "\n" + (err.stderr?.toString() || "") + "\n" + (err.message || String(e))
  }
}

export async function GET() {
  const results: Record<string, unknown> = {}
  const bin = findPrismaBin()
  const root = findRoot()
  const schemaFile = path.join(root, "prisma", "schema.prisma")
  const configFile = path.join(root, "prisma.config.ts")

  results.prismaBin = bin
  results.cwd = process.cwd()
  results.root = root
  results.schemaExists = fs.existsSync(schemaFile)
  results.configExists = fs.existsSync(configFile)

  results.prismaDbPush = run(`${bin} db push --accept-data-loss --schema="${schemaFile}" --config="${configFile}" 2>&1`)

  if (fs.existsSync(schemaFile)) {
    results.seed = run(`${bin} db seed --schema="${schemaFile}" --config="${configFile}" 2>&1`)
  }

  return NextResponse.json({ status: "ok", results })
}
