import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiError, getSessionOrThrow } from "@/lib/api-auth"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ juniorId: string }> },
) {
  try {
    const { juniorId } = await params
    const session = await getSessionOrThrow()

    const junior = await prisma.juniorProfile.findUnique({
      where: { id: juniorId },
      include: {
        readingProgress: true,
        badges: { orderBy: { awardedAt: "desc" } },
      },
    })

    if (!junior || junior.parentId !== session.user.id) {
      return NextResponse.json({ error: "Junior profile not found" }, { status: 404 })
    }

    const progress = junior.readingProgress[0]

    return NextResponse.json({
      booksRead: progress?.booksRead ?? 0,
      readingTimeMinutes: progress?.readingTimeMinutes ?? 0,
      storiesWritten: progress?.storiesWritten ?? 0,
      currentBook: progress
        ? { title: progress.currentBookTitle, progress: progress.currentBookProgress }
        : null,
      badges: junior.badges.map((b) => ({
        badgeType: b.badgeType,
        title: b.title,
        description: b.description,
        icon: b.icon,
        awardedAt: b.awardedAt,
      })),
    })
  } catch (error) {
    return apiError(error, "Failed to fetch reading stats")
  }
}
