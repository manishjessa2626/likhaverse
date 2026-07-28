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

    const drafts = await prisma.juniorDraft.findMany({
      where: { juniorId },
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true, wordCount: true, fontSize: true, updatedAt: true, createdAt: true, coverImage: true },
    })
    return NextResponse.json(drafts)
  } catch (error) {
    return apiError(error, "Failed to fetch drafts")
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionOrThrow()
    const body = await request.json()
    const { juniorId, id, title, content, chapters, coverImage, illustrations, fontSize } = body

    if (!juniorId) return NextResponse.json({ error: "juniorId required" }, { status: 400 })

    const junior = await prisma.juniorProfile.findUnique({ where: { id: juniorId }, select: { parentUserId: true } })
    if (!junior || junior.parentUserId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const wordCount = (content || "").split(/\s+/).filter(Boolean).length

    if (id) {
      const draft = await prisma.juniorDraft.update({
        where: { id, juniorId },
        data: { title, content, chapters, coverImage, illustrations, fontSize, wordCount },
      })
      return NextResponse.json(draft)
    }

    const draft = await prisma.juniorDraft.create({
      data: { juniorId, title: title || "Untitled", content, chapters, coverImage, illustrations, fontSize, wordCount },
    })
    return NextResponse.json(draft)
  } catch (error) {
    return apiError(error, "Failed to save draft")
  }
}
