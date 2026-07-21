"use server"

import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getErrorMessage } from "@/lib/errors"
import { isSuperAdmin } from "@/lib/permissions"

const DAILY_REWARD_AMOUNT = 8
const DAILY_AD_LIMIT = 3

function today() {
  return new Date().toISOString().slice(0, 10)
}

function yesterday() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().slice(0, 10)
}

// ── Get unlock status for a chapter ──

export async function getChapterUnlockStatus(storyId: string, chapterId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return { locked: true, requiresAuth: true }

  const [chapter, unlock, wallet] = await Promise.all([
    prisma.chapter.findUnique({
      where: { id: chapterId },
      select: { number: true, coinCost: true, wordCount: true, story: { select: { freePreviewChapters: true, accessType: true, authorId: true } } },
    }),
    prisma.chapterUnlock.findUnique({
      where: { userId_chapterId: { userId: session.user.id, chapterId } },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { walletBalance: true, premium: true, isVIP: true, role: true },
    }),
  ])

  if (!chapter) return { locked: true, error: "Chapter not found" }

  const isAuthor = chapter.story.authorId === session.user.id
  const isPremium = wallet?.premium || wallet?.isVIP || wallet?.role === "ADMIN" || wallet?.role === "SUPER_ADMIN"
  const isFree = chapter.story.accessType === "FREE" || chapter.number <= chapter.story.freePreviewChapters

  if (isAuthor || isPremium || isFree || unlock) {
    return { locked: false }
  }

  return {
    locked: true,
    coinCost: chapter.coinCost,
    balance: wallet?.walletBalance ?? 0,
    isPremium: !!wallet?.premium,
  }
}

// ── Unlock with coins ──

export async function unlockChapterWithCoins(storyId: string, chapterId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Not authenticated")

  try {
    const [chapter, user] = await Promise.all([
      prisma.chapter.findUnique({ where: { id: chapterId }, select: { coinCost: true, number: true, storyId: true } }),
      prisma.user.findUnique({ where: { id: session.user.id }, select: { walletBalance: true } }),
    ])

    if (!chapter) throw new Error("Chapter not found")
    if (!user) throw new Error("User not found")

    if (user.walletBalance < chapter.coinCost) {
      return { error: "Not enough coins", balance: user.walletBalance, cost: chapter.coinCost }
    }

    const existing = await prisma.chapterUnlock.findUnique({
      where: { userId_chapterId: { userId: session.user.id, chapterId } },
    })
    if (existing) return { error: "Already unlocked" }

    const newBalance = user.walletBalance - chapter.coinCost

    await prisma.$transaction([
      prisma.user.update({
        where: { id: session.user.id },
        data: { walletBalance: newBalance },
      }),
      prisma.walletTransaction.create({
        data: {
          userId: session.user.id,
          type: "UNLOCK_SPEND",
          amount: -chapter.coinCost,
          balance: newBalance,
          description: `Unlocked chapter ${chapter.number}`,
        },
      }),
      prisma.chapterUnlock.create({
        data: {
          userId: session.user.id,
          chapterId,
          storyId: chapter.storyId,
          method: "COINS",
          coinsSpent: chapter.coinCost,
        },
      }),
    ])

    revalidatePath(`/stories/${storyId}/chapter/${chapterId}`)
    return { success: true, balance: newBalance }
  } catch (e) {
    return { error: getErrorMessage(e) }
  }
}

// ── Claim daily reward (with streak) ──

