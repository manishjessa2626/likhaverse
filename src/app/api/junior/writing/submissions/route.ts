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

    const submissions = await prisma.juniorSubmission.findMany({
      where: { juniorId },
      orderBy: { submittedAt: "desc" },
    })
    return NextResponse.json(submissions)
  } catch (error) {
    return apiError(error, "Failed to fetch submissions")
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionOrThrow()
    const body = await request.json()
    const { juniorId, title, content, chapters, coverImage, illustrations, draftId } = body

    if (!juniorId) return NextResponse.json({ error: "juniorId required" }, { status: 400 })

    const junior = await prisma.juniorProfile.findUnique({ where: { id: juniorId }, select: { parentUserId: true } })
    if (!junior || junior.parentUserId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const submission = await prisma.juniorSubmission.create({
      data: { juniorId, title, content, chapters, coverImage, illustrations, draftId },
    })

    await prisma.juniorProfile.update({
      where: { id: juniorId },
      data: { storiesWritten: { increment: 1 } },
    }).catch(() => {})

    return NextResponse.json(submission)
  } catch (error) {
    return apiError(error, "Failed to submit")
  }
}
