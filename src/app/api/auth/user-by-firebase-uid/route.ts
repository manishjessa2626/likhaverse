import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const uid = searchParams.get("uid")
    if (!uid) {
      return NextResponse.json({ error: "uid query parameter is required" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { firebaseUid: uid },
      select: { id: true, email: true, name: true, role: true, isVerified: true },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (err) {
    console.error("[USER BY FIREBASE UID ERROR]", err)
    return NextResponse.json({ error: "Failed to find user" }, { status: 500 })
  }
}
