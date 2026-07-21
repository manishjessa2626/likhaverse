"use server"

import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { requireAuthor, isSuperAdmin } from "@/lib/permissions"
import { z } from "zod"
import { getErrorMessage } from "@/lib/errors"
import { countWords } from "@/lib/utils"

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

const CreateChapterSchema = z.object({
  title: z.string().min(1, "Title is required").max(500).trim(),
  content: z.string().trim(),
})

export async function createChapter(storyId: string, prevState: unknown, formData: FormData) {
  const session = await getServerSession(authOptions)
  try {
    const user = requireAuthor(session)

    const story = await prisma.story.findUnique({ where: { id: storyId } })
    if (!story) throw new Error("Story not found")
    if (story.authorId !== user.id && !isSuperAdmin(session)) {
      throw new Error("Access denied")
    }

    const validated = CreateChapterSchema.safeParse({
      title: formData.get("title"),
      content: formData.get("content"),
    })

    if (!validated.success) {
      return { error: validated.error.flatten().fieldErrors, message: "" }
    }

    const lastChapter = await prisma.chapter.findFirst({
      where: { storyId },
      orderBy: { number: "desc" },
    })

    const chapter = await prisma.chapter.create({
      data: {
        ...validated.data,
        number: (lastChapter?.number ?? 0) + 1,
        wordCount: countWords(validated.data.content),
        storyId,
      },
    })

    const totalWords = await prisma.chapter.aggregate({
      where: { storyId },
      _sum: { wordCount: true },
    })

    await prisma.story.update({
      where: { id: storyId },
      data: { wordCount: totalWords._sum.wordCount ?? 0 },
    })

    if (story.status !== "DRAFT") {
      await notifyReminders(storyId, story.title, user.name)
    }

    revalidatePath("/author/stories/" + storyId)
    return { error: null, message: chapter.id }
  } catch (e) {
    return { error: null, message: getErrorMessage(e) }
  }
}

export async function updateChapter(
  storyId: string,
  chapterId: string,
  prevState: unknown,
  formData: FormData
) {
  const session = await getServerSession(authOptions)
  try {
    const user = requireAuthor(session)

    const story = await prisma.story.findUnique({ where: { id: storyId } })
    if (!story) throw new Error("Story not found")
    if (story.authorId !== user.id && !isSuperAdmin(session)) {
      throw new Error("Access denied")
    }

    const chapter = await prisma.chapter.findUnique({ where: { id: chapterId } })
    if (!chapter || chapter.storyId !== storyId) {
      throw new Error("Chapter not found")
    }

    const validated = CreateChapterSchema.safeParse({
      title: formData.get("title"),
      content: formData.get("content"),
    })

    if (!validated.success) {
      return { error: validated.error.flatten().fieldErrors, message: "" }
    }

    await prisma.chapter.update({
      where: { id: chapterId },
      data: {
        ...validated.data,
        wordCount: countWords(validated.data.content),
      },
    })

    const totalWords = await prisma.chapter.aggregate({
      where: { storyId },
      _sum: { wordCount: true },
    })

    await prisma.story.update({
      where: { id: storyId },
      data: { wordCount: totalWords._sum.wordCount ?? 0 },
    })

    revalidatePath("/author/stories/" + storyId)
    return { error: null, message: "Chapter updated!" }
  } catch (e) {
    return { error: null, message: getErrorMessage(e) }
  }
}

export async function deleteChapter(storyId: string, chapterId: string) {
  const session = await getServerSession(authOptions)
  try {
    const user = requireAuthor(session)
    const story = await prisma.story.findUnique({ where: { id: storyId } })
    if (!story) throw new Error("Story not found")
    if (story.authorId !== user.id && !isSuperAdmin(session)) {
      throw new Error("Access denied")
    }
    await prisma.chapter.delete({ where: { id: chapterId } })

    const remaining = await prisma.chapter.findMany({
      where: { storyId },
      orderBy: { number: "asc" },
    })
    await prisma.$transaction(
      remaining.map((ch, i) =>
        prisma.chapter.update({
          where: { id: ch.id },
          data: { number: i + 1 },
        })
      )
    )

    const totalWords = await prisma.chapter.aggregate({
      where: { storyId },
      _sum: { wordCount: true },
    })
    await prisma.story.update({
      where: { id: storyId },
      data: { wordCount: totalWords._sum.wordCount ?? 0 },
    })

    revalidatePath("/author/stories/" + storyId)
    return { error: null, message: "Chapter deleted" }
  } catch (e) {
    return { error: null, message: getErrorMessage(e) }
  }
}

export async function getChapterById(chapterId: string) {
  return prisma.chapter.findUnique({
    where: { id: chapterId },
    include: {
      story: {
        select: {
          id: true,
          title: true,
          freePreviewChapters: true,
          authorId: true,
          author: { select: { id: true, name: true } },
        },
      },
    },
  })
}

export async function getChaptersForStory(storyId: string) {
  return prisma.chapter.findMany({
    where: { storyId },
    orderBy: { number: "asc" },
    select: { id: true, title: true, number: true, wordCount: true, createdAt: true },
  })
}
