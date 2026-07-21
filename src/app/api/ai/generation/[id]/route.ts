import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionOrThrow, apiError } from "@/lib/api-auth"

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionOrThrow()

    const { id } = await context.params

    const generation = await prisma.aIGeneration.findUnique({
      where: { id },
      select: {
        id: true,
        type: true,
        prompt: true,
        imageUrl: true,
        thumbnailUrl: true,
        status: true,
        provider: true,
        modelUsed: true,
        errorMessage: true,
        durationMs: true,
        createdAt: true,
        userId: true,
      },
    })

    if (!generation) {
      return NextResponse.json({ error: "Generation not found" }, { status: 404 })
    }

    if (generation.userId !== session.user.id) {
      const role = session.user.role ?? ""
      if (role !== "SUPER_ADMIN" && role !== "ADMIN") {
        return NextResponse.json({ error: "Not authorized" }, { status: 403 })
      }
    }

    return NextResponse.json({ generation })
  } catch (error) {
    return apiError(error)
  }
}
