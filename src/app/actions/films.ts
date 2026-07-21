"use server"

import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getErrorMessage } from "@/lib/errors"

// ─── Auth ───

async function requireAuth() {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Not authenticated")
  return session.user
}

// ─── GET: List user's film projects ───

export async function getFilmProjects() {
  const user = await requireAuth()
  return prisma.filmProject.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      story: { select: { id: true, title: true, cover: true, tags: true } },
      _count: { select: { crew: true } },
    },
  })
}

// ─── GET: Single film project ───

export async function getFilmProject(id: string) {
  const user = await requireAuth()
  const project = await prisma.filmProject.findUnique({
    where: { id },
    include: {
      story: { select: { id: true, title: true, description: true, cover: true, tags: true } },
      crew: { orderBy: { role: "asc" } },
    },
  })
  if (!project || project.userId !== user.id) {
    throw new Error("Project not found")
  }
  return project
}

// ─── CREATE: New film project from story ───

export async function createFilmProject(storyId: string) {
  const user = await requireAuth()
  const story = await prisma.story.findUnique({ where: { id: storyId } })
  if (!story || story.authorId !== user.id) throw new Error("Story not found")

  const existing = await prisma.filmProject.findFirst({ where: { storyId, userId: user.id } })
  if (existing) return existing

  const project = await prisma.filmProject.create({
    data: {
      title: `${story.title} — Film`,
      logline: story.description?.slice(0, 300) || null,
      genre: story.tags?.split(",")[0]?.trim() || null,
      storyId,
      userId: user.id,
    },
  })
  revalidatePath("/film")
  return project
}

// ─── UPDATE: Project metadata ───

export async function updateFilmProject(id: string, data: { title?: string; logline?: string; genre?: string; posterUrl?: string }) {
  const user = await requireAuth()
  const project = await prisma.filmProject.findUnique({ where: { id } })
  if (!project || project.userId !== user.id) throw new Error("Not authorized")
  const updated = await prisma.filmProject.update({ where: { id }, data })
  revalidatePath("/film/" + id)
  return updated
}

// ─── PIPELINE: Run AI generation step ───

export async function runFilmPipelineStep(projectId: string, step: string) {
  const user = await requireAuth()
  const project = await prisma.filmProject.findUnique({
    where: { id: projectId },
    include: { story: { include: { chapters: { orderBy: { number: "asc" } } } } },
  })
  if (!project || project.userId !== user.id) throw new Error("Not authorized")

  const storyTitle = project.story.title
  const allContent = project.story.chapters.map((c) => c.content).join("\n\n")

  try {
    const { executeStudioTool } = await import("@/lib/ai-studio/provider")

    if (step === "screenplay") {
      const result = await executeStudioTool("SCREENPLAY_AI" as any, {
        tool: "SCREENPLAY_AI" as any,
        storyId: project.story.id,
        storyTitle,
        prompt: `Convert the following novel into a proper screenplay format with scene headings, character cues, and dialogue.`,
        chapterContent: allContent.slice(0, 8000),
      })
      if (result.error) return { error: result.error }
      await prisma.filmProject.update({
        where: { id: projectId },
        data: { screenplayContent: result.content, screenplayStatus: "COMPLETE" },
      })
    } else if (step === "storyboard") {
      const screenplayContent = project.screenplayContent
      if (!screenplayContent) return { error: "Generate the screenplay first" }
      const result = await executeStudioTool("STORYBOARD_SCENE" as any, {
        tool: "STORYBOARD_SCENE" as any,
        storyId: project.story.id,
        storyTitle,
        prompt: screenplayContent.slice(0, 4000),
        chapterContent: screenplayContent,
      })
      if (result.error) return { error: result.error }
      await prisma.filmProject.update({
        where: { id: projectId },
        data: { storyboardData: result.content, storyboardStatus: "COMPLETE" },
      })
    } else if (step === "shotlist") {
      const storyboardContent = project.storyboardData
      if (!storyboardContent) return { error: "Generate the storyboard first" }
      const result = await executeStudioTool("SHOT_LIST" as any, {
        tool: "SHOT_LIST" as any,
        storyId: project.story.id,
        storyTitle,
        prompt: storyboardContent.slice(0, 4000),
        chapterContent: storyboardContent,
      })
      if (result.error) return { error: result.error }
      await prisma.filmProject.update({
        where: { id: projectId },
        data: { shotListData: result.content, shotListStatus: "COMPLETE" },
      })
    } else if (step === "production") {
      const shotList = project.shotListData
      if (!shotList) return { error: "Generate the shot list first" }
      const context = [project.screenplayContent, project.storyboardData, shotList].filter(Boolean).join("\n\n")
      const result = await executeStudioTool("PRODUCTION_BREAKDOWN" as any, {
        tool: "PRODUCTION_BREAKDOWN" as any,
        storyId: project.story.id,
        storyTitle,
        prompt: context.slice(0, 6000),
        chapterContent: context,
      })
      if (result.error) return { error: result.error }
      await prisma.filmProject.update({
        where: { id: projectId },
        data: { productionPlan: result.content, productionStatus: "COMPLETE" },
      })
    } else if (step === "editing") {
      const productionPlan = project.productionPlan
      if (!productionPlan) return { error: "Generate the production plan first" }
      const context = [project.screenplayContent, project.storyboardData, project.shotListData, productionPlan].filter(Boolean).join("\n\n")
      const { executeStudioTool: executeTool } = await import("@/lib/ai-studio/provider")
      const result = await executeTool("WRITING_AI" as any, {
        tool: "WRITING_AI" as any,
        storyId: project.story.id,
        storyTitle,
        prompt: `Review the following film production materials and provide comprehensive editing notes covering: pacing, visual consistency, dialogue quality, scene transitions, and post-production recommendations.`,
        chapterContent: context.slice(0, 8000),
      })
      if (result.error) return { error: result.error }
      await prisma.filmProject.update({
        where: { id: projectId },
        data: { editingNotes: result.content, editingStatus: "COMPLETE" },
      })
    }

    revalidatePath("/film/" + projectId)
    return { success: true }
  } catch (e) {
    return { error: getErrorMessage(e) }
  }
}

// ─── CREW: Add/remove crew members ───

export async function addCrewMember(projectId: string, name: string, role: string) {
  const user = await requireAuth()
  const project = await prisma.filmProject.findUnique({ where: { id: projectId } })
  if (!project || project.userId !== user.id) throw new Error("Not authorized")
  const member = await prisma.filmCrewMember.create({
    data: { name, role, projectId },
  })
  revalidatePath("/film/" + projectId)
  return member
}

export async function removeCrewMember(memberId: string) {
  const user = await requireAuth()
  const member = await prisma.filmCrewMember.findUnique({ where: { id: memberId }, include: { project: true } })
  if (!member || member.project.userId !== user.id) throw new Error("Not authorized")
  await prisma.filmCrewMember.delete({ where: { id: memberId } })
  revalidatePath("/film/" + member.projectId)
}

// ─── DELETE ───

export async function deleteFilmProject(id: string) {
  const user = await requireAuth()
  const project = await prisma.filmProject.findUnique({ where: { id } })
  if (!project || project.userId !== user.id) throw new Error("Not authorized")
  await prisma.filmProject.delete({ where: { id } })
  revalidatePath("/film")
}
