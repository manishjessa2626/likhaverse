"use server"

import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function toggleReminder(storyId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return { error: "Not authenticated" }

  const existing = await prisma.storyReminder.findUnique({
    where: { userId_storyId: { userId: session.user.id, storyId } },
  })

  if (existing) {
    await prisma.storyReminder.update({
      where: { id: existing.id },
      data: { enabled: !existing.enabled },
    })
  } else {
    await prisma.storyReminder.create({
      data: { userId: session.user.id, storyId, enabled: true },
    })
  }

  revalidatePath("/library")
  return { error: null }
}

export async function getReadingHistory() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return []

  return prisma.storyView.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      story: {
        select: {
          id: true,
          title: true,
          cover: true,
          tags: true,
          status: true,
          wordCount: true,
          author: { select: { id: true, name: true } },
          _count: { select: { chapters: true, storyLikes: true } },
        },
      },
    },
  })
}

export async function getReadingList() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return { saves: [], reminders: [] }

  const [saves, reminders] = await Promise.all([
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
            wordCount: true,
            author: { select: { id: true, name: true } },
            _count: { select: { chapters: true, storyLikes: true } },
          },
        },
      },
    }),
    prisma.storyReminder.findMany({
      where: { userId: session.user.id, enabled: true },
      include: {
        story: {
          select: {
            id: true,
            title: true,
            cover: true,
            author: { select: { name: true } },
          },
        },
      },
    }),
  ])

  return { saves, reminders }
}

export async function getLibraryData() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return null

  const userId = session.user.id
  const isSuperAdmin = session.user.role === "SUPER_ADMIN"
  const canWrite = isSuperAdmin || ["AUTHOR", "PREMIUM_CREATOR", "ADMIN"].includes(session.user.role ?? "")
  const canFilm = isSuperAdmin || (session.user.role === "PREMIUM_CREATOR" && true)

  const [
    continueReading,
    saves,
    reminders,
    readingHistory,
    authoredStories,
  ] = await Promise.all([
    prisma.readingProgress.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: 20,
      include: {
        story: {
          select: {
            id: true,
            title: true,
            cover: true,
            author: { select: { id: true, name: true } },
            _count: { select: { chapters: true } },
          },
        },
        chapter: { select: { id: true, title: true, number: true } },
      },
    }),
    prisma.save.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        story: {
          select: {
            id: true,
            title: true,
            cover: true,
            tags: true,
            status: true,
            wordCount: true,
            author: { select: { id: true, name: true } },
            _count: { select: { chapters: true, storyLikes: true } },
          },
        },
      },
    }),
    prisma.storyReminder.findMany({
      where: { userId, enabled: true },
      include: {
        story: {
          select: { id: true, title: true, cover: true, author: { select: { name: true } } },
        },
      },
    }),
    prisma.storyView.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        story: {
          select: {
            id: true,
            title: true,
            cover: true,
            tags: true,
            status: true,
            wordCount: true,
            author: { select: { id: true, name: true } },
            _count: { select: { chapters: true, storyLikes: true } },
          },
        },
      },
    }),
    canWrite
      ? prisma.story.findMany({
          where: { authorId: userId },
          orderBy: { updatedAt: "desc" },
          include: {
            _count: { select: { chapters: true, saves: true } },
          },
        })
      : Promise.resolve([]),
  ])

  return {
    userId,
    role: session.user.role,
    canWrite,
    canFilm,
    continueReading: continueReading.map((r) => ({
      storyId: r.storyId,
      chapterId: r.chapterId,
      story: r.story,
      chapter: r.chapter,
    })),
    saves: saves.map((s) => ({
      id: s.id,
      storyId: s.storyId,
      story: s.story,
    })),
    reminders: reminders.map((r) => ({
      storyId: r.storyId,
      story: r.story,
    })),
    readingHistory: readingHistory.map((v) => ({
      id: v.id,
      storyId: v.storyId,
      createdAt: v.createdAt.toISOString(),
      story: v.story,
    })),
    authoredStories: authoredStories.map((s) => ({
      id: s.id,
      title: s.title,
      cover: s.cover,
      status: s.status,
      viewCount: s.viewCount,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
      _count: { chapters: s._count.chapters, saves: s._count.saves },
    })),
  }
}
