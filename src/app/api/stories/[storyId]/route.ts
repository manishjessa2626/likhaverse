import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { apiError, getSessionOrThrow } from "@/lib/api-auth"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ storyId: string }> },
) {
  try {
    const { storyId } = await params
    const session = await getServerSession(authOptions)

    const story = await prisma.story.findUnique({
      where: { id: storyId },
      include: {
        author: { select: { id: true, name: true, avatar: true, bio: true, role: true } },
        chapters: {
          orderBy: { number: "asc" },
          select: { id: true, title: true, number: true, createdAt: true, wordCount: true },
        },
        seasons: {
          orderBy: { number: "asc" },
          include: { _count: { select: { chapters: true } } },
        },
        characters: {
          orderBy: { createdAt: "asc" },
          select: { id: true, name: true, imageUrl: true },
        },
        _count: { select: { saves: true, comments: true, chapters: true, storyLikes: true } },
      },
    })

    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 })
    }

    if (story.status === "DRAFT" && story.authorId !== session?.user?.id) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 })
    }

    const isSaved = session?.user
      ? !!(await prisma.save.findUnique({
          where: { userId_storyId: { userId: session.user.id, storyId } },
        }))
      : false

    const isLiked = session?.user
      ? !!(await prisma.storyLike.findUnique({
          where: { userId_storyId: { userId: session.user.id, storyId } },
        }))
      : false

    return NextResponse.json({ ...story, isSaved, isLiked })
  } catch (error) {
    return apiError(error)
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ storyId: string }> },
) {
  try {
    const session = await getSessionOrThrow()
    const { storyId } = await params

    const existing = await prisma.story.findUnique({
      where: { id: storyId },
      select: { authorId: true },
    })
    if (!existing) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 })
    }
    if (existing.authorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const allowed = ["title", "description", "cover", "tags", "status", "accessType", "freePreviewChapters"]
    const updateData: Record<string, unknown> = {}
    for (const key of allowed) {
      if (body[key] !== undefined) updateData[key] = body[key]
    }

    if (updateData.status === "COMPLETED") {
      updateData.completedAt = new Date()
    }

    const story = await prisma.story.update({
      where: { id: storyId },
      data: updateData,
      select: {
        id: true,
        title: true,
        status: true,
        accessType: true,
        updatedAt: true,
      },
    })

    return NextResponse.json(story)
  } catch (error) {
    return apiError(error, "Failed to update story")
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ storyId: string }> },
) {
  try {
    const session = await getSessionOrThrow()
    const { storyId } = await params

    const existing = await prisma.story.findUnique({
      where: { id: storyId },
      select: { authorId: true },
    })
    if (!existing) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 })
    }
    if (existing.authorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await prisma.story.delete({ where: { id: storyId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return apiError(error, "Failed to delete story")
  }
}
