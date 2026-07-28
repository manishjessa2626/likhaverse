import { NextResponse } from "next/server"
import { apiError, getSessionOrThrow } from "@/lib/api-auth"
import {
  getJuniorProfileById,
  updateJuniorProfile,
  archiveJuniorProfile,
} from "@/lib/junior-service"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ juniorId: string }> },
) {
  try {
    const { juniorId } = await params
    const session = await getSessionOrThrow()
    const profile = await getJuniorProfileById(juniorId, session.user.id)
    return NextResponse.json(profile)
  } catch (error) {
    return apiError(error, "Failed to fetch junior profile")
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ juniorId: string }> },
) {
  try {
    const { juniorId } = await params
    const session = await getSessionOrThrow()
    const body = await request.json()

    const updated = await updateJuniorProfile(juniorId, session.user.id, body)
    return NextResponse.json(updated)
  } catch (error) {
    return apiError(error, "Failed to update junior profile")
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ juniorId: string }> },
) {
  try {
    const { juniorId } = await params
    const session = await getSessionOrThrow()
    await archiveJuniorProfile(juniorId, session.user.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return apiError(error, "Failed to archive junior profile")
  }
}
