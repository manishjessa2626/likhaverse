import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Roles } from "@/lib/permissions"

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { paymentId } = await request.json()
  if (!paymentId) {
    return NextResponse.json({ error: "Missing payment ID" }, { status: 400 })
  }

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
  })

  if (!payment || payment.userId !== session.user.id) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 })
  }

  if (payment.status !== "pending") {
    return NextResponse.json({ error: "Payment already processed" }, { status: 400 })
  }

  await prisma.payment.update({
    where: { id: paymentId },
    data: { status: "completed" },
  })

  if (payment.type === "subscription") {
    const months = payment.amount >= 7000 ? 12 : 1
    const expiry = new Date()
    expiry.setMonth(expiry.getMonth() + months)

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        role: Roles.VIP_GOLD,
        premium: true,
        premiumSince: new Date(),
        subscriptionStatus: "active",
        subscriptionExpiry: expiry,
      },
    })
  } else if (payment.type === "topup") {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        walletBalance: { increment: payment.amount },
      },
    })
  }

  return NextResponse.json({
    success: true,
    message: payment.type === "subscription"
      ? "Welcome to VIP Gold! 🎉"
      : "Wallet topped up successfully!",
  })
}
