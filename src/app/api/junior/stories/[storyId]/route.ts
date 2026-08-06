import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const JUNIOR_AGE_RATINGS = ["EARLY_READERS", "JUNIOR_6", "JUNIOR_9"]

const BLOCKED_KEYWORDS = [
  "horror", "psychological horror", "thriller", "crime", "dark fantasy",
  "gore", "slasher", "mature romance", "erotica", "nsfw",
  "heavy violence", "suicide", "self-harm", "self harm",
  "drug", "gambling", "explicit language", "explicit",
  "sexy", "sexual", "abuse",
]

function isSafeForJuniors(story: { ageRating: string | null; tags: string | null; description: string | null }): boolean {
  const rating = story.ageRating
  if (!rating || !JUNIOR_AGE_RATINGS.includes(rating)) return false
  const searchText = [story.tags, story.description].filter(Boolean).join(" ").toLowerCase()
  return !BLOCKED_KEYWORDS.some((kw) => searchText.includes(kw))
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ storyId: string }> },
) {
  try {
    const { storyId } = await params

    // Approved junior-written submissions use a "js-" prefixed id
    if (storyId.startsWith("js-")) {
      const subId = storyId.slice(3)
      const submission = await prisma.juniorSubmission.findUnique({
        where: { id: subId },
        select: {
          id: true,
          title: true,
          content: true,
          chapters: true,
          coverImage: true,
          status: true,
          junior: { select: { displayName: true } },
        },
      })

      if (!submission || submission.status !== "APPROVED") {
        return NextResponse.json({ error: "Story not found" }, { status: 404 })
      }

      const chapters = Array.isArray(submission.chapters)
        ? (submission.chapters as { content?: string }[])
            .map((ch) => ch.content || "")
            .filter(Boolean)
            .join("\n\n")
        : ""

      const content = [submission.content, chapters].filter(Boolean).join("\n\n")

      return NextResponse.json({
        id: `js-${submission.id}`,
        title: submission.title,
        content,
        blurb: null,
        coverImage: submission.coverImage,
        ageRating: "JUNIOR_9",
        author: { name: submission.junior.displayName },
      })
    }

    const story = await prisma.story.findUnique({
      where: { id: storyId },
      select: {
        id: true,
        title: true,
        description: true,
        tags: true,
        ageRating: true,
        juniorApproved: true,
        cover: true,
        authorId: true,
        author: { select: { name: true } },
      },
    })

    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 })
    }

    if (!isSafeForJuniors(story)) {
      return NextResponse.json({ error: "This story is not available in Junior Library" }, { status: 403 })
    }

    const chapters = await prisma.chapter.findMany({
      where: { storyId },
      orderBy: { number: "asc" },
      select: { content: true },
    })

    const content = chapters.map((c) => c.content).filter(Boolean).join("\n\n")

    return NextResponse.json({
      id: story.id,
      title: story.title,
      content,
      blurb: story.description,
      coverImage: story.cover,
      ageRating: story.ageRating,
      author: story.author,
    })
  } catch (error) {
    console.error("Failed to fetch junior story:", error)
    return NextResponse.json({ error: "Failed to load story" }, { status: 500 })
  }
}
