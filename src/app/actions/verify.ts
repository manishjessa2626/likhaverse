"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendVerificationEmail } from "@/lib/email"

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function sendVerificationCode() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return { error: "Not authenticated", message: "" }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user) return { error: "User not found", message: "" }
  if (user.emailVerified) return { error: "Email already verified", message: "" }

  const code = generateCode()

  await prisma.verificationCode.updateMany({
    where: { userId: user.id, type: "EMAIL_VERIFY", used: false },
    data: { used: true },
  })

  await prisma.verificationCode.create({
    data: {
      code,
      userId: user.id,
      type: "EMAIL_VERIFY",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  })

  if (!user.email) return { error: "No email on account", message: "" }
  const sent = await sendVerificationEmail(user.email, code)
  if (!sent) return { error: "Failed to send email. Check SMTP config.", message: "" }

  return { error: null as string | null, message: "Verification code sent!" }
}

export async function confirmVerificationCode(formCode: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return { error: "Not authenticated", message: "" }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user) return { error: "User not found", message: "" }
  if (user.emailVerified) return { error: "Already verified", message: "" }

  const record = await prisma.verificationCode.findFirst({
    where: {
      userId: user.id,
      type: "EMAIL_VERIFY",
      used: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  })

  if (!record) return { error: "No valid code. Request a new one.", message: "" }
  if (record.code !== formCode) return { error: "Incorrect code", message: "" }

  await prisma.$transaction([
    prisma.verificationCode.update({ where: { id: record.id }, data: { used: true } }),
    prisma.user.update({ where: { id: user.id }, data: { emailVerified: true } }),
  ])

  return { error: null as string | null, message: "Email verified!" }
}

export async function getVerificationStatus() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return null
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { emailVerified: true, email: true },
  })
  return user
}
