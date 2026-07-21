"use server"

import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { requireSuperAdmin } from "@/lib/permissions"
import { executeStudioTool, STUDIO_TOOL_DEFINITIONS } from "@/lib/ai-studio/provider"
import type { StudioToolType } from "@/lib/ai-studio/types"
import { getErrorMessage } from "@/lib/errors"
import { z } from "zod"

const AnalysisSchema = z.object({
  type: z.enum(["CHARACTER_PROFILES", "TIMELINE", "WORLD_HISTORY", "RELATIONSHIPS", "THEMES"]),
  content: z.string().min(1),
  metadata: z.string().optional(),
})

// ===========================
// STORY ANALYZER
// ===========================

export async function analyzeWithAI(storyId: string, tool: string) {
  const session = await getServerSession(authOptions)
  try {
    const user = requireSuperAdmin(session)
    const story = await prisma.story.findUnique({
      where: { id: storyId },
      include: { chapters: { orderBy: { number: "asc" }, take: 50 } },
    })
    if (!story) return { error: null, message: "Story not found" }

    const toolMap: Record<string, StudioToolType> = {
      CHARACTER_PROFILES: "ANALYZE_CHARACTERS",
      TIMELINE: "ANALYZE_TIMELINE",
      WORLD_HISTORY: "ANALYZE_WORLD",
      THEMES: "ANALYZE_THEMES",
      RELATIONSHIPS: "ANALYZE_RELATIONSHIPS",
    }

    const studioTool = toolMap[tool]
    if (!studioTool) return { error: null, message: "Unknown analysis type" }

    const result = await executeStudioTool(studioTool, {
      tool: studioTool,
      storyId: story.id,
      storyTitle: story.title,
      chapters: story.chapters.map((c) => ({ title: c.title, content: c.content, number: c.number })),
      prompt: `Analyze ${tool.toLowerCase().replace("_", " ")} for ${story.title}`,
    })

    if (result.error) return { error: null, message: result.error }

    await prisma.storyAnalysis.create({
      data: { type: tool, content: result.content, storyId, authorId: user.id },
    })

    revalidatePath("/admin/ai-studio")
    return { error: null, message: result.content }
  } catch (e) {
    return { error: null, message: getErrorMessage(e) }
  }
}

export async function saveStoryAnalysis(storyId: string, prevState: unknown, formData: FormData) {
  const session = await getServerSession(authOptions)
  try {
    const user = requireSuperAdmin(session)
    const validated = AnalysisSchema.safeParse({
      type: formData.get("type"),
      content: formData.get("content"),
      metadata: formData.get("metadata"),
    })
    if (!validated.success) {
      return { error: validated.error.flatten().fieldErrors, message: "" }
    }
    await prisma.storyAnalysis.create({
      data: { ...validated.data, storyId, authorId: user.id },
    })
    revalidatePath("/admin/ai-studio")
    return { error: null, message: "Analysis saved!" }
  } catch (e) {
    return { error: null, message: getErrorMessage(e) }
  }
}

export async function getStoryAnalyses(storyId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return []
  try { requireSuperAdmin(session) } catch { return [] }
  return prisma.storyAnalysis.findMany({
    where: { storyId },
    orderBy: { createdAt: "desc" },
  })
}

export async function deleteStoryAnalysis(analysisId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return
  try { requireSuperAdmin(session) } catch { return }
  await prisma.storyAnalysis.delete({ where: { id: analysisId } })
  revalidatePath("/admin/ai-studio")
}

// ===========================
// CHARACTER SHEETS
// ===========================

export async function generateCharacterSheet(storyId: string, prompt: string) {
  const session = await getServerSession(authOptions)
  try {
    const user = requireSuperAdmin(session)
    const story = await prisma.story.findUnique({ where: { id: storyId }, select: { title: true } })
    if (!story) return { error: null, message: "Story not found" }

    const result = await executeStudioTool("CHARACTER_SHEET", {
      tool: "CHARACTER_SHEET",
      storyId,
      storyTitle: story.title,
      prompt,
    })

    if (result.error) return { error: null, message: result.error }

    await prisma.storyAnalysis.create({
      data: {
        type: "CHARACTER_SHEET",
        content: result.content,
        storyId,
        authorId: user.id,
      },
    })

    revalidatePath("/admin/ai-studio/analyze/" + storyId)
    return { error: null, message: result.content }
  } catch (e) {
    return { error: null, message: getErrorMessage(e) }
  }
}

