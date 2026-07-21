import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get("q")?.trim()

  if (!q || q.length < 2) {
    return NextResponse.json({ stories: [], authors: [] })
  }

  const [stories, authors] = await Promise.all([
    prisma.story.findMany({
      where: {
        status: { in: ["PUBLISHED", "COMPLETED"] },
        OR: [
          { title: { contains: q } },
          { tags: { contains: q } },
          { author: { name: { contains: q } } },
        ],
      },
      take: 20,
      orderBy: { viewCount: "desc" },
      select: {
        id: true,
        title: true,
        cover: true,
        author: { select: { id: true, name: true } },
      },
    }),
    prisma.user.findMany({
      where: {
        name: { contains: q },
        role: { in: ["AUTHOR", "PREMIUM_CREATOR", "SUPER_ADMIN"] },
      },
      take: 5,
      select: { id: true, name: true, avatar: true, role: true },
    }),
  ])

  return NextResponse.json({ stories, authors }, {
    headers: {
      "Cache-Control": "public, max-age=30, s-maxage=30",
    },
  })
}
