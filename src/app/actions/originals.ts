"use server"

import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { requireSuperAdmin } from "@/lib/permissions"
import { getErrorMessage } from "@/lib/errors"

export async function toggleOriginal(storyId: string) {
  const session = await getServerSession(authOptions)
  try {
    requireSuperAdmin(session)
    const story = await prisma.story.findUnique({ where: { id: storyId }, select: { original: true } })
    if (!story) return { error: null, message: "Story not found" }
    await prisma.story.update({
      where: { id: storyId },
      data: { original: !story.original },
    })
    revalidatePath("/admin/originals")
    revalidatePath("/")
    return { error: null, message: story.original ? "Removed from Originals" : "Added to Originals" }
  } catch (e) {
    return { error: null, message: getErrorMessage(e) }
  }
}

export async function getOriginals() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return []
  return prisma.story.findMany({
    where: { original: true },
    orderBy: { updatedAt: "desc" },
    include: {
      author: { select: { id: true, name: true, role: true } },
      _count: { select: { chapters: true, saves: true } },
    },
  })
}

export async function getAllStoriesForOriginals() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return []
  try { requireSuperAdmin(session) } catch { return [] }
  return prisma.story.findMany({
    where: { status: { in: ["PUBLISHED", "COMPLETED"] } },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true, title: true, original: true, status: true, viewCount: true,
      author: { select: { name: true } },
    },
  })
}

export async function getHomepageOriginals() {
  return prisma.story.findMany({
    where: {
      original: true,
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
}

export async function getStudioStories() {
  return prisma.story.findMany({
    where: {
      original: true,
      status: { in: ["PUBLISHED", "COMPLETED"] },
    },
    orderBy: { viewCount: "desc" },
    take: 12,
    include: {
      author: { select: { id: true, name: true, role: true } },
      _count: { select: { chapters: true, saves: true } },
    },
  })
}
