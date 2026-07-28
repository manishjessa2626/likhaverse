import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const { firebaseUid } = await req.json()
    if (!firebaseUid) {
      return NextResponse.json({ error: "Firebase UID is required" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { firebaseUid } })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (user.isVerified) {
      return NextResponse.json({ verified: true })
    }

    await prisma.user.update({
      where: { firebaseUid },
      data: {
        isVerified: true,
        emailVerified: true,
        verifiedAt: new Date(),
      },
    })

    return NextResponse.json({ verified: true })
  } catch (err) {
    console.error("[VERIFY EMAIL ERROR]", err)
    return NextResponse.json({ error: "Verification failed" }, { status: 500 })
  }
}