// ===========================
// WORLD BUILDING
// ===========================

export async function generateWorldBuilding(storyId: string, topic: string, prompt: string) {
  const session = await getServerSession(authOptions)
  try {
    const user = requireSuperAdmin(session)
    const story = await prisma.story.findUnique({ where: { id: storyId }, select: { title: true } })
    if (!story) return { error: null, message: "Story not found" }

    const result = await executeStudioTool("WORLD_BUILDING", {
      tool: "WORLD_BUILDING",
      storyId,
      storyTitle: story.title,
      prompt: `${topic}: ${prompt}`,
    })

    if (result.error) return { error: null, message: result.error }

    await prisma.worldBuildingEntry.create({
      data: {
        type: topic,
        title: topic,
        content: result.content,
        storyId,
        authorId: user.id,
      },
    })

    revalidatePath("/admin/ai-studio")
    return { error: null, message: result.content }
  } catch (e) {
    return { error: null, message: getErrorMessage(e) }
  }
}

export async function getWorldBuildingEntries(storyId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return []
  try { requireSuperAdmin(session) } catch { return [] }
  return prisma.worldBuildingEntry.findMany({
    where: { storyId },
    orderBy: { createdAt: "desc" },
  })
}

export async function deleteWorldBuildingEntry(entryId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return
  try { requireSuperAdmin(session) } catch { return }
  await prisma.worldBuildingEntry.delete({ where: { id: entryId } })
  revalidatePath("/admin/ai-studio")
}

// ===========================
// ENVIRONMENT GENERATOR
// ===========================

export async function generateEnvironment(storyId: string, prompt: string) {
  const session = await getServerSession(authOptions)
  try {
    const user = requireSuperAdmin(session)
    const story = await prisma.story.findUnique({ where: { id: storyId }, select: { title: true } })
    if (!story) return { error: null, message: "Story not found" }

    const result = await executeStudioTool("ENVIRONMENT", {
      tool: "ENVIRONMENT",
      storyId,
      storyTitle: story.title,
      prompt,
    })

    if (result.error) return { error: null, message: result.error }

    const env = await prisma.environmentStudio.create({
      data: {
        name: prompt.slice(0, 100),
        description: result.content,
        imageUrl: result.imageUrl || null,
        storyId,
        authorId: user.id,
      },
    })

    revalidatePath("/admin/ai-studio")
    return { error: null, message: JSON.stringify({ id: env.id, content: result.content, imageUrl: result.imageUrl }) }
  } catch (e) {
    return { error: null, message: getErrorMessage(e) }
  }
}

export async function getEnvironments(storyId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return []
  try { requireSuperAdmin(session) } catch { return [] }
  return prisma.environmentStudio.findMany({
    where: { storyId },
    orderBy: { createdAt: "desc" },
  })
}

export async function deleteEnvironment(envId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return
  try { requireSuperAdmin(session) } catch { return }
  await prisma.environmentStudio.delete({ where: { id: envId } })
  revalidatePath("/admin/ai-studio")
}

// ===========================
// STORYBOARD
// ===========================

