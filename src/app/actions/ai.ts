"use server"

import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { requireAuthor, bypassesAllLimits } from "@/lib/permissions"
import { getGenerationLimit } from "@/lib/ai/types"
import { generateImage } from "@/lib/ai/registry"
import { buildFinalPrompt } from "@/lib/ai/style-engine"
import { getErrorMessage } from "@/lib/errors"
import { z } from "zod"

const GenerateCharacterSchema = z.object({
  storyId: z.string().min(1),
  name: z.string().min(1).max(200).trim(),
  age: z.string().max(50).optional(),
  gender: z.string().max(50).optional(),
  personality: z.string().max(2000).optional(),
  appearance: z.string().max(2000).optional(),
  clothing: z.string().max(2000).optional(),
  species: z.string().max(200).optional(),
  background: z.string().max(5000).optional(),
  artStyle: z.string().max(200).optional(),
  imagePrompt: z.string().max(5000).optional(),
})

async function checkGenerationLimit(userId: string, role: string, type: string): Promise<string | null> {
  if (bypassesAllLimits(role)) return null

  const limit = getGenerationLimit(role, type)
  if (limit <= 0) return "Generations not available for your account type"

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { aiGenerationCount: true, aiGenerationResetAt: true },
  })
  if (!user) return "User not found"

  const now = new Date()
  if (!user.aiGenerationResetAt || user.aiGenerationResetAt < now) {
    await prisma.user.update({
      where: { id: userId },
      data: { aiGenerationCount: 0, aiGenerationResetAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) },
    })
    return null
  }

  if (user.aiGenerationCount >= limit) {
    return `You've reached your monthly limit of ${limit} ${type.toLowerCase()} generations. Upgrade to Premium Creator for more.`
  }

  return null
}

async function incrementGenerationCount(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { aiGenerationCount: { increment: 1 } },
  })
}

const COVER_STYLES = [
  { id: "fantasy", label: "Fantasy" },
  { id: "romance", label: "Romance" },
  { id: "dark", label: "Dark / Horror" },
  { id: "scifi", label: "Sci-Fi" },
  { id: "anime", label: "Anime / Manga" },
  { id: "watercolor", label: "Watercolor" },
  { id: "minimalist", label: "Minimalist" },
  { id: "vintage", label: "Vintage / Retro" },
]

const GenerateCoverSchema = z.object({
  storyId: z.string().min(1),
  prompt: z.string().min(1).max(5000).trim(),
  style: z.string().max(100).optional(),
})

