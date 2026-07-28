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

    const stored = await prisma.parentPin.findUnique({
      where: { userId: session.user.id },
      select: { pin: true },
    })

    if (!stored) {
      return NextResponse.json({ error: "No PIN set. Create one first." }, { status: 404 })
    }

    const valid = stored.pin === hashPin(pin)

    return NextResponse.json({ success: valid })
  } catch (error) {
    return apiError(error, "Failed to verify PIN")
  }
}
