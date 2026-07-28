import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const { firebaseUid, email, firstName, lastName, username } = await req.json()

    if (!firebaseUid || !email || !firstName || !lastName || !username) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    const sanitizedEmail = email.trim().toLowerCase()
    const sanitizedUsername = username.trim().toLowerCase()

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedEmail)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    if (!/^[a-z0-9_]{3,30}$/.test(sanitizedUsername)) {
      return NextResponse.json({ error: "Username must be 3–30 characters (letters, numbers, underscores)" }, { status: 400 })
    }

    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email: sanitizedEmail },
          { username: sanitizedUsername },
          { firebaseUid },
        ],
      },
    })

    if (existing) {
      if (existing.email === sanitizedEmail) {
        return NextResponse.json({ error: "Email already registered" }, { status: 409 })
      }
      if (existing.username === sanitizedUsername) {
        return NextResponse.json({ error: "Username already taken" }, { status: 409 })
      }
      return NextResponse.json({ error: "Account already exists" }, { status: 409 })
    }

    const user = await prisma.user.create({
      data: {
        name: `${firstName.trim()} ${lastName.trim()}`,
        email: sanitizedEmail,
        username: sanitizedUsername,
        firebaseUid,
        provider: "firebase",
        isVerified: false,
        emailVerified: false,
        role: "READER",
      },
    })

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name },
      redirect: "/auth/check-email",
    })
  } catch (err) {
    console.error("[REGISTER ERROR]", err)
    return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 })
  }
}
