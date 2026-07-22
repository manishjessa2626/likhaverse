import { NextResponse } from "next/server"
import { execSync } from "child_process"

export const dynamic = "force-dynamic"

function run(cmd: string): string {
  try {
    return execSync(cmd, {
      cwd: process.cwd(),
      env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
      encoding: "utf8",
      timeout: 60000,
    }).toString()
  } catch (e: unknown) {
    const err = e as { stderr?: Buffer | string; message?: string }
    return err.stderr?.toString() || err.message || String(e)
  }
}

export async function GET() {
  const results: Record<string, unknown> = {}

  results.prismaDbPush = run("npx prisma db push --accept-data-loss 2>&1")
  results.seed = run("npx prisma db seed 2>&1")

  return NextResponse.json({ status: "ok", results })
}