export async function claimDailyReward() {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Not authenticated")

  try {
    const dateStr = today()

    const existing = await prisma.dailyReward.findUnique({
      where: { userId_date: { userId: session.user.id, date: dateStr } },
    })
    if (existing) return { error: "Na-claim mo na today! Balik ka bukas." }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { walletBalance: true, rewardStreak: true },
    })
    if (!user) throw new Error("User not found")

    // Check if yesterday was claimed to continue streak
    const yesterdayReward = await prisma.dailyReward.findUnique({
      where: { userId_date: { userId: session.user.id, date: yesterday() } },
    })

    let streak = yesterdayReward ? user.rewardStreak + 1 : 1
    if (streak > 30) streak = 30

    // Streak bonus: extra coins every 7 days
    const streakBonus = streak % 7 === 0 ? 20 : 0
    const amount = DAILY_REWARD_AMOUNT + streakBonus
    const newBalance = user.walletBalance + amount

    await prisma.$transaction([
      prisma.user.update({
        where: { id: session.user.id },
        data: { walletBalance: newBalance, rewardStreak: streak },
      }),
      prisma.dailyReward.create({
        data: { userId: session.user.id, date: dateStr, amount },
      }),
      prisma.walletTransaction.create({
        data: {
          userId: session.user.id,
          type: "DAILY_REWARD",
          amount,
          balance: newBalance,
          description: streakBonus > 0
            ? `Daily reward — +${amount} coins (${streak}-day streak bonus!)`
            : `Daily reward — +${amount} coins`,
          streak,
        },
      }),
    ])

    return { success: true, amount, balance: newBalance, streak }
  } catch (e) {
    return { error: getErrorMessage(e) }
  }
}

// ── Get streak info ──

export async function getStreakInfo() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return { streak: 0, claimed: true }

  const [user, todayReward, yesterdayReward] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { rewardStreak: true },
    }),
    prisma.dailyReward.findUnique({
      where: { userId_date: { userId: session.user.id, date: today() } },
    }),
    prisma.dailyReward.findUnique({
      where: { userId_date: { userId: session.user.id, date: yesterday() } },
    }),
  ])

  let streak = user?.rewardStreak ?? 0
  if (!yesterdayReward && !todayReward) streak = 0

  return {
    streak,
    claimed: !!todayReward,
  }
}

// ── Get daily reward status ──

export async function getDailyRewardStatus() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return { claimed: true }

  const existing = await prisma.dailyReward.findUnique({
    where: { userId_date: { userId: session.user.id, date: today() } },
  })

  return { claimed: !!existing }
}

// ── Get wallet ──

export async function getWallet() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return { balance: 0, transactions: [] }

  const [user, transactions] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { walletBalance: true, premium: true, rewardStreak: true },
    }),
    prisma.walletTransaction.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ])

  return {
    balance: user?.walletBalance ?? 0,
    premium: user?.premium ?? false,
    streak: user?.rewardStreak ?? 0,
    transactions,
  }
}

// ── Creator: Set chapter coin cost ──

export async function setChapterPrice(chapterId: string, coinCost: number) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Not authenticated")

  const cost = Math.max(0, Math.min(50, Math.round(coinCost)))

  try {
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: { story: { select: { authorId: true } } },
    })
    if (!chapter) throw new Error("Chapter not found")
    if (chapter.story.authorId !== session.user.id && !isSuperAdmin(session)) throw new Error("Not authorized")

    await prisma.chapter.update({
      where: { id: chapterId },
      data: { coinCost: cost },
    })

    revalidatePath(`/write/${chapter.storyId}`)
    return { success: true, coinCost: cost }
  } catch (e) {
    return { error: getErrorMessage(e) }
  }
}

// ── Creator: Set free preview chapters ──

export async function setFreePreviewChapters(storyId: string, count: number) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Not authenticated")

  const previewCount = Math.max(0, Math.min(100, Math.round(count)))

  try {
    const story = await prisma.story.findUnique({ where: { id: storyId }, select: { authorId: true } })
    if (!story) throw new Error("Story not found")
    if (story.authorId !== session.user.id && !isSuperAdmin(session)) throw new Error("Not authorized")

    await prisma.story.update({
      where: { id: storyId },
      data: { freePreviewChapters: previewCount },
    })

    revalidatePath(`/write/${storyId}`)
    return { success: true, freePreviewChapters: previewCount }
  } catch (e) {
    return { error: getErrorMessage(e) }
  }
}
