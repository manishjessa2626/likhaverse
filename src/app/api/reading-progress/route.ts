import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiError, getSessionOrThrow } from "@/lib/api-auth"

export async function GET(request: Request) {
  try {
    const session = await getSessionOrThrow()
    const { searchParams } = new URL(request.url)
    const storyId = searchParams.get("storyId")

    if (!storyId) {
      return NextResponse.json({ error: "storyId query parameter is required" }, { status: 400 })
    }

    const progress = await prisma.readingProgress.findUnique({
      where: {
        userId_storyId: { userId: session.user.id, storyId },
      },
      select: {
        chapterId: true,
        scrollPosition: true,
        updatedAt: true,
        chapter: { select: { title: true, number: true } },
      },
    })

    return NextResponse.json(progress ?? { chapterId: null, scrollPosition: null })
  } catch (error) {
    return apiError(error)
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionOrThrow()
    const body = await request.json()
    const { storyId, chapterId, scrollPosition } = body

    if (!storyId || !chapterId) {
      return NextResponse.json({ error: "storyId and chapterId are required" }, { status: 400 })
    }

    const progress = await prisma.readingProgress.upsert({
      where: {
        userId_storyId: { userId: session.user.id, storyId },
      },
      update: {
        chapterId,
        scrollPosition: scrollPosition ?? 0,
      },
      create: {
        userId: session.user.id,
        storyId,
        chapterId,
        scrollPosition: scrollPosition ?? 0,
      },
      select: { id: true, scrollPosition: true, updatedAt: true },
    })

    return NextResponse.json(progress)
  } catch (error) {
    return apiError(error, "Failed to save reading progress")
  }
}
