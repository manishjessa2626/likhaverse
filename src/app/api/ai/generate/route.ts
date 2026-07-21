import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateImage } from "@/lib/ai/registry"
import { buildFinalPrompt } from "@/lib/ai/style-engine"
import { bypassesAllLimits, getGenerationLimit } from "@/lib/ai/types"
import { rateLimit } from "@/lib/rate-limit"
import { getSessionOrThrow, apiError } from "@/lib/api-auth"
import { getErrorMessage } from "@/lib/errors"

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionOrThrow()
    const role = session.user.role

    const { allowed } = await rateLimit(`ai:${session.user.id}`, 10, 60_000)
    if (!allowed) {
      return NextResponse.json({ error: "Too many requests. Try again in a minute." }, { status: 429 })
    }

    const body = await request.json()
    const { type, storyId, prompt, style } = body

    if (!type || !prompt) {
      return NextResponse.json({ error: "type and prompt are required" }, { status: 400 })
    }

    const validTypes = ["COVER", "CHARACTER", "SCENE", "ENVIRONMENT", "OBJECT"]
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: "Invalid generation type" }, { status: 400 })
    }

    if (!bypassesAllLimits(role)) {
      const limit = getGenerationLimit(role, type)
      if (limit <= 0) {
        return NextResponse.json({ error: "Your role does not have access to AI generation." }, { status: 403 })
      }

      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { aiGenerationCount: true, aiGenerationResetAt: true },
      })

      if (user) {
        const now = new Date()
        const resetAt = user.aiGenerationResetAt ?? new Date(0)
        const isNewPeriod = now > resetAt
        const currentCount = isNewPeriod ? 0 : user.aiGenerationCount

        if (currentCount >= limit) {
          return NextResponse.json({
            error: "Monthly generation limit reached. Upgrade for more.",
          }, { status: 403 })
        }
      }
    }

    const generation = await prisma.aIGeneration.create({
      data: {
        type,
        prompt,
        style: style ?? "AUTO",
        status: "PROCESSING",
        provider: "pending",
        userId: session.user.id,
        storyId: storyId ?? null,
      },
    })

    const enhancedPrompt = buildFinalPrompt(prompt, type, style, body.fields)

    try {
      const result = await generateImage({
        type,
        prompt: enhancedPrompt,
        style,
        storyId,
        fields: body.fields,
      })

      const updated = await prisma.aIGeneration.update({
        where: { id: generation.id },
        data: {
          status: "COMPLETED",
          imageUrl: result.imageUrl,
          thumbnailUrl: result.thumbnailUrl,
          enhancedPrompt,
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

      if (!bypassesAllLimits(role)) {
        const now = new Date()
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
        await prisma.user.update({
          where: { id: session.user.id },
          data: {
            aiGenerationCount: { increment: 1 },
            aiGenerationResetAt: nextMonth,
          },
        })
      }

      return NextResponse.json({
        status: "success",
        generationId: updated.id,
        imageUrl: updated.imageUrl,
        thumbnailUrl: updated.thumbnailUrl,
        prompt: updated.prompt,
        style,
        createdAt: updated.createdAt,
      })
    } catch (err) {
      const safeMessage = getErrorMessage(err, "Image generation failed")
      const realMessage = err instanceof Error ? err.message : String(err)

      await prisma.aIGeneration.update({
        where: { id: generation.id },
        data: {
          status: "FAILED",
          errorMessage: realMessage,
          enhancedPrompt,
        },
      })

      await prisma.aIGenerationLog.create({
        data: {
          generationId: generation.id,
          providerName: "unknown",
          status: "FAILED",
          errorMessage: realMessage,
        },
      })

      return NextResponse.json({
        status: "error",
        generationId: generation.id,
        error: safeMessage,
      }, { status: 500 })
    }
  } catch (error) {
    return apiError(error, "Generation request failed")
  }
}
