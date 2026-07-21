"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { checkEpisodeAccess } from "@/lib/episode-access"

export async function saveReadingProgress(
  storyId: string,
  chapterId: string,
  scrollPosition: number,
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return

  try {
    await prisma.readingProgress.upsert({
      where: {
        userId_storyId: { userId: session.user.id, storyId },
      },
      update: {
        chapterId,
        scrollPosition,
      },
      create: {
        userId: session.user.id,
        storyId,
        chapterId,
        scrollPosition,
      },
    })
  } catch {
    // silently fail — progress saving is non-critical
  }
}

export async function getReadingProgress(storyId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return null

  try {
    return prisma.readingProgress.findUnique({
      where: {
        userId_storyId: { userId: session.user.id, storyId },
      },
      select: {
        chapterId: true,
        scrollPosition: true,
        chapter: { select: { title: true, number: true } },
      },
    })
  } catch {
    return null
  }
}

export async function getEpisodeList(storyId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return []

  const story = await prisma.story.findUnique({
    where: { id: storyId },
    select: {
      id: true,
      title: true,
      accessType: true,
      freePreviewChapters: true,
      authorId: true,
    },
  })
  if (!story) return []

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { premium: true, role: true, isVIP: true, dailyEpisodesRead: true, lastReadReset: true, lastEpisodeUnlockTime: true },
  })
  const isPremium = user?.premium ?? false
  const isSuperAdmin = user?.role === "SUPER_ADMIN"
  const isAuthor = story.authorId === session.user.id

  const chapters = await prisma.chapter.findMany({
    where: { storyId },
    orderBy: { number: "asc" },
    select: { id: true, number: true, title: true },
  })

  const readChapters = await prisma.readingProgress.findMany({
    where: { userId: session.user.id, storyId },
    select: { chapterId: true },
  })
  const readIds = new Set(readChapters.map((r) => r.chapterId))

  return chapters.map((ch, i) => {
    const isFree =
      story.accessType === "FREE" ||
      (story.accessType !== "PREMIUM" && i < story.freePreviewChapters)
    let canAccess = isFree || isPremium || isAuthor || isSuperAdmin

    let restrictionReason: "DAILY_LIMIT" | "WAIT_TIMER" | null = null
    if (canAccess && !isPremium && !isAuthor && !isSuperAdmin && user) {
      const access = checkEpisodeAccess(
        {
          isVIP: user.isVIP ?? false,
          premium: user.premium,
          role: user.role,
          dailyEpisodesRead: user.dailyEpisodesRead,
          lastReadReset: user.lastReadReset,
          lastEpisodeUnlockTime: user.lastEpisodeUnlockTime,
        },
        ch.number,
      )
      if (!access.allowed) {
        canAccess = false
        restrictionReason = access.reason ?? null
      }
    }

    return {
      ...ch,
      isFree,
      canAccess,
      isRead: readIds.has(ch.id),
      restrictionReason,
    }
  })
}

export type RestrictionReason = "DAILY_LIMIT" | "WAIT_TIMER" | null

export async function checkChapterAccessAction(storyId: string, chapterNumber: number): Promise<{
  allowed: boolean
  reason: RestrictionReason
  nextUnlockTime: Date | null
}> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return { allowed: false, reason: null, nextUnlockTime: null }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { premium: true, role: true, isVIP: true, dailyEpisodesRead: true, lastReadReset: true, lastEpisodeUnlockTime: true, id: true },
    })
    if (!user) return { allowed: false, reason: null, nextUnlockTime: null }

    const isPremium = user.premium
    const isSuperAdmin = user.role === "SUPER_ADMIN"
    if (isPremium || isSuperAdmin) return { allowed: true, reason: null, nextUnlockTime: null }

    const story = await prisma.story.findUnique({
      where: { id: storyId },
      select: { authorId: true },
    })
    if (!story) return { allowed: false, reason: null, nextUnlockTime: null }
    if (story.authorId === session.user.id) return { allowed: true, reason: null, nextUnlockTime: null }

    const access = checkEpisodeAccess(
      {
        isVIP: user.isVIP ?? false,
        premium: user.premium,
        role: user.role,
        dailyEpisodesRead: user.dailyEpisodesRead,
        lastReadReset: user.lastReadReset,
        lastEpisodeUnlockTime: user.lastEpisodeUnlockTime,
      },
      chapterNumber,
    )

    return {
      allowed: access.allowed,
      reason: access.reason ?? null,
      nextUnlockTime: user.lastEpisodeUnlockTime,
    }
  } catch {
    return { allowed: true, reason: null, nextUnlockTime: null }
  }
}

export async function recordEpisodeAccessAction(storyId: string, chapterNumber: number): Promise<void> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, premium: true, role: true, isVIP: true, dailyEpisodesRead: true, lastReadReset: true, lastEpisodeUnlockTime: true },
    })
    if (!user) return

    const isVip = user.isVIP || user.premium || ["VIP_GOLD", "PREMIUM_CREATOR", "ADMIN", "SUPER_ADMIN"].includes(user.role)
    if (isVip) return

    const now = new Date()
    const needsReset = !user.lastReadReset || (now.getTime() - new Date(user.lastReadReset).getTime() >= 24 * 60 * 60 * 1000)

    if (chapterNumber <= 20) {
      if (needsReset) {
        await prisma.user.update({
          where: { id: user.id },
          data: { dailyEpisodesRead: 1, lastReadReset: now },
        })
      } else {
        await prisma.user.update({
          where: { id: user.id },
          data: { dailyEpisodesRead: { increment: 1 } },
        })
      }
    } else {
      const nextUnlock = new Date(now.getTime() + 24 * 60 * 60 * 1000)
      await prisma.user.update({
        where: { id: user.id },
        data: {
          lastEpisodeUnlockTime: nextUnlock,
          ...(needsReset ? { dailyEpisodesRead: 0, lastReadReset: now } : {}),
        },
      })
    }
  } catch {
    // silently fail — tracking is non-critical
  }
}

export async function getContinueReading() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return []

  try {
    return prisma.readingProgress.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: {
        story: {
          select: {
            id: true,
            title: true,
            cover: true,
            author: { select: { name: true } },
          },
        },
        chapter: {
          select: { title: true, number: true },
        },
      },
    })
  } catch {
    return []
  }
}
