import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiError, getSessionOrThrow } from "@/lib/api-auth"

export async function GET() {
  try {
    const session = await getSessionOrThrow()

    const [saves, continueReading] = await Promise.all([
      prisma.save.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        include: {
          story: {
            select: {
              id: true,
              title: true,
              cover: true,
              tags: true,
              status: true,
              accessType: true,
              wordCount: true,
              author: { select: { id: true, name: true, avatar: true } },
              _count: { select: { chapters: true, storyLikes: true } },
            },
          },
        },
      }),
      prisma.readingProgress.findMany({
        where: { userId: session.user.id },
        orderBy: { updatedAt: "desc" },
        take: 10,
        include: {
          story: {
            select: {
              id: true,
              title: true,
              cover: true,
              status: true,
              author: { select: { id: true, name: true } },
              _count: { select: { chapters: true } },
            },
          },
          chapter: {
            select: { id: true, title: true, number: true },
          },
        },
      }),
    ])

    return NextResponse.json({
      savedStories: saves.map((s) => ({
        ...s.story,
        savedAt: s.createdAt,
      })),
      continueReading: continueReading.map((r) => ({
        story: r.story,
        chapter: r.chapter,
        scrollPosition: r.scrollPosition,
        lastReadAt: r.updatedAt,
      })),
    })
  } catch (error) {
    return apiError(error)
  }
}