export async function generateStoryboardScene(storyId: string, prevState: unknown, formData: FormData) {
  const session = await getServerSession(authOptions)
  try {
    const user = requireSuperAdmin(session)
    const story = await prisma.story.findUnique({ where: { id: storyId } })
    if (!story) return { error: null, message: "Story not found" }

    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const chapterTitle = formData.get("chapterTitle") as string
    const chapterNumber = formData.get("chapterNumber") as string

    if (!title) return { error: null, message: "Title is required" }

    const lastScene = await prisma.storyboardScene.findFirst({
      where: { storyId },
      orderBy: { sceneNumber: "desc" },
    })

    const result = await executeStudioTool("STORYBOARD_SCENE", {
      tool: "STORYBOARD_SCENE",
      storyId,
      storyTitle: story.title,
      prompt: title,
      options: { description, chapterTitle, chapterNumber: chapterNumber ? parseInt(chapterNumber) : undefined },
    })

    await prisma.storyboardScene.create({
      data: {
        title,
        description: result.content || description || null,
        sceneNumber: (lastScene?.sceneNumber ?? 0) + 1,
        imageUrl: result.imageUrl || null,
        chapterTitle: chapterTitle || null,
        chapterNumber: chapterNumber ? parseInt(chapterNumber) : null,
        storyId,
        authorId: user.id,
      },
    })

    revalidatePath("/admin/ai-studio/storyboard/" + storyId)
    return { error: null, message: "Scene added!" }
  } catch (e) {
    return { error: null, message: getErrorMessage(e) }
  }
}

export async function getStoryboardScenes(storyId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return []
  try { requireSuperAdmin(session) } catch { return [] }
  return prisma.storyboardScene.findMany({
    where: { storyId },
    orderBy: { sceneNumber: "asc" },
  })
}

export async function deleteStoryboardScene(sceneId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return
  try { requireSuperAdmin(session) } catch { return }
  await prisma.storyboardScene.delete({ where: { id: sceneId } })
  revalidatePath("/admin/ai-studio")
}

// ===========================
// TRAILER GENERATOR
// ===========================

export async function generateTrailerScript(storyId: string, prompt: string, type: "TRAILER_SCRIPT" | "TRAILER_STORYBOARD") {
  const session = await getServerSession(authOptions)
  try {
    const user = requireSuperAdmin(session)
    const story = await prisma.story.findUnique({ where: { id: storyId }, select: { title: true } })
    if (!story) return { error: null, message: "Story not found" }

    const result = await executeStudioTool(type, {
      tool: type,
      storyId,
      storyTitle: story.title,
      prompt,
    })

    if (result.error) return { error: null, message: result.error }

    await prisma.storyAnalysis.create({
      data: {
        type,
        content: result.content,
        metadata: result.imageUrl || undefined,
        storyId,
        authorId: user.id,
      },
    })

    revalidatePath("/admin/ai-studio")
    return { error: null, message: JSON.stringify({ content: result.content, imageUrl: result.imageUrl }) }
  } catch (e) {
    return { error: null, message: getErrorMessage(e) }
  }
}

// ===========================
// FILM PRODUCTION PIPELINE
// ===========================

export async function generateProductionDocument(storyId: string, tool: StudioToolType, prompt: string) {
  const session = await getServerSession(authOptions)
  try {
    const user = requireSuperAdmin(session)
    const story = await prisma.story.findUnique({ where: { id: storyId }, select: { title: true } })
    if (!story) return { error: null, message: "Story not found" }

    const result = await executeStudioTool(tool, {
      tool,
      storyId,
      storyTitle: story.title,
      prompt,
    })

    if (result.error) return { error: null, message: result.error }

    await prisma.storyAnalysis.create({
      data: {
        type: tool,
        content: result.content,
        storyId,
        authorId: user.id,
      },
    })

    revalidatePath("/admin/ai-studio")
    return { error: null, message: result.content }
  } catch (e) {
    return { error: null, message: getErrorMessage(e) }
  }
}

// ===========================
// COMMON
// ===========================

export async function getAllStoriesForStudio() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return []
  try { requireSuperAdmin(session) } catch { return [] }
  return prisma.story.findMany({
    where: { status: { in: ["PUBLISHED", "COMPLETED"] } },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true, title: true, status: true, wordCount: true,
      _count: {
        select: {
          chapters: true,
          storyAnalyses: true,
          storyboardScenes: true,
          worldBuildingEntries: true,
          environmentStudios: true,
        },
      },
      author: { select: { id: true, name: true } },
    },
  })
}

export async function getAuthorStoriesForStudio() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return []
  return prisma.story.findMany({
    where: { authorId: session.user.id },
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, status: true, wordCount: true, cover: true },
  })
}

// STUDIO_TOOL_DEFINITIONS is imported from @/lib/ai-studio/types in client components