export async function generateCharacter(prevState: unknown, formData: FormData) {
  const session = await getServerSession(authOptions)
  try {
    const user = requireAuthor(session)

    const validated = GenerateCharacterSchema.safeParse({
      storyId: formData.get("storyId"),
      name: formData.get("name"),
      age: formData.get("age"),
      gender: formData.get("gender"),
      personality: formData.get("personality"),
      appearance: formData.get("appearance"),
      clothing: formData.get("clothing"),
      species: formData.get("species"),
      background: formData.get("background"),
      artStyle: formData.get("artStyle"),
      imagePrompt: formData.get("imagePrompt"),
    })

    if (!validated.success) {
      return { error: validated.error.flatten().fieldErrors, message: "" }
    }

    const story = await prisma.story.findUnique({ where: { id: validated.data.storyId } })
    if (!story || story.authorId !== user.id) {
      return { error: null, message: "Story not found or access denied" }
    }

    const limitError = await checkGenerationLimit(user.id, user.role, "CHARACTER")
    if (limitError) return { error: null, message: limitError }

    const { imagePrompt, ...characterData } = validated.data

    const fields = {
      name: characterData.name,
      age: characterData.age,
      gender: characterData.gender,
      species: characterData.species,
      personality: characterData.personality,
      appearance: characterData.appearance,
      clothing: characterData.clothing,
      background: characterData.background,
      artStyle: characterData.artStyle,
    }

    const promptText = imagePrompt || `Character portrait of ${characterData.name}`
    const enhancedPrompt = buildFinalPrompt(promptText, "CHARACTER", "AUTO", fields)

    const character = await prisma.character.create({
      data: {
        ...characterData,
        authorId: user.id,
      },
    })

    const generation = await prisma.aIGeneration.create({
      data: {
        type: "CHARACTER",
        prompt: promptText,
        enhancedPrompt,
        status: "PROCESSING",
        provider: "pending",
        storyId: validated.data.storyId,
        characterId: character.id,
        userId: user.id,
      },
    })

    try {
      const result = await generateImage({
        type: "CHARACTER",
        prompt: enhancedPrompt,
        storyId: validated.data.storyId,
        characterId: character.id,
        fields,
      })

      await prisma.aIGeneration.update({
        where: { id: generation.id },
        data: {
          status: "COMPLETED",
          imageUrl: result.imageUrl,
          thumbnailUrl: result.thumbnailUrl,
          provider: result.provider,
          modelUsed: result.modelUsed,
          durationMs: result.durationMs,
        },
      })

      await prisma.aIGenerationLog.create({
        data: {
          generationId: generation.id,
          providerName: result.provider,
          modelUsed: result.modelUsed ?? null,
          durationMs: result.durationMs ?? null,
          status: "COMPLETED",
        },
      })

      await prisma.character.update({
        where: { id: character.id },
        data: { imageUrl: result.imageUrl },
      })

      await incrementGenerationCount(user.id)

      revalidatePath("/author/ai")
      return { error: null, message: character.id }
    } catch (err) {
      const msg = (err as Error).message
      await prisma.aIGeneration.update({
        where: { id: generation.id },
        data: {
          status: "FAILED",
          errorMessage: msg,
        },
      })

      await prisma.aIGenerationLog.create({
        data: {
          generationId: generation.id,
          providerName: "unknown",
          status: "FAILED",
          errorMessage: msg,
        },
      })

      return { error: null, message: msg }
    }
  } catch (e) {
    return { error: null, message: getErrorMessage(e) }
  }
}

const STYLE_MAP: Record<string, string> = {
  fantasy: "FANTASY",
  romance: "ROMANCE",
  dark: "DARK_HORROR",
  scifi: "SCI_FI",
  anime: "ANIME_MANGA",
  watercolor: "WATERCOLOR",
  minimalist: "MINIMALIST",
  vintage: "VINTAGE_RETRO",
}

export async function generateCover(prevState: unknown, formData: FormData) {
  const session = await getServerSession(authOptions)
  try {
    const user = requireAuthor(session)

    const validated = GenerateCoverSchema.safeParse({
      storyId: formData.get("storyId"),
      prompt: formData.get("prompt"),
      style: formData.get("style"),
    })

    if (!validated.success) {
      return { error: validated.error.flatten().fieldErrors, message: "" }
    }

    const story = await prisma.story.findUnique({ where: { id: validated.data.storyId } })
    if (!story || story.authorId !== user.id) {
      return { error: null, message: "Story not found or access denied" }
    }

    const limitError = await checkGenerationLimit(user.id, user.role, "COVER")
    if (limitError) return { error: null, message: limitError }

    const style = STYLE_MAP[validated.data.style ?? ""] ?? "AUTO"
    const enhancedPrompt = buildFinalPrompt(validated.data.prompt, "COVER", style as any)

    const generation = await prisma.aIGeneration.create({
      data: {
        type: "COVER",
        prompt: validated.data.prompt,
        style,
        enhancedPrompt,
        status: "PROCESSING",
        provider: "pending",
        storyId: validated.data.storyId,
        userId: user.id,
      },
    })

    try {
      const result = await generateImage({
        type: "COVER",
        prompt: enhancedPrompt,
        style: style as any,
        storyId: validated.data.storyId,
      })

      await prisma.aIGeneration.update({
        where: { id: generation.id },
        data: {
          status: "COMPLETED",
          imageUrl: result.imageUrl,
          thumbnailUrl: result.thumbnailUrl,
          provider: result.provider,
          modelUsed: result.modelUsed,
          durationMs: result.durationMs,
        },
      })

      await prisma.aIGenerationLog.create({
        data: {
          generationId: generation.id,
          providerName: result.provider,
          modelUsed: result.modelUsed ?? null,
          durationMs: result.durationMs ?? null,
          status: "COMPLETED",
        },
      })

      await incrementGenerationCount(user.id)

      revalidatePath("/author/ai")
      return { error: null, message: generation.id }
    } catch (err) {
      const msg = (err as Error).message
      await prisma.aIGeneration.update({
        where: { id: generation.id },
        data: {
          status: "FAILED",
          errorMessage: msg,
        },
      })

      await prisma.aIGenerationLog.create({
        data: {
          generationId: generation.id,
          providerName: "unknown",
          status: "FAILED",
          errorMessage: msg,
        },
      })

      return { error: null, message: msg }
    }
  } catch (e) {
    return { error: null, message: getErrorMessage(e) }
  }
}

