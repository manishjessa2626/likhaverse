import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { COIN_PACKAGES } from "@/lib/plans"
import { processIdempotent, generateIdempotencyKey } from "@/lib/security/idempotency"
import { createLogger } from "@/lib/observability/logger"
import { captureError } from "@/lib/observability/sentry"

const log = createLogger("payments")

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const body = await req.json()
    const { packageId, method, idempotencyKey } = body

    const key = idempotencyKey || generateIdempotencyKey()

    const result = await processIdempotent(key, async () => {
      const pkg = COIN_PACKAGES.find((p) => p.id === packageId)
      if (!pkg) {
        throw Object.assign(new Error("Invalid package"), { statusCode: 400 })
      }

      const user = await prisma.user.findUnique({ where: { id: session.user.id } })
      if (!user) {
        throw Object.assign(new Error("User not found"), { statusCode: 404 })
      }

      const newBalance = user.walletBalance + pkg.coins

      const [, , payment] = await prisma.$transaction([
        prisma.user.update({
          where: { id: session.user.id },
          data: { walletBalance: newBalance },
        }),
        prisma.walletTransaction.create({
          data: {
            userId: session.user.id,
            type: "PURCHASE",
            amount: pkg.coins,
            balance: newBalance,
            description: `Bought ${pkg.coins} coins (₱${pkg.price} via ${method})`,
          },
        }),
        prisma.payment.create({
          data: {
            userId: session.user.id,
            amount: pkg.price,
            method,
            type: "coin_purchase",
            status: "completed",
          },
        }),
      ])

      log.info({ userId: session.user.id, coins: pkg.coins, amount: pkg.price }, "Coin purchase completed")

      return {
        success: true,
        coins: pkg.coins,
        balance: newBalance,
        paymentId: payment.id,
      }
    })

    if (result.status === "duplicate") {
      return NextResponse.json({ ...result.data, duplicate: true })
    }

    if (result.status === "in_progress") {
      return NextResponse.json({ error: "Request already being processed" }, { status: 409 })
    }

    return NextResponse.json(result.data)
  } catch (error: any) {
    await captureError(error, { context: "buy-coins" })
    const status = error.statusCode || 500
    return NextResponse.json(
      { error: status === 500 ? "Purchase failed. Please try again." : error.message },
      { status },
    )
  }
}
