import { NextResponse } from "next/server"
import nodemailer from "nodemailer"
import { prisma } from "@/lib/prisma"
import { rateLimit } from "@/lib/rate-limit"

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const sanitized = email.trim().toLowerCase()
    const rl = await rateLimit(`otp:${sanitized}`, 3, 300_000)
    if (!rl.allowed) {
      return NextResponse.json({ error: "Too many requests. Try again in 5 minutes." }, { status: 429 })
    }

    const code = generateCode()

    await prisma.verificationCode.create({
      data: {
        code,
        type: "EMAIL_OTP",
        target: sanitized,
        expiresAt: new Date(Date.now() + 600_000),
      },
    })

    const from = process.env.SMTP_FROM

    if (process.env.SMTP_HOST && from) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      })

      await transporter.sendMail({
        from: `"LikhaVerse" <${from}>`,
        to: sanitized,
        subject: "Your LikhaVerse verification code",
        text: `Your verification code is: ${code}\n\nThis code expires in 10 minutes.`,
        html: `<p>Your verification code is:</p><h2>${code}</h2><p>This code expires in 10 minutes.</p>`,
      })
    } else {
      console.warn(`[EMAIL OTP] SMTP not configured (SMTP_HOST=${!!process.env.SMTP_HOST}, SMTP_FROM=${!!from}). Code for ${sanitized}: ${code}`)
    }

    const response: Record<string, unknown> = { sent: true, message: "Code sent to your email" }
    if (!process.env.SMTP_HOST || !from) {
      response.devCode = code
    }

    return NextResponse.json(response)
  } catch (err) {
    console.error("[EMAIL OTP SEND ERROR]", err)
    return NextResponse.json({ error: "Failed to send code" }, { status: 500 })
  }
}
