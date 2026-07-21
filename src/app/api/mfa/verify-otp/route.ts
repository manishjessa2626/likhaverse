import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { otp } = await request.json()
  if (!otp || typeof otp !== "string") {
    return NextResponse.json({ valid: false, error: "Invalid code" }, { status: 400 })
  }

  const code = await prisma.verificationCode.findFirst({
    where: {
      userId: session.user.id,
      code: otp,
      type: "MFA",
      expiresAt: { gt: new Date() },
    },
    orderBy: { expiresAt: "desc" },
  })

  if (!code) {
    return NextResponse.json({ valid: false, error: "Invalid or expired code" })
  }

  await prisma.verificationCode.delete({ where: { id: code.id } })

  return NextResponse.json({ valid: true })
}
