"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { executeStudioTool } from "@/lib/ai/registry"
import type { StudioToolType } from "@/lib/ai-studio/types"

function buildScreenplayPrompt(chapterContent: string) {
  return `Convert the following novel/text into professional screenplay format. Use proper screenplay structure:

- Scene headings (INT./EXT. - LOCATION - TIME)
- Character names in CAPS when speaking
- Dialogue under character names
- Parenthetical directions in (parentheses)
- Action descriptions in present tense
- Transitions (CUT TO:, FADE IN:, FADE OUT.)

Format the output as a proper screenplay page. Here is the content to convert:

${chapterContent.slice(0, 8000)}`
}

function buildCameraAnglesPrompt(shotList: string) {
  return `From the following shot list, extract and organize the camera angles and movements. For each shot, specify:

1. Shot type (Close-up, Medium, Wide, Establishing, Over-shoulder, POV, Two-shot, Dutch angle, Aerial, Tracking)
2. Camera height (Eye level, Low angle, High angle, Dutch)
3. Camera movement (Static, Pan, Tilt, Dolly, Track, Crane, Steadicam, Handheld)
4. Lens (24mm, 35mm, 50mm, 85mm, 70-200mm)
5. Framing notes
6. Lighting direction

Format as a structured camera angle guide.

Shot list:
${shotList.slice(0, 6000)}`
}

export async function generateScreenplay(storyId: string, chapterContent: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return { error: "Not authenticated" }

  const story = await prisma.story.findUnique({ where: { id: storyId }, select: { title: true } })
  if (!story || story.title === null) return { error: "Story not found" }

  const result = await executeStudioTool("SHOT_LIST" as StudioToolType, {
    tool: "SHOT_LIST" as StudioToolType,
    storyId,
    storyTitle: story.title ?? undefined,
    prompt: buildScreenplayPrompt(chapterContent),
  })

  if (result.error) return { error: result.error }

  // Save as StoryAnalysis
  await prisma.storyAnalysis.create({
    data: {
      type: "SCREENPLAY",
      content: result.content,
      storyId,
      authorId: session.user.id,
    },
  })

  return { content: result.content, error: null }
}

export async function generatePipelineStoryboard(storyId: string, screenplayContent: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return { error: "Not authenticated" }

  const story = await prisma.story.findUnique({ where: { id: storyId }, select: { title: true } })
  if (!story) return { error: "Story not found" }

  const prompt = `Based on this screenplay/scene, create a detailed storyboard breakdown with shot sequences, camera notes, and visual descriptions:

${screenplayContent.slice(0, 6000)}`

  const result = await executeStudioTool("STORYBOARD_SCENE" as StudioToolType, {
    tool: "STORYBOARD_SCENE" as StudioToolType,
    storyId,
    storyTitle: story.title ?? undefined,
    prompt,
  })

  if (result.error) return { error: result.error }

  // Save as StoryboardScene records
  const lastScene = await prisma.storyboardScene.findFirst({
    where: { storyId },
    orderBy: { sceneNumber: "desc" },
  })

  await prisma.storyboardScene.create({
    data: {
      title: `Pipeline Storyboard ${(lastScene?.sceneNumber ?? 0) + 1}`,
      description: result.content,
      sceneNumber: (lastScene?.sceneNumber ?? 0) + 1,
      storyId,
      authorId: session.user.id,
    },
  })

  return { content: result.content, error: null }
}

export async function generatePipelineShotList(storyId: string, storyboardContent: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return { error: "Not authenticated" }

  const story = await prisma.story.findUnique({ where: { id: storyId }, select: { title: true } })
  if (!story) return { error: "Story not found" }

  const prompt = `Based on this storyboard/scene breakdown, generate a detailed shot-by-shot list. Include for each shot: shot number, shot type (Close-up, Medium, Wide, Establishing, Over-shoulder, POV, Two-shot, Dutch angle, Aerial, Tracking), camera movement (Static, Pan, Tilt, Dolly, Track, Crane, Steadicam, Handheld), duration in seconds, and description.

Storyboard:
${storyboardContent.slice(0, 6000)}`

  const result = await executeStudioTool("SHOT_LIST" as StudioToolType, {
    tool: "SHOT_LIST" as StudioToolType,
    storyId,
    storyTitle: story.title ?? undefined,
    prompt,
  })

  if (result.error) return { error: result.error }

  await prisma.storyAnalysis.create({
    data: {
      type: "SHOT_LIST",
      content: result.content,
      storyId,
      authorId: session.user.id,
    },
  })

  return { content: result.content, error: null }
}

export async function generatePipelineCameraAngles(storyId: string, shotListContent: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return { error: "Not authenticated" }

  const story = await prisma.story.findUnique({ where: { id: storyId }, select: { title: true } })
  if (!story) return { error: "Story not found" }

  const result = await executeStudioTool("SHOT_LIST" as StudioToolType, {
    tool: "SHOT_LIST" as StudioToolType,
    storyId,
    storyTitle: story.title ?? undefined,
    prompt: buildCameraAnglesPrompt(shotListContent),
  })

  if (result.error) return { error: result.error }

  await prisma.storyAnalysis.create({
    data: {
      type: "CAMERA_ANGLES",
      content: result.content,
      storyId,
      authorId: session.user.id,
    },
  })

  return { content: result.content, error: null }
}

export async function generatePipelineProductionPlan(storyId: string, allContext: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return { error: "Not authenticated" }

  const story = await prisma.story.findUnique({ where: { id: storyId }, select: { title: true } })
  if (!story) return { error: "Story not found" }

  const prompt = `Based on the following production materials, create a comprehensive production plan including:

1. Cast breakdown (characters, actors needed)
2. Location requirements
3. Crew positions needed
4. Production timeline (pre-production, principal photography, post-production)
5. Equipment list (cameras, lenses, lighting, sound)
6. Estimated budget breakdown
7. Shooting schedule

Production materials:
${allContext.slice(0, 8000)}`

  const result = await executeStudioTool("PRODUCTION_BREAKDOWN" as StudioToolType, {
    tool: "PRODUCTION_BREAKDOWN" as StudioToolType,
    storyId,
    storyTitle: story.title ?? undefined,
    prompt,
  })

  if (result.error) return { error: result.error }

  await prisma.storyAnalysis.create({
    data: {
      type: "PRODUCTION_BREAKDOWN",
      content: result.content,
      storyId,
      authorId: session.user.id,
    },
  })

  return { content: result.content, error: null }
}
