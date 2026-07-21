"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getErrorMessage } from "@/lib/errors"
import { cache } from "react"
import { getCachedOrFetch } from "@/lib/cache"

const storyInclude = {
  author: { select: { id: true, name: true, role: true } },
  _count: { select: { chapters: true, saves: true } },
} as const

const genres = ["romance", "fantasy", "drama", "horror", "comedy"] as const

export const getHomepageData = cache(async function getHomepageData() {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    const cacheKey = (userId || "guest") + "_homepage"

    return getCachedOrFetch(cacheKey, async () => {
      const [
        trending,
        editorsPicks,
        originals,
        latestChapters,
        personal,
        ...genreResults
      ] = await Promise.all([
        prisma.story.findMany({
          where: { status: { in: ["PUBLISHED", "COMPLETED"] } },
          orderBy: { viewCount: "desc" },
          take: 4,
          include: storyInclude,
        }).catch(() => [] as any[]),
        prisma.story.findMany({
          where: { studioBadge: true, status: { in: ["PUBLISHED", "COMPLETED"] } },
          orderBy: { updatedAt: "desc" },
          take: 4,
          include: storyInclude,
        }).catch(() => [] as any[]),
        prisma.story.findMany({
          where: { original: true, status: { in: ["PUBLISHED", "COMPLETED"] } },
          orderBy: { viewCount: "desc" },
          take: 4,
          include: {
            ...storyInclude,
            author: { select: { id: true, name: true, role: true } },
          },
        }).catch(() => [] as any[]),
        prisma.story.findMany({
          where: { status: { in: ["PUBLISHED", "COMPLETED"] } },
          orderBy: { updatedAt: "desc" },
          take: 4,
          include: storyInclude,
        }).catch(() => [] as any[]),
        userId
          ? getPersonalContent(userId)
          : Promise.resolve(null),
        ...genres.map((tag) =>
          prisma.story.findMany({
            where: {
              status: { in: ["PUBLISHED", "COMPLETED"] },
              tags: { contains: tag },
            },
            orderBy: { viewCount: "desc" },
            take: 4,
            include: storyInclude,
          }).catch(() => [] as any[]),
        ),
      ])

      const genreData = Object.fromEntries(
        genres.map((tag, i) => [tag, genreResults[i] as any[]])
      )

      return {
        trending: trending ?? [],
        editorsPicks: editorsPicks ?? [],
        originals: originals ?? [],
        latestChapters: latestChapters ?? [],
        personal,
        genreData: genreData ?? {},
      }
    })
  } catch (e) {
    console.error("getHomepageData error:", getErrorMessage(e))
    return {
      trending: [],
      editorsPicks: [],
      originals: [],
      latestChapters: [],
      personal: null,
      genreData: {},
    }
  }
})

async function getPersonalContent(userId: string) {
  try {
    const [recentViews, followingAuthors, bookmarkedIds] = await Promise.all([
      prisma.storyView.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 4,
        include: { story: { include: storyInclude } },
      }),
      prisma.follow.findMany({
        where: { followerId: userId },
        select: { followingId: true },
      }),
      prisma.save.findMany({
        where: { userId },
        select: { storyId: true },
        take: 20,
      }),
    ])

    const recentlyViewed = recentViews.map((v) => v.story)
    const followingIds = followingAuthors.map((f) => f.followingId)

    // Stories from followed authors
    const followingStories = followingIds.length > 0
      ? await prisma.story.findMany({
          where: {
            authorId: { in: followingIds },
            status: { in: ["PUBLISHED", "COMPLETED"] },
            id: { notIn: bookmarkedIds.map((b) => b.storyId) },
          },
          orderBy: { updatedAt: "desc" },
          take: 4,
          include: storyInclude,
        })
      : []

    // AI recommendations based on user's reading history tags
    const userTags = recentViews
      .flatMap((v) => v.story.tags?.split(",").map((t: string) => t.trim().toLowerCase()) ?? [])
      .filter(Boolean)
      .slice(0, 10)

    const excludeIds = [
      ...new Set([
        ...recentViews.map((v) => v.storyId),
        ...bookmarkedIds.map((s) => s.storyId),
      ]),
    ]

    let recommended: typeof recentlyViewed = []
    if (userTags.length > 0) {
      recommended = await prisma.story.findMany({
        where: {
          status: { in: ["PUBLISHED", "COMPLETED"] },
          id: { notIn: excludeIds },
          OR: userTags.map((tag) => ({ tags: { contains: tag } })),
        },
        orderBy: { viewCount: "desc" },
        take: 4,
        include: storyInclude,
      })
    }
    if (recommended.length < 4) {
      const extras = await prisma.story.findMany({
        where: {
          status: { in: ["PUBLISHED", "COMPLETED"] },
          id: { notIn: [...excludeIds, ...recommended.map((s) => s.id)] },
        },
        orderBy: { viewCount: "desc" },
        take: 4,
        include: storyInclude,
      })
      recommended = [...recommended, ...extras]
    }

    return {
      recentlyViewed,
      followingStories,
      recommended,
      followingIds,
    }
  } catch (e) {
    console.error("getPersonalContent error:", getErrorMessage(e))
    return null
  }
}
