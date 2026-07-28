import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiError, getSessionOrThrow } from "@/lib/api-auth"

export async function GET(request: Request) {
  try {
    const session = await getSessionOrThrow()

    const juniors = await prisma.juniorProfile.findMany({
      where: { parentId: session.user.id },
      include: { readingProgress: true },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(juniors)
  } catch (error) {
    return apiError(error, "Failed to fetch junior profiles")
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionOrThrow()
    const body = await request.json()
    const { name, age, readingLevel, favoriteGenres, avatar } = body

    if (!name || age == null) {
      return NextResponse.json({ error: "name and age are required" }, { status: 400 })
    }

    const junior = await prisma.juniorProfile.create({
      data: {
        name,
        age,
        readingLevel: readingLevel ?? "BEGINNER",
        favoriteGenres: favoriteGenres ?? null,
        avatar: avatar ?? null,
        parentId: session.user.id,
        readingProgress: {
          create: {
            booksRead: 0,
            readingTimeMinutes: 0,
            storiesWritten: 0,
          },
        },
      },
      include: { readingProgress: true },
    })

    return NextResponse.json(junior, { status: 201 })
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

    const junior = await prisma.juniorProfile.findUnique({ where: { id } })

    if (!junior || junior.parentId !== session.user.id) {
      return NextResponse.json({ error: "Junior profile not found" }, { status: 404 })
    }

    await prisma.juniorProfile.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    return apiError(error, "Failed to delete junior profile")
  }
}
