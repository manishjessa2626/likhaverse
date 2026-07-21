import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { processIdempotent, generateIdempotencyKey } from "@/lib/security/idempotency"
import { createLogger } from "@/lib/observability/logger"
import { captureError } from "@/lib/observability/sentry"
import { Roles } from "@/lib/permissions"

const log = createLogger("subscription")

const PLAN_PRICES: Record<string, { amount: number; role: string; months: number; label: string }> = {
  reader: { amount: 149, role: Roles.VIP_GOLD, months: 1, label: "Reader" },
  creator: { amount: 299, role: Roles.VIP_GOLD, months: 1, label: "Creator" },
  studio: { amount: 499, role: Roles.VIP_GOLD, months: 1, label: "Studio" },
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const body = await req.json()
    const { plan, method, idempotencyKey } = body

    const key = idempotencyKey || generateIdempotencyKey()

    const result = await processIdempotent(key, async () => {
      const selected = PLAN_PRICES[plan]
      if (!selected) {
        throw Object.assign(new Error("Invalid plan"), { statusCode: 400 })
      }

      const expiry = new Date()
      expiry.setMonth(expiry.getMonth() + selected.months)

      const [payment] = await prisma.$transaction([
        prisma.payment.create({
          data: {
            userId: session.user.id,
            amount: selected.amount,
            method: method || "gcash",
            type: "subscription",
            status: "completed",
          },
        }),
        prisma.user.update({
          where: { id: session.user.id },
          data: {
            role: selected.role,
            premium: true,
            premiumSince: new Date(),
            subscriptionStatus: "active",
            subscriptionExpiry: expiry,
          },
        }),
      ])

      log.info({ userId: session.user.id, plan, amount: selected.amount }, "Subscription activated")
      return { success: true, paymentId: payment.id, expiry: expiry.toISOString(), plan: selected.label }
    })

    if (result.status === "duplicate") {
      return NextResponse.json({ ...result.data, duplicate: true })
    }
    if (result.status === "in_progress") {
      return NextResponse.json({ error: "Request already being processed" }, { status: 409 })
    }

    return NextResponse.json(result.data)
  } catch (error: any) {
    await captureError(error, { context: "subscription" })
    const status = error.statusCode || 500
    return NextResponse.json(
      { error: status === 500 ? "Subscription failed. Please try again." : error.message },
      { status },
    )
  }
}
