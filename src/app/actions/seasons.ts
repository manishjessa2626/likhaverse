"use server"

import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { requireAuthor } from "@/lib/permissions"
import { getErrorMessage } from "@/lib/errors"
import { z } from "zod"

const CreateSeasonSchema = z.object({
  title: z.string().min(1, "Title is required").max(500).trim(),
})

export async function createSeason(storyId: string, prevState: unknown, formData: FormData) {
  const session = await getServerSession(authOptions)
  try {
    const user = requireAuthor(session)

    const story = await prisma.story.findUnique({ where: { id: storyId } })
    if (!story || story.authorId !== user.id) {
      return { error: null, message: "Story not found or access denied" }
    }

    const validated = CreateSeasonSchema.safeParse({
      title: formData.get("title"),
    })

    if (!validated.success) {
      return { error: validated.error.flatten().fieldErrors, message: "" }
    }

    const lastSeason = await prisma.season.findFirst({
      where: { storyId },
      orderBy: { number: "desc" },
    })

    await prisma.season.create({
      data: {
        ...validated.data,
        number: (lastSeason?.number ?? 0) + 1,
        storyId,
      },
    })

    revalidatePath("/author/stories/" + storyId)
    return { error: null, message: "Season created!" }
  } catch (e) {
    return { error: null, message: getErrorMessage(e) }
  }
}

export async function moveChapterToSeason(chapterId: string, seasonId: string) {
  const session = await getServerSession(authOptions)
  try {
    const user = requireAuthor(session)

    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: { story: { select: { authorId: true } } },
    })
    if (!chapter || chapter.story.authorId !== user.id) {
      return { error: null, message: "Access denied" }
    }

    await prisma.chapter.update({
      where: { id: chapterId },
      data: { seasonId },
    })

    revalidatePath("/author/stories/" + chapter.storyId)
    return { error: null, message: "Chapter moved to season" }
  } catch (e) {
    return { error: null, message: getErrorMessage(e) }
  }
}

export async function removeChapterFromSeason(chapterId: string) {
  const session = await getServerSession(authOptions)
  try {
    const user = requireAuthor(session)

    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: { story: { select: { authorId: true } } },
    })
    if (!chapter || chapter.story.authorId !== user.id) {
      return { error: null, message: "Access denied" }
    }

    await prisma.chapter.update({
      where: { id: chapterId },
      data: { seasonId: null },
    })

    revalidatePath("/author/stories/" + chapter.storyId)
    return { error: null, message: "Chapter removed from season" }
  } catch (e) {
    return { error: null, message: getErrorMessage(e) }
  }
}

export async function deleteSeason(seasonId: string) {
  const session = await getServerSession(authOptions)
  try {
    const user = requireAuthor(session)

    const season = await prisma.season.findUnique({
      where: { id: seasonId },
      include: { story: { select: { authorId: true } } },
    })
    if (!season || season.story.authorId !== user.id) {
      return { error: null, message: "Access denied" }
    }

    await prisma.season.delete({ where: { id: seasonId } })

    revalidatePath("/author/stories/" + season.storyId)
    return { error: null, message: "Season deleted" }
  } catch (e) {
    return { error: null, message: getErrorMessage(e) }
  }
}

export async function getSeasons(storyId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return []
  return prisma.season.findMany({
    where: { storyId },
    orderBy: { number: "asc" },
    include: {
      chapters: {
        orderBy: { number: "asc" },
        select: { id: true, title: true, number: true },
      },
    },
  })
}
