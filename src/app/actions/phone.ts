"use server"

import bcrypt from "bcryptjs"
import crypto from "crypto"
import { prisma } from "@/lib/prisma"
import { getErrorMessage } from "@/lib/errors"
import { rateLimit } from "@/lib/rate-limit"

const hashRounds = 12
const phoneRegex = /^\+[1-9]\d{6,14}$/

function generateCode(): string {
  return crypto.randomInt(100000, 999999).toString()
}

function sanitizeName(s: string): string {
  return s.replace(/[<>"'()]/g, "").trim().slice(0, 100)
}

function normalizePhone(input: string): string | null {
  const cleaned = input.replace(/[\s\-()]/g, "")
  if (phoneRegex.test(cleaned)) return cleaned
  return null
}

export async function sendPhoneOtp(phone: string) {
  const normalized = normalizePhone(phone)
  if (!normalized) {
    return { error: "Please enter a valid phone number with country code (e.g. +1234567890)" }
  }

  try {
    const rl = await rateLimit(`otp:send:${normalized}`, 3, 300_000)
    if (!rl.allowed) {
      return { error: "Too many requests. Try again later." }
    }

    const existing = await prisma.verificationCode.findFirst({
      where: { target: normalized, type: "PHONE_OTP", used: false, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    })

    if (existing) {
      const elapsed = Date.now() - existing.createdAt.getTime()
      if (elapsed < 30_000) {
        return { error: `Please wait ${Math.ceil((30_000 - elapsed) / 1000)} seconds` }
      }
    }

    await prisma.verificationCode.updateMany({
      where: { target: normalized, type: "PHONE_OTP", used: false },
      data: { used: true },
    })

    const code = generateCode()
    const hashed = await bcrypt.hash(code, hashRounds)

    await prisma.verificationCode.create({
      data: {
        code: hashed,
        type: "PHONE_OTP",
        target: normalized,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    })

    console.log(`[PHONE OTP] To ${normalized}: ${code}`)

    return { error: null, message: "Verification code sent!" }
  } catch (e) {
    return { error: getErrorMessage(e, "Failed to send code") }
  }
}

export async function verifyPhoneOtp(phone: string, code: string, name?: string) {
  const normalized = normalizePhone(phone)
  if (!normalized) {
    return { error: "Invalid phone number" }
  }
  if (!code || code.length < 4 || code.length > 6 || !/^\d+$/.test(code)) {
    return { error: "Invalid code format" }
  }

  try {
    const rl = await rateLimit(`otp:verify:${normalized}`, 5, 300_000)
    if (!rl.allowed) {
      return { error: "Too many attempts. Try again later." }
    }

    const record = await prisma.verificationCode.findFirst({
      where: {
        target: normalized,
        type: "PHONE_OTP",
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    })

    if (!record) {
      return { error: "Invalid or expired code" }
    }

    const valid = await bcrypt.compare(code, record.code)
    if (!valid) {
      return { error: "Invalid or expired code" }
    }

    await prisma.verificationCode.update({
      where: { id: record.id },
      data: { used: true },
    })

    let user = await prisma.user.findUnique({ where: { phone: normalized } })

    const now = new Date()

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: name ? sanitizeName(name) : `User ${normalized.slice(-4)}`,
          phone: normalized,
          provider: "phone",
          isVerified: true,
          role: "READER",
          accounts: {
            create: { provider: "phone", providerId: normalized, createdAt: now },
          },
        },
      })
    } else {
      await prisma.user.update({
        where: { id: user.id },
        data: { isVerified: true },
      })
      const existing = await prisma.userAccount.findUnique({
        where: { provider_providerId: { provider: "phone", providerId: normalized } },
      })
      if (!existing) {
        await prisma.userAccount.create({
          data: { userId: user.id, provider: "phone", providerId: normalized, createdAt: now },
        })
      }
    }

    return { error: null, userId: user.id }
  } catch (e) {
    return { error: getErrorMessage(e, "Verification failed") }
  }
}
