"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { AppError } from "@/lib/errors"

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

function getOtpExpiry(): Date {
  return new Date(Date.now() + 10 * 60 * 1000)
}

export async function sendMfaOtp(): Promise<{ sent: boolean; message: string }> {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new AppError("Not authenticated", 401)

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, phone: true },
  })

  const otp = generateOtp()
  const expiresAt = getOtpExpiry()

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
  if (user?.phone) {
    console.log(`[MFA] OTP for ${user.phone}: ${otp}`)
  }

  return { sent: true, message: "Verification code sent" }
}

export async function verifyMfaOtp(otp: string): Promise<boolean> {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new AppError("Not authenticated", 401)

  const code = await prisma.verificationCode.findFirst({
    where: {
      userId: session.user.id,
      code: otp,
      type: "MFA",
      expiresAt: { gt: new Date() },
    },
    orderBy: { expiresAt: "desc" },
  })

  if (!code) return false

  await prisma.verificationCode.delete({ where: { id: code.id } })
  return true
}
