"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/permissions"

export async function getDashboardAnalytics() {
  const session = await getServerSession(authOptions)
  try {
    requireAdmin(session)
  } catch {
    return null
  }

  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const [
    totalUsers,
    totalStories,
    totalChapters,
    totalComments,
    totalViews,
    totalReactions,
    totalPremium,
    totalAuthors,
    recentUsers,
    recentStories,
    topStories,
    topAuthors,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.story.count(),
    prisma.chapter.count(),
    prisma.comment.count(),
    prisma.storyView.count(),
    prisma.reaction.count(),
    prisma.user.count({ where: { premium: true } }),
    prisma.user.count({ where: { role: "AUTHOR" } }),
    prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.story.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.story.findMany({
      orderBy: { viewCount: "desc" },
      take: 10,
      select: {
        id: true, title: true, viewCount: true, wordCount: true,
        _count: { select: { saves: true, comments: true } },
        author: { select: { name: true } },
      },
    }),
    prisma.user.findMany({
      where: { role: "AUTHOR" },
      include: { _count: { select: { followers: true, stories: true } } },
      orderBy: { followers: { _count: "desc" } },
      take: 10,
    }),
  ])

  const viewsByDay = await prisma.storyView.groupBy({
    by: ["createdAt"],
    _count: true,
    orderBy: { createdAt: "asc" },
  })

  const roleDistribution = await prisma.user.groupBy({
    by: ["role"],
    _count: true,
  })

  return {
    totalUsers,
    totalStories,
    totalChapters,
    totalComments,
    totalViews,
    totalReactions,
    totalPremium,
    totalAuthors,
    recentUsers,
    recentStories,
    topStories,
    topAuthors: topAuthors.map((a) => ({
      id: a.id,
      name: a.name,
      followers: a._count.followers,
      stories: a._count.stories,
    })),
    viewsByDay: viewsByDay.map((v) => ({
      date: v.createdAt.toISOString().split("T")[0],
      count: v._count,
    })),
    roleDistribution: roleDistribution.map((r) => ({
      role: r.role,
      count: r._count,
    })),
  }
}

export async function getGenerationUsage() {
  const session = await getServerSession(authOptions)
  try {
    requireAdmin(session)
  } catch {
    return null
  }

  const usage = await prisma.aIGeneration.groupBy({
    by: ["type"],
    _count: true,
    orderBy: { _count: { type: "desc" } },
  })

  const topGenerators = await prisma.aIGeneration.groupBy({
    by: ["userId"],
    _count: true,
    orderBy: { _count: { userId: "desc" } },
    take: 10,
  })

  const userIds = topGenerators.map((g) => g.userId)
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true },
  })

  return {
    byType: usage.map((u) => ({ type: u.type, count: u._count })),
    topUsers: topGenerators.map((g) => ({
      user: users.find((u) => u.id === g.userId)?.name || "Unknown",
      count: g._count,
    })),
  }
}

export async function getPremiumAnalytics() {
  const session = await getServerSession(authOptions)
  try {
    requireAdmin(session)
  } catch {
    return null
  }

  const monthly = await prisma.user.findMany({
    where: { premium: true },
    select: { premiumSince: true },
    orderBy: { premiumSince: "asc" },
  })

  const monthlySignups: Record<string, number> = {}
  for (const u of monthly) {
    if (u.premiumSince) {
      const key = u.premiumSince.toISOString().slice(0, 7)
      monthlySignups[key] = (monthlySignups[key] || 0) + 1
    }
  }

  return {
    total: monthly.length,
    monthly: Object.entries(monthlySignups).map(([month, count]) => ({ month, count })),
  }
}
