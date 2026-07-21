"use server"

import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getErrorMessage } from "@/lib/errors"
import { createNotification } from "@/lib/notifications"

export async function toggleStoryLike(storyId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return { error: "Please log in to like stories" }
  }

  try {
    const existing = await prisma.storyLike.findUnique({
      where: {
        userId_storyId: {
          userId: session.user.id,
          storyId,
        },
      },
    })

    if (existing) {
      await prisma.storyLike.delete({ where: { id: existing.id } })
    } else {
      const story = await prisma.story.findUnique({
        where: { id: storyId },
        select: { authorId: true, title: true },
      })

      await prisma.storyLike.create({
        data: { userId: session.user.id, storyId },
      })

      if (story && story.authorId !== session.user.id) {
        await createNotification({
          userId: story.authorId,
          type: "LIKE",
          message: `${session.user.name} liked "${story.title}"`,
          link: `/stories/${storyId}`,
          actorId: session.user.id,
        })
      }
    }

    revalidatePath("/stories/" + storyId)
    return { error: null }
  } catch (e) {
    return { error: getErrorMessage(e, "Failed to update like") }
  }
}

export async function hasLikedStory(storyId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return false

  const like = await prisma.storyLike.findUnique({
    where: {
      userId_storyId: {
        userId: session.user.id,
        storyId,
      },
    },
  })
  return !!like
}

export async function getStoryLikeCount(storyId: string) {
  return prisma.storyLike.count({ where: { storyId } })
}
