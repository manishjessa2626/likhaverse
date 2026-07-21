"use server"

import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function toggleSave(storyId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Not authenticated")

  const existing = await prisma.save.findUnique({
    where: {
      userId_storyId: {
        userId: session.user.id,
        storyId,
      },
    },
  })

  if (existing) {
    await prisma.save.delete({ where: { id: existing.id } })
  } else {
    await prisma.save.create({
      data: { userId: session.user.id, storyId },
    })
  }

  revalidatePath("/stories/" + storyId)
}

export async function isSaved(storyId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return false
  const save = await prisma.save.findUnique({
    where: {
      userId_storyId: {
        userId: session.user.id,
        storyId,
      },
    },
  })
  return !!save
}

export async function getSavedStories() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return []
  return prisma.save.findMany({
    where: { userId: session.user.id },
    include: {
      story: {
        include: {
          author: { select: { id: true, name: true } },
          _count: { select: { chapters: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })
}
