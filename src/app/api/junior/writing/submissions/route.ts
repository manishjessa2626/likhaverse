import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiError, getSessionOrThrow } from "@/lib/api-auth"
import { validateGenreOrThrow, moderateContent } from "@/lib/junior-safety"

export async function GET(request: Request) {
  try {
    const session = await getSessionOrThrow()
    const url = new URL(request.url)
    const juniorId = url.searchParams.get("juniorId")

    if (!juniorId) return NextResponse.json({ error: "juniorId required" }, { status: 400 })

    const junior = await prisma.juniorProfile.findUnique({
      where: { id: juniorId },
      select: { parentUserId: true },
    })
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
    const { juniorId, title, genre, content, chapters, coverImage, illustrations, draftId } = body

    if (!juniorId) return NextResponse.json({ error: "juniorId required" }, { status: 400 })
    if (!title?.trim()) return NextResponse.json({ error: "Title is required" }, { status: 400 })

    const junior = await prisma.juniorProfile.findUnique({
      where: { id: juniorId },
      select: { parentUserId: true, displayName: true },
    })
    if (!junior || junior.parentUserId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    // Validate genre server-side
    if (genre) {
      try {
        validateGenreOrThrow(genre)
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Invalid genre"
        return NextResponse.json({ error: msg }, { status: 403 })
      }
    }

    // Extract text content for moderation
    const textContent = content || ""
    const chapterText = chapters && Array.isArray(chapters)
      ? chapters.map((ch: { content?: string }) => ch.content || "").join(" ")
      : ""

    const fullText = `${textContent} ${chapterText}`.trim()

    // Run content moderation
    const flags = moderateContent(title, fullText)

    // Determine status and create notification if flagged
    const status = flags.length > 0 ? "FLAGGED" : "DRAFT"

    const submission = await prisma.juniorSubmission.create({
      data: {
        juniorId,
        title: title.trim(),
        genre,
        content,
        chapters,
        coverImage,
        illustrations,
        status,
        moderationFlags: flags.length > 0 ? JSON.parse(JSON.stringify(flags)) : undefined,
        draftId,
      },
    })

    // Notify parent if content was flagged
    if (flags.length > 0) {
      await prisma.notification.create({
        data: {
          type: "JUNIOR_MODERATION",
          userId: junior.parentUserId,
          actorId: junior.parentUserId,
          message: `${junior.displayName || "Your child"} submitted a story that needs review`,
          link: `/settings/junior`,
        },
      })

      await prisma.juniorSubmission.update({
        where: { id: submission.id },
        data: { notifiedAt: new Date() },
      })
    }

    // Increment storiesWritten
    await prisma.juniorProfile
      .update({ where: { id: juniorId }, data: { storiesWritten: { increment: 1 } } })
      .catch(() => {})

    return NextResponse.json(submission, { status: 201 })
  } catch (error) {
    return apiError(error, "Failed to submit")
  }
}
