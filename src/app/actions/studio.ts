"use server"

import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { requirePremiumCreator, requireSuperAdmin } from "@/lib/permissions"
import { getErrorMessage } from "@/lib/errors"
import { z } from "zod"

export type ApplicationStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "REVISION_REQUESTED"

const ApplicationSchema = z.object({
  genre: z.string().min(1, "Genre is required").max(100).trim(),
  totalChapters: z.coerce.number().int().min(1),
  wordCount: z.coerce.number().int().min(1),
  reason: z.string().min(50, "Please provide at least 50 characters explaining your vision").max(5000).trim(),
  visualStyle: z.string().min(1, "Visual style is required").max(500).trim(),
})

export async function submitStudioApplication(prevState: unknown, formData: FormData) {
  const session = await getServerSession(authOptions)
  try {
    const user = requirePremiumCreator(session)
    const storyId = formData.get("storyId") as string

    const story = await prisma.story.findUnique({
      where: { id: storyId },
      include: { _count: { select: { chapters: true } } },
    })
    if (!story || story.authorId !== user.id) {
      return { error: null, message: "Story not found or access denied" }
    }
    if (story.status !== "COMPLETED") {
      return { error: null, message: "Only completed stories can apply for Studio consideration." }
    }
    if (!story.completedAt) {
      return { error: null, message: "Your story needs a completed ending before applying." }
    }
    if (story._count.chapters === 0) {
      return { error: null, message: "Your story must have at least one chapter." }
    }

    const existing = await prisma.studioApplication.findFirst({
      where: { storyId, status: { in: ["PENDING", "ACCEPTED"] } },
    })
    if (existing) {
      return { error: null, message: "You already have a pending or accepted application for this story." }
    }

    const validated = ApplicationSchema.safeParse({
      genre: formData.get("genre"),
      totalChapters: formData.get("totalChapters"),
      wordCount: formData.get("wordCount"),
      reason: formData.get("reason"),
      visualStyle: formData.get("visualStyle"),
    })

    if (!validated.success) {
      return { error: validated.error.flatten().fieldErrors, message: "" }
    }

    await prisma.studioApplication.create({
      data: {
        ...validated.data,
        storyId,
        authorId: user.id,
      },
    })

    revalidatePath("/author/studio")
    return { error: null, message: "Application submitted for review!" }
  } catch (e) {
    return { error: null, message: getErrorMessage(e) }
  }
}

export async function reviewApplication(
  applicationId: string,
  status: ApplicationStatus,
  notes?: string,
) {
  const session = await getServerSession(authOptions)
  try {
    requireSuperAdmin(session)
  } catch {
    return { error: null, message: "Not authorized" }
  }

  await prisma.studioApplication.update({
    where: { id: applicationId },
    data: { status, reviewedAt: new Date(), reviewNotes: notes },
  })

  if (status === "ACCEPTED") {
    const app = await prisma.studioApplication.findUnique({
      where: { id: applicationId },
      select: { storyId: true },
    })
    if (app) {
      await prisma.story.update({
        where: { id: app.storyId },
        data: { studioBadge: true },
      })
    }
  }

  revalidatePath("/admin")
  revalidatePath("/admin/studio")
  revalidatePath("/author/studio")
  return { error: null, message: `Application ${status.toLowerCase().replace("_", " ")}` }
}

export async function getAuthorApplications() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return []
  return prisma.studioApplication.findMany({
    where: { authorId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { story: { select: { id: true, title: true } } },
  })
}

export async function getPendingApplications() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return []
  try { requireSuperAdmin(session) } catch { return [] }
  return prisma.studioApplication.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    include: {
      story: { select: { id: true, title: true, cover: true } },
      author: { select: { id: true, name: true, email: true, avatar: true } },
    },
  })
}

export async function getAllApplications() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return []
  try { requireSuperAdmin(session) } catch { return [] }
  return prisma.studioApplication.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      story: { select: { id: true, title: true, cover: true } },
      author: { select: { id: true, name: true, email: true, avatar: true } },
    },
  })
}
