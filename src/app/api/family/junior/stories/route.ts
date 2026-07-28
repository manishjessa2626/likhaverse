import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiError, getSessionOrThrow } from "@/lib/api-auth"

export async function POST(request: Request) {
  try {
    const session = await getSessionOrThrow()
    const body = await request.json()
    const { juniorId, title, content, heroType, setting, plotType } = body

    if (!juniorId || !title || !content) {
      return NextResponse.json(
        { error: "juniorId, title, and content are required" },
        { status: 400 },
      )
    }

    const junior = await prisma.juniorProfile.findUnique({ where: { id: juniorId } })

    if (!junior || junior.parentId !== session.user.id) {
      return NextResponse.json({ error: "Junior profile not found" }, { status: 404 })
    }

    const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0

    const story = await prisma.juniorStory.create({
      data: {
        juniorId,
        title,
        content,
        heroType: heroType ?? null,
        setting: setting ?? null,
        plotType: plotType ?? null,
        wordCount,
        isPublished: false,
      },
    })

    await prisma.juniorReadingProgress.update({
      where: { juniorId },
      data: { storiesWritten: { increment: 1 } },
    })

    return NextResponse.json(story, { status: 201 })
  } catch (error) {
    return apiError(error, "Failed to create junior story")
  }
}
