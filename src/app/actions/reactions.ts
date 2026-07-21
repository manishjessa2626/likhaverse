"use server"

import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function toggleReaction(type: string, chapterId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Not authenticated")

  const existing = await prisma.reaction.findUnique({
    where: {
      userId_chapterId_type: {
        userId: session.user.id,
        chapterId,
        type,
      },
    },
  })

  if (existing) {
    await prisma.reaction.delete({ where: { id: existing.id } })
  } else {
    await prisma.reaction.create({
      data: { type, userId: session.user.id, chapterId },
    })
  }

  revalidatePath("/stories/*")
}

export async function getChapterReactions(chapterId: string) {
  const reactions = await prisma.reaction.groupBy({
    by: ["type"],
    where: { chapterId },
    _count: true,
  })

  const session = await getServerSession(authOptions)
  let userReactions: string[] = []
  if (session?.user) {
    const userReacts = await prisma.reaction.findMany({
      where: { chapterId, userId: session.user.id },
      select: { type: true },
    })
    userReactions = userReacts.map((r) => r.type)
  }

  const counts: Record<string, number> = {}
  for (const r of reactions) {
    counts[r.type] = r._count
  }

  return { counts, userReactions }
}
