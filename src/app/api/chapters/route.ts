import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiError, getSessionOrThrow } from "@/lib/api-auth"

async function notifyReminders(storyId: string, storyTitle: string, authorName: string) {
  const reminders = await prisma.storyReminder.findMany({
    where: { storyId, enabled: true },
    select: { userId: true },
  })
  if (reminders.length === 0) return
  await prisma.notification.createMany({
    data: reminders.map((r) => ({
      type: "story_update",
      message: `New chapter released in "${storyTitle}"`,
      link: `/stories/${storyId}`,
      userId: r.userId,
      actorId: null,
    })),
  })
}

export async function POST(request: Request) {
  try {
    const session = await getSessionOrThrow()
    const body = await request.json()
    const { storyId, title, content, seasonId } = body

    if (!storyId || !title) {
      return NextResponse.json({ error: "storyId and title are required" }, { status: 400 })
    }
    if (content === undefined) {
      return NextResponse.json({ error: "content is required" }, { status: 400 })
    }

    const story = await prisma.story.findUnique({
      where: { id: storyId },
      select: { authorId: true, title: true, status: true },
    })
    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 })
    }
    if (story.authorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const lastChapter = await prisma.chapter.findFirst({
      where: { storyId },
      orderBy: { number: "desc" },
      select: { number: true },
    })
    const nextNumber = (lastChapter?.number ?? 0) + 1

    const wordCount = content.trim().split(/\s+/).filter(Boolean).length

    const chapter = await prisma.chapter.create({
      data: {
        storyId,
        title: title.trim(),
        content,
        number: nextNumber,
        wordCount,
        seasonId: seasonId || null,
      },
      select: {
        id: true,
        title: true,
        number: true,
        wordCount: true,
        createdAt: true,
      },
    })

    await prisma.story.update({
      where: { id: storyId },
      data: { wordCount: { increment: wordCount } },
    })

    if (story.status !== "DRAFT") {
      await notifyReminders(storyId, story.title, session.user.name)
    }

    return NextResponse.json(chapter, { status: 201 })
  } catch (error) {
    return apiError(error, "Failed to create chapter")
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSessionOrThrow()
    const body = await request.json()
    const { chapterId, title, content, seasonId } = body

    if (!chapterId) {
      return NextResponse.json({ error: "chapterId is required" }, { status: 400 })
    }

    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: { story: { select: { authorId: true } } },
    })
    if (!chapter) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 })
    }
    if (chapter.story.authorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const updateData: Record<string, unknown> = {}
    if (title !== undefined) updateData.title = title.trim()
    if (content !== undefined) {
      updateData.content = content
      updateData.wordCount = content.trim().split(/\s+/).filter(Boolean).length
    }
    if (seasonId !== undefined) updateData.seasonId = seasonId || null
    if (body.coinCost !== undefined) updateData.coinCost = Math.max(0, Math.min(50, Math.round(body.coinCost)))

    const updated = await prisma.chapter.update({
      where: { id: chapterId },
      data: updateData,
      select: { id: true, title: true, number: true, wordCount: true, updatedAt: true },
    })

    if (content !== undefined) {
      const totalWords = await prisma.chapter.aggregate({
        where: { storyId: chapter.storyId },
        _sum: { wordCount: true },
      })
      await prisma.story.update({
        where: { id: chapter.storyId },
        data: { wordCount: totalWords._sum.wordCount ?? 0 },
      })
    }

    return NextResponse.json(updated)
  } catch (error) {
    return apiError(error, "Failed to update chapter")
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSessionOrThrow()
    const body = await request.json()
    const { chapterId } = body

    if (!chapterId) {
      return NextResponse.json({ error: "chapterId is required" }, { status: 400 })
    }

    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: { story: { select: { authorId: true } } },
    })
    if (!chapter) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 })
    }
    if (chapter.story.authorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await prisma.chapter.delete({ where: { id: chapterId } })

    const totalWords = await prisma.chapter.aggregate({
      where: { storyId: chapter.storyId },
      _sum: { wordCount: true },
    })
    await prisma.story.update({
      where: { id: chapter.storyId },
      data: { wordCount: totalWords._sum.wordCount ?? 0 },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return apiError(error, "Failed to delete chapter")
  }
}
