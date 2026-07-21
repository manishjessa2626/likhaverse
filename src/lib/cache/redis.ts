import Redis from "ioredis"
import { createLogger } from "../observability/logger"

const log = createLogger("redis")

let client: Redis | null = null

function getRedisUrl(): string | undefined {
  return process.env.REDIS_URL || process.env.KV_URL || undefined
}

export function getRedis(): Redis | null {
  if (client) return client

  const url = getRedisUrl()
  if (!url) {
    if (process.env.NODE_ENV === "development") {
      log.warn("REDIS_URL not set — using in-memory fallback")
    }
    return null
  }

  try {
    client = new Redis(url, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 5) return null
        return Math.min(times * 200, 3000)
      },
      lazyConnect: true,
      enableOfflineQueue: false,
    })

    client.on("error", (err) => log.error({ err }, "Redis connection error"))
    client.on("connect", () => log.info("Redis connected"))
    client.on("close", () => log.warn("Redis disconnected"))

    return client
  } catch (err) {
    log.error({ err }, "Failed to create Redis client")
    return null
  }
}

const memoryCache = new Map<string, { value: string; expiresAt: number }>()

export async function cacheGet<T>(key: string): Promise<T | null> {
  const redis = getRedis()
  if (redis) {
    try {
      const raw = await redis.get(key)
      if (raw) return JSON.parse(raw) as T
      return null
    } catch {
      return null
    }
  }

  const entry = memoryCache.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    memoryCache.delete(key)
    return null
  }
  return JSON.parse(entry.value) as T
}

export async function cacheSet(key: string, value: unknown, ttlSec = 300): Promise<void> {
  const redis = getRedis()
  const serialized = JSON.stringify(value)

  if (redis) {
    try {
      await redis.setex(key, ttlSec, serialized)
      return
    } catch {
      return
    }
  }

  memoryCache.set(key, { value: serialized, expiresAt: Date.now() + ttlSec * 1000 })
}

export async function cacheDel(key: string): Promise<void> {
  const redis = getRedis()
  if (redis) {
    try { await redis.del(key) } catch { return }
    return
  }
  memoryCache.delete(key)
}

export async function cacheWrap<T>(
  key: string,
  fn: () => Promise<T>,
  ttlSec = 300,
): Promise<T> {
  const cached = await cacheGet<T>(key)
  if (cached !== null) return cached

  const fresh = await fn()
  await cacheSet(key, fresh, ttlSec)
  return fresh
}

export async function cacheStaleWhileRevalidate<T>(
  key: string,
  fn: () => Promise<T>,
  ttlSec = 300,
  staleTtlSec = 3600,
): Promise<T> {
  const redis = getRedis()
  if (!redis) return cacheWrap(key, fn, ttlSec)

  try {
    const raw = await redis.get(key)
    if (raw) {
      const parsed = JSON.parse(raw) as { data: T; expiresAt: number }
      if (Date.now() < parsed.expiresAt) return parsed.data

      fn().then((fresh) => {
        redis.setex(key, ttlSec, JSON.stringify({ data: fresh, expiresAt: Date.now() + ttlSec * 1000 })).catch(() => {})
      })

      return parsed.data
    }
  } catch {}

  const fresh = await fn()
  try {
    await redis.setex(key, ttlSec, JSON.stringify({ data: fresh, expiresAt: Date.now() + ttlSec * 1000 }))
  } catch {}
  return fresh
}

export async function acquireLock(
  key: string,
  ttlMs = 5000,
): Promise<boolean> {
  const redis = getRedis()
  if (!redis) return true

  const result = await redis.set(key, "1", "PX", ttlMs, "NX")
  return result === "OK"
}

export async function releaseLock(key: string): Promise<void> {
  const redis = getRedis()
  if (redis) {
    try { await redis.del(key) } catch {}
  }
}

export function isRedisAvailable(): boolean {
  return getRedis() !== null
}
