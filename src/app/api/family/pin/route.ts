import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiError, getSessionOrThrow } from "@/lib/api-auth"
import { hashPin } from "@/lib/junior-auth"

export async function GET() {
  try {
    const session = await getSessionOrThrow()
    const stored = await prisma.parentPin.findUnique({
      where: { parentUserId: session.user.id },
      select: { id: true, createdAt: true, updatedAt: true },
    })
    return NextResponse.json({ exists: !!stored })
  } catch (error) {
    return apiError(error, "Failed to check PIN")
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionOrThrow()
    const { pin } = await request.json()

    if (!pin || !/^\d{4,6}$/.test(pin)) {
      return NextResponse.json({ error: "PIN must be 4-6 digits" }, { status: 400 })
    }

    const hashedPin = await hashPin(pin)

    await prisma.parentPin.upsert({
      where: { parentUserId: session.user.id },
      update: { hashedPin },
      create: { parentUserId: session.user.id, hashedPin },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return apiError(error, "Failed to set PIN")
  }
}
