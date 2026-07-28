import { NextResponse } from "next/server"
import { apiError, getSessionOrThrow } from "@/lib/api-auth"
import { verifyParentPin } from "@/lib/junior-auth"

export async function POST(request: Request) {
  try {
    const session = await getSessionOrThrow()
    const { pin } = await request.json()

    if (!pin || !/^\d{4,6}$/.test(pin)) {
      return NextResponse.json({ verified: false, error: "PIN must be 4-6 digits" }, { status: 400 })
    }

    const verified = await verifyParentPin(session.user.id, pin)
    if (!verified) {
      return NextResponse.json({ verified: false, error: "Incorrect PIN" }, { status: 401 })
    }

    return NextResponse.json({ verified: true })
  } catch (error) {
    return apiError(error, "Failed to verify PIN")
  }
}
