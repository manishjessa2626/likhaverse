import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true },
  })

  const otp = generateOtp()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

  await prisma.verificationCode.create({
    data: {
      userId: session.user.id,
      code: otp,
      type: "MFA",
      expiresAt,
    },
  })

  if (user?.email) {
    console.log(`[MFA] OTP for ${user.email}: ${otp}`)
  }

  return NextResponse.json({ sent: true })
}
