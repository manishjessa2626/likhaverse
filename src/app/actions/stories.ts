"use server"

import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { requireAuth, requireAuthor, isSuperAdmin, Roles } from "@/lib/permissions"
import { rateLimit } from "@/lib/rate-limit"
import { getErrorMessage } from "@/lib/errors"
import { z } from "zod"
const CreateStorySchema = z.object({
  title: z.string().min(1, "Title is required").max(200).trim(),
  description: z.string().max(5000).trim().optional(),
  cover: z.string().optional(),
  tags: z.string().trim().optional(),
  freePreviewChapters: z.coerce.number().int().min(1).max(100).default(5),
})

const UpdateStorySchema = CreateStorySchema.partial().extend({
  status: z.enum(["DRAFT", "PUBLISHED", "COMPLETED"]).optional(),
  accessType: z.enum(["FREE", "FREEMIUM", "PREMIUM"]).optional(),
})

export async function createStory(prevState: unknown, formData: FormData) {
  const session = await getServerSession(authOptions)
  try {
    const user = requireAuthor(session)

    const validated = CreateStorySchema.safeParse({
      title: formData.get("title"),
      description: formData.get("description"),
      cover: formData.get("cover"),
      tags: formData.get("tags"),
      freePreviewChapters: formData.get("freePreviewChapters"),
    })

    if (!validated.success) {
      return { error: validated.error.flatten().fieldErrors, message: "" }
    }

    const story = await prisma.story.create({
      data: {
        ...validated.data,
        authorId: user.id,
      },
    })

    revalidatePath("/author/stories")
    return { error: null, message: story.id }
  } catch (e) {
    return { error: null, message: getErrorMessage(e) }
  }
}

export async function updateStory(storyId: string, prevState: unknown, formData: FormData) {
  const session = await getServerSession(authOptions)
  try {
    const user = requireAuthor(session)

    const story = await prisma.story.findUnique({ where: { id: storyId } })
    if (!story) throw new Error("Story not found")
    if (story.authorId !== user.id && !isSuperAdmin(session)) {
      throw new Error("Access denied")
    }

    const validated = UpdateStorySchema.safeParse({
      title: formData.get("title"),
      description: formData.get("description"),
      cover: formData.get("cover"),
      tags: formData.get("tags"),
      freePreviewChapters: formData.get("freePreviewChapters"),
      status: formData.get("status"),
      accessType: formData.get("accessType"),
    })

    if (!validated.success) {
      return { error: validated.error.flatten().fieldErrors, message: "" }
    }

    if (validated.data.status === "COMPLETED") {
      const [chapterCount, lastChapter] = await Promise.all([
        prisma.chapter.count({ where: { storyId } }),
        prisma.chapter.findFirst({
          where: { storyId },
          orderBy: { number: "desc" },
          select: { id: true, content: true },
        }),
      ])
      if (chapterCount === 0) {
        return { error: null, message: "Cannot mark as completed — story must have at least one chapter." }
      }
      if (!lastChapter || !lastChapter.content?.trim()) {
        return { error: null, message: "Cannot mark as completed — the final chapter must have content." }
      }
    }

    const updateData: Record<string, unknown> = { ...validated.data }
    if (validated.data.status === "COMPLETED") {
      updateData.completedAt = new Date()
      updateData.completedBadge = true
    } else if (validated.data.status) {
      updateData.completedAt = null
      updateData.completedBadge = false
    }

    await prisma.story.update({
      where: { id: storyId },
      data: updateData,
    })

    revalidatePath("/author/stories/" + storyId)
    return { error: null, message: "Story updated!" }
  } catch (e) {
    return { error: null, message: getErrorMessage(e) }
  }
}

export async function deleteStory(storyId: string) {
  const session = await getServerSession(authOptions)
  try {
    const user = requireAuthor(session)
    const story = await prisma.story.findUnique({ where: { id: storyId } })
    if (!story) throw new Error("Story not found")
    if (story.authorId !== user.id && !isSuperAdmin(session)) {
      throw new Error("Access denied")
    }
    await prisma.story.delete({ where: { id: storyId } })
    revalidatePath("/author/stories")
    return { error: null, message: "Story deleted" }
  } catch (e) {
    return { error: null, message: getErrorMessage(e) }
  }
}

export async function getAuthorStories() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return []
  return prisma.story.findMany({
    where: { authorId: session.user.id },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { chapters: true } } },
  })
}

export async function getStoryById(storyId: string) {
  return prisma.story.findUnique({
    where: { id: storyId },
    include: {
      author: { select: { id: true, name: true, avatar: true, bio: true } },
      chapters: { orderBy: { number: "asc" }, select: { id: true, title: true, number: true, createdAt: true } },
      _count: { select: { saves: true, comments: true, chapters: true } },
    },
  })
}

export async function getStoriesForHomepage() {
  const trending = await prisma.story.findMany({
    where: {
      status: { in: ["PUBLISHED", "COMPLETED"] },
      author: { role: { notIn: ["SUPER_ADMIN", "ADMIN"] } },
    },
    orderBy: { viewCount: "desc" },
    take: 6,
    include: {
      author: { select: { id: true, name: true, role: true } },
      _count: { select: { chapters: true, saves: true } },
    },
  })

  const latest = await prisma.story.findMany({
    where: {
      status: { in: ["PUBLISHED", "COMPLETED"] },
      author: { role: { notIn: ["SUPER_ADMIN", "ADMIN"] } },
    },
    orderBy: { createdAt: "desc" },
    take: 6,
    include: {
      author: { select: { id: true, name: true, role: true } },
      _count: { select: { chapters: true, saves: true } },
    },
  })

  const mostFollowed = await prisma.story.findMany({
    where: {
      status: { in: ["PUBLISHED", "COMPLETED"] },
      author: { role: { notIn: ["SUPER_ADMIN", "ADMIN"] } },
    },
    orderBy: { viewCount: "desc" },
    take: 4,
    include: {
      author: { select: { id: true, name: true, role: true } },
      _count: { select: { chapters: true, saves: true } },
    },
  })

  const authors = await prisma.user.findMany({
    where: {
      role: { in: ["AUTHOR", "PREMIUM_CREATOR"] },
      stories: { some: { status: { in: ["PUBLISHED", "COMPLETED"] } } },
    },
    include: {
      _count: { select: { followers: true, stories: true } },
    },
  })
  const featuredAuthors = authors
    .sort((a, b) => b._count.followers - a._count.followers)
    .slice(0, 4)

  return { trending, latest, mostFollowed, featuredAuthors }
}

export async function recordStoryView(storyId: string) {
  const session = await getServerSession(authOptions)
  const key = session?.user?.id ?? "anon"
  const role = (session?.user as { role?: string } | undefined)?.role
  if (role !== "SUPER_ADMIN") {
    const { allowed } = await rateLimit(`view:${key}`, 30, 60_000)
    if (!allowed) return
  }

  try {
    // Dedup: skip if same user viewed in last 5 minutes
    if (key !== "anon") {
      const recent = await prisma.storyView.findFirst({
        where: {
          storyId,
          userId: key,
          createdAt: { gte: new Date(Date.now() - 300_000) },
        },
      })
      if (recent) return
    }

    await prisma.storyView.create({
      data: {
        storyId,
        userId: session?.user?.id ?? null,
      },
    })
    await prisma.story.update({
      where: { id: storyId },
      data: { viewCount: { increment: 1 } },
    })
  } catch {
    // ignore
  }
}
