import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Roles } from "@/lib/permissions"
import { SUBSCRIPTION_PLANS } from "@/lib/plans"

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const price = SUBSCRIPTION_PLANS[1].price

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { walletBalance: true, role: true },
  })

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  if (user.walletBalance < price) {
    return NextResponse.json({ error: "Insufficient wallet balance" }, { status: 400 })
  }

  const expiry = new Date()
  expiry.setMonth(expiry.getMonth() + 12)

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      walletBalance: { decrement: price },
      role: Roles.VIP_GOLD,
      premium: true,
      premiumSince: new Date(),
      subscriptionStatus: "active",
      subscriptionExpiry: expiry,
    },
  })

  await prisma.payment.create({
    data: {
      userId: session.user.id,
      amount: price,
      method: "wallet",
      type: "subscription",
      status: "completed",
    },
  })

  return NextResponse.json({
    success: true,
    message: "VIP Gold activated via wallet! 🎉",
  })
}
