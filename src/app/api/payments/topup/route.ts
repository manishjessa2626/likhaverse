import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { TOP_UP_AMOUNTS, type PaymentMethod } from "@/lib/plans"

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { amount, method } = await request.json()
  if (!amount || !method) {
    return NextResponse.json({ error: "Missing amount or method" }, { status: 400 })
  }

  if (!TOP_UP_AMOUNTS.includes(amount)) {
    return NextResponse.json({ error: "Invalid top-up amount" }, { status: 400 })
  }

  const payment = await prisma.payment.create({
    data: {
      userId: session.user.id,
      amount,
      method,
      type: "topup",
      status: "pending",
    },
  })

  return NextResponse.json({ paymentId: payment.id })
}
