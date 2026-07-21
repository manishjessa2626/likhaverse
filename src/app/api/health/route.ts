import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getRedis } from "@/lib/cache/redis"
import { createLogger } from "@/lib/observability/logger"

const log = createLogger("health")

export async function GET(request: Request) {
  const start = Date.now()
  const checks: Record<string, { status: "ok" | "error"; latency?: number; error?: string }> = {}

  const dbStart = Date.now()
  try {
    await prisma.$queryRaw`SELECT 1`
    checks.database = { status: "ok", latency: Date.now() - dbStart }
  } catch (err) {
    checks.database = { status: "error", error: err instanceof Error ? err.message : "Unknown" }
  }

  const storyCheckStart = Date.now()
  try {
    const count = await prisma.story.count()
    checks.stories = { status: "ok", latency: Date.now() - storyCheckStart, error: `count=${count}` }
  } catch (err) {
    checks.stories = { status: "error", latency: Date.now() - storyCheckStart, error: err instanceof Error ? err.message : "Unknown" }
  }

  const redisStart = Date.now()
  try {
    const redis = getRedis()
    if (redis) {
      await redis.ping()
      checks.redis = { status: "ok", latency: Date.now() - redisStart }
    } else {
      checks.redis = { status: "ok", latency: 0, error: "not configured" }
    }
  } catch (err) {
    checks.redis = { status: "error", error: err instanceof Error ? err.message : "Unknown" }
  }

  const uptime = process.uptime()
  const memory = process.memoryUsage()

  const healthy = Object.values(checks).every((c) => c.status === "ok")

  const response = {
    status: healthy ? "healthy" : "degraded",
    version: process.env.npm_package_version || "1.0.0",
    timestamp: new Date().toISOString(),
    uptime: Math.floor(uptime),
    environment: process.env.NODE_ENV || "development",
    totalLatency: Date.now() - start,
    checks,
  }

  if (!healthy) {
    log.warn({ checks }, "Health check reported degraded status")
  }

  return NextResponse.json(response, {
    status: healthy ? 200 : 503,
    headers: {
      "Cache-Control": "no-store, must-revalidate",
    },
  })
}