export async function generateCoverVariations(formData: FormData) {
  const session = await getServerSession(authOptions)
  try {
    const user = requireAuthor(session)

    const storyId = formData.get("storyId") as string
    const prompt = formData.get("prompt") as string

    if (!storyId || !prompt) return { error: null, message: "Missing storyId or prompt" }

    const story = await prisma.story.findUnique({ where: { id: storyId } })
    if (!story || story.authorId !== user.id) {
      return { error: null, message: "Story not found or access denied" }
    }

    const results: { id: string; imageUrl: string | null; style: string }[] = []

    for (const style of COVER_STYLES) {
      const limitError = await checkGenerationLimit(user.id, user.role, "COVER")
      if (limitError) break

      const styleCode = STYLE_MAP[style.id] ?? "AUTO"
      const enhancedPrompt = buildFinalPrompt(prompt, "COVER", styleCode as any)

      const generation = await prisma.aIGeneration.create({
        data: {
          type: "COVER",
          prompt,
          style: styleCode,
          enhancedPrompt,
          status: "PROCESSING",
          provider: "pending",
          storyId,
          userId: user.id,
        },
      })

      try {
        const result = await generateImage({
          type: "COVER",
          prompt: enhancedPrompt,
          storyId,
        })

        await prisma.aIGeneration.update({
          where: { id: generation.id },
          data: {
            status: "COMPLETED",
            imageUrl: result.imageUrl,
            thumbnailUrl: result.thumbnailUrl,
            provider: result.provider,
            modelUsed: result.modelUsed,
            durationMs: result.durationMs,
          },
        })

        await prisma.aIGenerationLog.create({
          data: {
            generationId: generation.id,
            providerName: result.provider,
            modelUsed: result.modelUsed ?? null,
            durationMs: result.durationMs ?? null,
            status: "COMPLETED",
          },
        })

        await incrementGenerationCount(user.id)
        results.push({ id: generation.id, imageUrl: result.imageUrl, style: style.label })
      } catch (err) {
        const msg = (err as Error).message
        await prisma.aIGeneration.update({
          where: { id: generation.id },
          data: {
            status: "FAILED",
            errorMessage: msg,
          },
        })

        await prisma.aIGenerationLog.create({
          data: {
            generationId: generation.id,
            providerName: "unknown",
            status: "FAILED",
            errorMessage: msg,
          },
        })
      }
    }

    revalidatePath("/author/ai")
    return { error: null, message: JSON.stringify(results) }
  } catch (e) {
    return { error: null, message: getErrorMessage(e) }
  }
}

export async function setStoryCover(storyId: string, imageUrl: string) {
  const session = await getServerSession(authOptions)
  try {
    const user = requireAuthor(session)
    const story = await prisma.story.findUnique({ where: { id: storyId } })
    if (!story || story.authorId !== user.id) {
      return { error: null, message: "Story not found or access denied" }
    }
    await prisma.story.update({
      where: { id: storyId },
      data: { cover: imageUrl },
    })
    revalidatePath("/author/ai")
    revalidatePath(`/stories/${storyId}`)
    return { error: null, message: "Cover set!" }
  } catch (e) {
    return { error: null, message: getErrorMessage(e) }
  }
}

