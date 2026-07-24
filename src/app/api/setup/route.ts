import { NextResponse } from "next/server"
import { execSync } from "child_process"
import fs from "fs"
import path from "path"

export const dynamic = "force-dynamic"

function findPrismaBin(): string {
  const cwd = process.cwd()
  const candidates = [
    path.join(cwd, "node_modules", "prisma", "build", "index.js"),
    path.join(cwd, "..", "node_modules", "prisma", "build", "index.js"),
    "/app/node_modules/prisma/build/index.js",
  ]
  for (const c of candidates) {
    if (fs.existsSync(c)) return c
  }
  return "npx prisma"
}

function findRoot(): string {
  const cwd = process.cwd()
  for (const dir of [cwd, path.join(cwd, ".."), "/app"]) {
    if (fs.existsSync(path.join(dir, "prisma", "schema.prisma"))) return dir
  }
  return cwd
}

function run(nodeCmd: string): string {
  try {
    return execSync(nodeCmd, {
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

  const prismaCmd = bin.startsWith("npx") ? bin : `node ${bin}`
  results.prismaDbPush = run(`${prismaCmd} db push --accept-data-loss --schema="${schemaFile}" --config="${configFile}" 2>&1`)

  if (fs.existsSync(schemaFile)) {
    results.seed = run(`${prismaCmd} db seed --schema="${schemaFile}" --config="${configFile}" 2>&1`)
  }

  return NextResponse.json({ status: "ok", results })
}
