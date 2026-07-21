import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { apiError, getSessionOrThrow } from "@/lib/api-auth"

const PAGE_SIZE = 20

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? String(PAGE_SIZE))))
    const sort = searchParams.get("sort") ?? "latest"
    const status = searchParams.get("status")
    const tag = searchParams.get("tag")
    const search = searchParams.get("search")
    const authorId = searchParams.get("authorId")

    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { tags: { contains: search } },
        { description: { contains: search } },
      ]
    }

    if (tag) {
      where.tags = { contains: tag }
    }

    if (authorId) {
      where.authorId = authorId
    }

    if (status) {
      where.status = status
    } else if (!authorId) {
      where.status = { in: ["PUBLISHED", "COMPLETED"] }
    }

    const session = await getServerSession(authOptions)
    if (authorId && session?.user?.id === authorId) {
      delete where.status
    }

    const orderBy: Record<string, unknown> =
      sort === "oldest" ? { createdAt: "asc" } :
      sort === "popular" ? { viewCount: "desc" } :
      sort === "trending" ? { storyLikes: { _count: "desc" } } :
      { createdAt: "desc" }

    const skip = (page - 1) * limit

    const [stories, total] = await Promise.all([
      prisma.story.findMany({
        where: where as any,
        orderBy: orderBy as any,
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          description: true,
          cover: true,
          tags: true,
          status: true,
          accessType: true,
          wordCount: true,
          viewCount: true,
          studioBadge: true,
          completedBadge: true,
          original: true,
          createdAt: true,
          updatedAt: true,
          author: { select: { id: true, name: true, avatar: true } },
          _count: { select: { saves: true, comments: true, chapters: true, storyLikes: true } },
        },
      }),
      prisma.story.count({ where: where as any }),
    ])

    return NextResponse.json({
      stories,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    return apiError(error)
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionOrThrow()
    const body = await request.json()
    const { title, description, cover, tags, accessType, freePreviewChapters } = body

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    const story = await prisma.story.create({
      data: {
        title: title.trim(),
        description: description || null,
        cover: cover || null,
        tags: tags || null,
        accessType: accessType || "FREEMIUM",
        freePreviewChapters: freePreviewChapters ?? 1,
        authorId: session.user.id,
      },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
      },
    })

    return NextResponse.json(story, { status: 201 })
  } catch (error) {
    return apiError(error, "Failed to create story")
  }
}