export async function deleteGeneration(generationId: string) {
  const session = await getServerSession(authOptions)
  try {
    const user = requireAuthor(session)
    const gen = await prisma.aIGeneration.findUnique({ where: { id: generationId } })
    if (!gen || gen.userId !== user.id) {
      return { error: null, message: "Generation not found or access denied" }
    }
    await prisma.aIGeneration.delete({ where: { id: generationId } })
    revalidatePath("/author/ai")
    return { error: null, message: "Deleted" }
  } catch (e) {
    return { error: null, message: getErrorMessage(e) }
  }
}

export async function getStoryCovers(storyId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return []
  return prisma.aIGeneration.findMany({
    where: { storyId, type: "COVER" },
    orderBy: { createdAt: "desc" },
    take: 20,
  })
}

export async function getStoryCharacters(storyId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return []
  const story = await prisma.story.findUnique({
    where: { id: storyId },
    select: { authorId: true },
  })
  if (!story) return []
  const role = (session.user as { role?: string }).role
  if (story.authorId !== session.user.id && role !== "SUPER_ADMIN") return []
  return prisma.character.findMany({
    where: { storyId },
    orderBy: { createdAt: "desc" },
  })
}

export async function getAIHistory(type?: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return []
  return prisma.aIGeneration.findMany({
    where: { userId: session.user.id, ...(type ? { type } : {}) },
    orderBy: { createdAt: "desc" },
    include: { story: { select: { id: true, title: true } } },
    take: 50,
  })
}

export async function getGenerationCredits() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return null

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, aiGenerationCount: true, aiGenerationResetAt: true, premium: true },
  })
  if (!user) return null

  if (bypassesAllLimits(user.role)) {
    return {
      used: 0,
      limit: -1,
      remaining: Infinity,
      resetsAt: null,
      role: user.role,
      byType: {
        COVER: { limit: -1, used: 0 },
        CHARACTER: { limit: -1, used: 0 },
        SCENE: { limit: -1, used: 0 },
        ENVIRONMENT: { limit: -1, used: 0 },
        OBJECT: { limit: -1, used: 0 },
      },
    }
  }

  const limits = ["COVER", "CHARACTER", "SCENE", "ENVIRONMENT", "OBJECT"] as const
  const byType: Record<string, { limit: number; used: number }> = {}

  for (const t of limits) {
    byType[t] = { limit: getGenerationLimit(user.role, t), used: 0 }
  }

  const now = new Date()
  if (!user.aiGenerationResetAt || user.aiGenerationResetAt < now) {
    for (const t of limits) {
      byType[t].used = 0
    }
    return {
      used: 0,
      limit: byType.COVER.limit,
      remaining: byType.COVER.limit,
      resetsAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      role: user.role,
      byType,
    }
  }

  for (const t of limits) {
    byType[t].used = user.aiGenerationCount
  }

  const totalLimit = byType.COVER.limit

  return {
    used: user.aiGenerationCount,
    limit: totalLimit,
    remaining: Math.max(0, totalLimit - user.aiGenerationCount),
    resetsAt: user.aiGenerationResetAt,
    role: user.role,
    byType,
  }
}

export async function updateCharacterImage(characterId: string, imageUrl: string) {
  const session = await getServerSession(authOptions)
  try {
    const user = requireAuthor(session)
    const character = await prisma.character.findUnique({ where: { id: characterId } })
    if (!character || character.authorId !== user.id) {
      return { error: null, message: "Access denied" }
    }
    await prisma.character.update({
      where: { id: characterId },
      data: { imageUrl },
    })
    revalidatePath("/author/ai")
    return { error: null, message: "Image updated" }
  } catch (e) {
    return { error: null, message: getErrorMessage(e) }
  }
}

export async function deleteCharacter(characterId: string) {
  const session = await getServerSession(authOptions)
  try {
    const user = requireAuthor(session)
    const character = await prisma.character.findUnique({ where: { id: characterId } })
    if (!character || character.authorId !== user.id) {
      return { error: null, message: "Access denied" }
    }
    await prisma.character.delete({ where: { id: characterId } })
    revalidatePath("/author/ai")
    return { error: null, message: "Character deleted" }
  } catch (e) {
    return { error: null, message: getErrorMessage(e) }
  }
}
