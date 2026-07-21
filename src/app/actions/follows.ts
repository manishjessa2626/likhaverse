"use server"

import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getErrorMessage } from "@/lib/errors"
import { createNotification } from "@/lib/notifications"

export async function toggleFollow(authorId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return { error: "Please log in to follow" }

  try {
    const existing = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: authorId,
        },
      },
    })

    if (existing) {
      await prisma.follow.delete({ where: { id: existing.id } })
    } else {
      const follow = await prisma.follow.create({
        data: {
          followerId: session.user.id,
          followingId: authorId,
        },
        include: {
          following: { select: { name: true } },
        },
      })

      if (follow.followingId !== session.user.id) {
        await createNotification({
          userId: follow.followingId,
          type: "FOLLOW",
          message: `${session.user.name} started following you`,
          link: `/profile/${session.user.id}`,
          actorId: session.user.id,
        })
      }
    }

    revalidatePath("/stories")
    return { error: null }
  } catch (e) {
    return { error: getErrorMessage(e, "Failed to update follow") }
  }
}

export async function isFollowing(authorId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return false
  const follow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: session.user.id,
        followingId: authorId,
      },
    },
  })
  return !!follow
}

export async function getFollowerCount(userId: string) {
  return prisma.follow.count({ where: { followingId: userId } })
}

export async function getFollowingCount(userId: string) {
  return prisma.follow.count({ where: { followerId: userId } })
}
