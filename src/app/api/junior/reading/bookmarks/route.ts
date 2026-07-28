import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiError, getSessionOrThrow } from "@/lib/api-auth"

export async function GET(request: Request) {
  try {
    const session = await getSessionOrThrow()
    const url = new URL(request.url)
    const juniorId = url.searchParams.get("juniorId")

    if (!juniorId) return NextResponse.json({ error: "juniorId required" }, { status: 400 })

    const junior = await prisma.juniorProfile.findUnique({ where: { id: juniorId }, select: { parentUserId: true } })
    if (!junior || junior.parentUserId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const bookmarks = await prisma.juniorBookmark.findMany({
      where: { juniorId },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(bookmarks)
  } catch (error) {
    return apiError(error, "Failed to fetch bookmarks")
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionOrThrow()
    const body = await request.json()
    const { juniorId, storyId, page } = body

    if (!juniorId || !storyId) {
      return NextResponse.json({ error: "juniorId and storyId required" }, { status: 400 })
    }

    const junior = await prisma.juniorProfile.findUnique({ where: { id: juniorId }, select: { parentUserId: true } })
    if (!junior || junior.parentUserId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const existing = await prisma.juniorBookmark.findFirst({
      where: { juniorId, storyId, page },
    })

    if (existing) {
      await prisma.juniorBookmark.delete({ where: { id: existing.id } })
      return NextResponse.json({ removed: true })
    }

    const bookmark = await prisma.juniorBookmark.create({
      data: { juniorId, storyId, page },
    })
    return NextResponse.json(bookmark)
  } catch (error) {
    return apiError(error, "Failed to toggle bookmark")
  }
}
