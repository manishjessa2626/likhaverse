import { prisma } from "../prisma"
import { createLogger } from "../observability/logger"
import { v4 as uuidv4 } from "uuid"

const log = createLogger("idempotency")

export function generateIdempotencyKey(): string {
  return uuidv4()
}

const inFlightKeys = new Set<string>()

export async function processIdempotent<T>(
  idempotencyKey: string,
  processor: () => Promise<T>,
  ttlMs = 86_400_000,
): Promise<{ status: "completed" | "in_progress" | "duplicate"; data?: T }> {
  if (inFlightKeys.has(idempotencyKey)) {
    log.warn({ idempotencyKey }, "Request already in flight")
    return { status: "in_progress" }
  }

  const existing = await prisma.idempotencyKey.findUnique({
    where: { key: idempotencyKey },
  })

  if (existing) {
    log.info({ idempotencyKey, status: existing.status }, "Idempotency key replay")
    if (existing.status === "completed" && existing.result) {
      return { status: "duplicate", data: JSON.parse(existing.result) as T }
    }
    return { status: existing.status as "completed" | "in_progress" }
  }

  inFlightKeys.add(idempotencyKey)

  try {
    await prisma.idempotencyKey.create({
      data: {
        key: idempotencyKey,
        status: "in_progress",
        expiresAt: new Date(Date.now() + ttlMs),
      },
    })

    const result = await processor()

    await prisma.idempotencyKey.update({
      where: { key: idempotencyKey },
      data: {
        status: "completed",
        result: JSON.stringify(result),
      },
    })

    return { status: "completed", data: result }
  } catch (error) {
    await prisma.idempotencyKey.delete({ where: { key: idempotencyKey } }).catch(() => {})
    throw error
  } finally {
    inFlightKeys.delete(idempotencyKey)
    setTimeout(() => inFlightKeys.delete(idempotencyKey), 5000)
  }
}
