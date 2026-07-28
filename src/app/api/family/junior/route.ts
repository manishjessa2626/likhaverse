import { NextResponse } from "next/server"
import { apiError, getSessionOrThrow } from "@/lib/api-auth"
import {
  getJuniorProfiles,
  createJuniorProfile,
  archiveJuniorProfile,
} from "@/lib/junior-service"

export async function GET() {
  try {
    const session = await getSessionOrThrow()
    const profiles = await getJuniorProfiles(session.user.id)
    return NextResponse.json(profiles)
  } catch (error) {
    return apiError(error, "Failed to fetch junior profiles")
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionOrThrow()
    const body = await request.json()
    const { displayName, age, readingLevel, avatar } = body

    const profile = await createJuniorProfile({
      displayName,
      age,
      readingLevel,
      avatar,
      parentUserId: session.user.id,
    })

    return NextResponse.json(profile, { status: 201 })
  } catch (error) {
    return apiError(error, "Failed to create junior profile")
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSessionOrThrow()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json({ error: "id query parameter is required" }, { status: 400 })
    }

    await archiveJuniorProfile(id, session.user.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return apiError(error, "Failed to archive junior profile")
  }
}
