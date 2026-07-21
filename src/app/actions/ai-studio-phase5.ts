"use server"

import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { executeStudioTool } from "@/lib/ai-studio/provider"
import type { StudioToolType } from "@/lib/ai-studio/types"
import { getErrorMessage } from "@/lib/errors"

async function getStoryOwner(storyId: string) {
  const story = await prisma.story.findUnique({
    where: { id: storyId },
    select: { authorId: true, title: true },
  })
  return story
}

async function authorize(storyId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Not authenticated")
  const story = await prisma.story.findUnique({
    where: { id: storyId },
    select: { authorId: true },
  })
  if (!story) throw new Error("Story not found")
  if (story.authorId !== session.user.id && session.user.role !== "SUPER_ADMIN") {
    throw new Error("Not authorized")
  }
  return { userId: session.user.id, role: session.user.role }
}

// ── Generic executor for Phase 5 tools ──

async function executeTool(
  tool: StudioToolType,
  storyId: string,
  prompt: string,
  extra?: { chapterContent?: string; characters?: { name: string; description?: string }[] },
) {
  const { userId } = await authorize(storyId)
  const story = await prisma.story.findUnique({ where: { id: storyId }, select: { title: true } })
  if (!story) return { error: "Story not found" }

  const result = await executeStudioTool(tool, {
    tool,
    storyId,
    storyTitle: story.title,
    prompt,
    chapterContent: extra?.chapterContent,
    characters: extra?.characters,
  })

  if (result.error) return { error: result.error }

  await prisma.storyAnalysis.create({
    data: {
      type: tool,
      content: result.content,
      metadata: JSON.stringify({ prompt }),
      storyId,
      authorId: userId,
    },
  })

  revalidatePath("/studio/" + storyId)
  return { content: result.content }
}

// ── Individual tool actions ──

export async function runWritingAI(storyId: string, prompt: string, chapterContent?: string) {
  return executeTool("WRITING_AI" as StudioToolType, storyId, prompt, { chapterContent })
}

export async function runStoryAI(storyId: string, prompt: string, chapterContent?: string) {
  return executeTool("STORY_AI" as StudioToolType, storyId, prompt, { chapterContent })
}

export async function runCharacterAI(
  storyId: string,
  prompt: string,
  characters?: { name: string; description?: string }[],
) {
  return executeTool("CHARACTER_AI" as StudioToolType, storyId, prompt, { characters })
}

export async function runWorldBuilderAI(storyId: string, prompt: string) {
  return executeTool("WORLD_BUILDER_AI" as StudioToolType, storyId, prompt)
}

export async function runIllustrationAI(storyId: string, prompt: string) {
  return executeTool("ILLUSTRATION_AI" as StudioToolType, storyId, prompt)
}

export async function runScreenplayAI(storyId: string, prompt: string, chapterContent?: string) {
  return executeTool("SCREENPLAY_AI" as StudioToolType, storyId, prompt, { chapterContent })
}

export async function runMusicAI(storyId: string, prompt: string) {
  return executeTool("MUSIC_AI" as StudioToolType, storyId, prompt)
}

export async function runMarketingAI(storyId: string, prompt: string) {
  return executeTool("MARKETING_AI" as StudioToolType, storyId, prompt)
}

// ── History ──

export async function getPhase5Analyses(storyId: string, tool: string) {
  try {
    await authorize(storyId)
  } catch {
    return []
  }
  return prisma.storyAnalysis.findMany({
    where: { storyId, type: tool },
    orderBy: { createdAt: "desc" },
    take: 20,
  })
}

export async function deletePhase5Analysis(analysisId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return
  const analysis = await prisma.storyAnalysis.findUnique({
    where: { id: analysisId },
    select: { authorId: true, storyId: true },
  })
  if (!analysis) return
  if (analysis.authorId !== session.user.id && session.user.role !== "SUPER_ADMIN") return
  await prisma.storyAnalysis.delete({ where: { id: analysisId } })
  revalidatePath("/studio/" + analysis.storyId)
}
