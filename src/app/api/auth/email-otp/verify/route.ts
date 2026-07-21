import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const { email, code, name } = await req.json()
    if (!email || !code) {
      return NextResponse.json({ error: "Email and code are required" }, { status: 400 })
    }

    const sanitized = email.trim().toLowerCase()

    const record = await prisma.verificationCode.findFirst({
      where: {
        target: sanitized,
        type: "EMAIL_OTP",
        code,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    })

    if (!record) {
      return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 })
    }

    await prisma.verificationCode.update({
      where: { id: record.id },
      data: { used: true },
    })

    let user = await prisma.user.findUnique({ where: { email: sanitized } })

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: name?.trim() || sanitized.split("@")[0],
          email: sanitized,
          provider: "email",
          isVerified: true,
          emailVerified: true,
          role: "READER",
        },
      })
    }

    return NextResponse.json({
      verified: true,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    })
  } catch (err) {
    console.error("[EMAIL OTP VERIFY ERROR]", err)
    return NextResponse.json({ error: "Verification failed" }, { status: 500 })
  }
}
