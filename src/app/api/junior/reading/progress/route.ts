import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiError, getSessionOrThrow } from "@/lib/api-auth"

export async function GET(request: Request) {
  try {
    const session = await getSessionOrThrow()
    const url = new URL(request.url)
    const juniorId = url.searchParams.get("juniorId")
    const storyId = url.searchParams.get("storyId")

    if (!juniorId) return NextResponse.json({ error: "juniorId required" }, { status: 400 })

    const junior = await prisma.juniorProfile.findUnique({ where: { id: juniorId }, select: { parentUserId: true } })
    if (!junior || junior.parentUserId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    if (storyId) {
      const progress = await prisma.juniorReadingProgress.findUnique({
        where: { juniorId_storyId: { juniorId, storyId } },
      })
      return NextResponse.json(progress)
    }

    const all = await prisma.juniorReadingProgress.findMany({
      where: { juniorId },
      orderBy: { lastReadAt: "desc" },
    })
    return NextResponse.json(all)
  } catch (error) {
    return apiError(error, "Failed to fetch reading progress")
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionOrThrow()
    const body = await request.json()
    const { juniorId, storyId, currentPage, totalPages } = body

    if (!juniorId || !storyId) {
      return NextResponse.json({ error: "juniorId and storyId required" }, { status: 400 })
    }

    const junior = await prisma.juniorProfile.findUnique({ where: { id: juniorId }, select: { parentUserId: true } })
    if (!junior || junior.parentUserId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const progress = await prisma.juniorReadingProgress.upsert({
      where: { juniorId_storyId: { juniorId, storyId } },
      update: { currentPage, totalPages, completed: currentPage >= totalPages - 1, lastReadAt: new Date() },
      create: { juniorId, storyId, currentPage, totalPages },
    })

    await prisma.juniorProfile.update({ where: { id: juniorId }, data: { booksRead: { increment: progress.completed ? 0 : 1 } } }).catch(() => {})

    return NextResponse.json(progress)
  } catch (error) {
    return apiError(error, "Failed to save reading progress")
  }
}
