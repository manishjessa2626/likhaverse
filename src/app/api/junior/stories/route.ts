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

export async function GET() {
  try {
    const stories = await prisma.story.findMany({
      where: { status: "PUBLISHED" },
      select: {
        id: true,
        title: true,
        description: true,
        tags: true,
        ageRating: true,
        juniorApproved: true,
        featuredInJunior: true,
        cover: true,
        authorId: true,
        createdAt: true,
        author: { select: { name: true } },
      },
      orderBy: [{ featuredInJunior: "desc" }, { createdAt: "desc" }],
    })

    const safe = stories.filter(isSafeForJuniors).map((s) => ({
      id: s.id,
      title: s.title,
      blurb: s.description,
      coverImage: s.cover,
      ageRating: s.ageRating,
      tags: s.tags,
      juniorApproved: s.juniorApproved,
      type: "story",
      author: s.author,
    }))

    const juniorApproved = safe.filter((s) => s.juniorApproved)
    const others = safe.filter((s) => !s.juniorApproved)

    // Approved junior-written stories appear in the community library too.
    const approvedSubmissions = await prisma.juniorSubmission.findMany({
      where: { status: "APPROVED" },
      select: {
        id: true,
        title: true,
        genre: true,
        coverImage: true,
        junior: { select: { displayName: true } },
      },
      orderBy: { reviewedAt: "desc" },
    })

    const juniorItems = approvedSubmissions.map((s) => ({
      id: `js-${s.id}`,
      title: s.title,
      blurb: null,
      coverImage: s.coverImage,
      ageRating: "JUNIOR_9",
      tags: s.genre,
      juniorApproved: true,
      type: "junior",
      author: { name: s.junior.displayName },
    }))

    return NextResponse.json({ stories: [...juniorApproved, ...juniorItems, ...others] })
  } catch (error) {
    console.error("Failed to fetch junior stories:", error)
    return NextResponse.json({ stories: [] })
  }
}
