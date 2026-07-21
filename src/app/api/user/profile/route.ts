import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionOrThrow, apiError } from "@/lib/api-auth"

export async function GET() {
  try {
    const session = await getSessionOrThrow()

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        avatar: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        premium: true,
        premiumSince: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    return apiError(error)
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSessionOrThrow()

    const body = await request.json()
    const { name, bio, avatar } = body

    if (name !== undefined && (typeof name !== "string" || name.trim().length === 0)) {
      return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 })
    }

    if (bio !== undefined && typeof bio !== "string") {
      return NextResponse.json({ error: "Bio must be a string" }, { status: 400 })
    }

    if (avatar !== undefined && typeof avatar !== "string") {
      return NextResponse.json({ error: "Avatar must be a string" }, { status: 400 })
    }

    const updateData: Record<string, string> = {}
    if (name !== undefined) updateData.name = name.trim()
    if (bio !== undefined) updateData.bio = bio
    if (avatar !== undefined) updateData.avatar = avatar

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        avatar: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        premium: true,
        premiumSince: true,
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    return apiError(error)
  }
}
