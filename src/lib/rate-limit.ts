import { prisma } from "./prisma"

const CLEANUP_INTERVAL = 60_000
let lastCleanup = Date.now()

export async function rateLimit(
  key: string,
  maxRequests: number,
  windowMs: number,
): Promise<{ allowed: boolean; remaining: number }> {
  if (process.env.NODE_ENV === "development") {
    return { allowed: true, remaining: maxRequests - 1 }
  }
  try {
    if (Date.now() - lastCleanup > CLEANUP_INTERVAL) {
      prisma.rateLimit.deleteMany({ where: { expiresAt: { lt: new Date() } } }).catch(() => {})
      lastCleanup = Date.now()
    }

    const now = new Date()
    const expiresAt = new Date(now.getTime() + windowMs)

    const existing = await prisma.rateLimit.findUnique({ where: { key } })

    if (!existing || existing.expiresAt < now) {
      await prisma.rateLimit.upsert({
        where: { key },
        create: { key, count: 1, expiresAt },
        update: { count: 1, expiresAt },
      })
      return { allowed: true, remaining: maxRequests - 1 }
    }

    if (existing.count >= maxRequests) {
      return { allowed: false, remaining: 0 }
    }

    await prisma.rateLimit.update({
      where: { key },
      data: { count: { increment: 1 } },
    })

    return { allowed: true, remaining: maxRequests - (existing.count + 1) }
  } catch {
    return { allowed: true, remaining: maxRequests - 1 }
  }
}
