import { NextResponse } from "next/server"
import { createHash } from "crypto"
import { prisma } from "@/lib/prisma"
import { apiError, getSessionOrThrow } from "@/lib/api-auth"

function hashPin(pin: string): string {
  return createHash("sha256").update(pin + "likhaverse-junior-salt").digest("hex")
}

export async function POST(request: Request) {
  try {
    const session = await getSessionOrThrow()
    const body = await request.json()
    const { pin } = body

    if (!pin || !/^\d{4,6}$/.test(pin)) {
      return NextResponse.json({ error: "PIN must be 4-6 digits" }, { status: 400 })
    }

    const hashed = hashPin(pin)

    const parentPin = await prisma.parentPin.upsert({
      where: { userId: session.user.id },
      update: { pin: hashed },
      create: { userId: session.user.id, pin: hashed },
    })

    return NextResponse.json({ success: true, message: "PIN set successfully" })
  } catch (error) {
    return apiError(error, "Failed to set PIN")
  }
}
