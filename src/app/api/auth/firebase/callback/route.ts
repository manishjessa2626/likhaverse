import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { adminAuth } from "@/lib/firebase-admin"

export async function POST(req: Request) {
  try {
    const { idToken, provider } = await req.json()
    if (!idToken) {
      return NextResponse.json({ error: "ID token is required" }, { status: 400 })
    }

    let firebaseUser
    try {
      firebaseUser = await adminAuth.verifyIdToken(idToken)
    } catch {
      return NextResponse.json({ error: "Invalid Firebase ID token" }, { status: 401 })
    }

    const email = firebaseUser.email || ""
    const firebaseUid = firebaseUser.uid
    const firebaseProvider = provider || "google"
    const name = firebaseUser.name || email.split("@")[0] || "User"

    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email || undefined },
          { providerId: firebaseUid },
        ].filter(Boolean),
      },
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          name,
          email: email || undefined,
          provider: firebaseProvider,
          providerId: firebaseUid,
          isVerified: true,
          emailVerified: true,
          role: "READER",
        },
      })
    } else if (!user.providerId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { providerId: firebaseUid, isVerified: true, emailVerified: true },
      })
    }

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    })
  } catch (err) {
    console.error("[FIREBASE CALLBACK ERROR]", err)
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}
