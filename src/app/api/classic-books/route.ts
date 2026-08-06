import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const CLASSIC_CATEGORIES = ["BEDTIME", "FAIRY_TALE", "ANIMAL", "CLASSIC_ADVENTURE", "EDUCATIONAL"] as const

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const lang = searchParams.get("language") || "en"

    const where: Record<string, unknown> = { language: lang }
    if (category && CLASSIC_CATEGORIES.includes(category as typeof CLASSIC_CATEGORIES[number])) {
      where.category = category
    }

    const books = await prisma.classicBook.findMany({
      where,
      select: {
        id: true,
        title: true,
        author: true,
        description: true,
        coverImage: true,
        category: true,
        source: true,
        sourceUrl: true,
        contentUrl: true,
        language: true,
        addedAt: true,
      },
      orderBy: { addedAt: "desc" },
    })

    return NextResponse.json({ books })
  } catch (error) {
    console.error("Failed to fetch classic books:", error)
    return NextResponse.json({ books: [] })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, author, description, coverImage, category, source, sourceUrl, contentUrl, language, addedById } = body

    if (!title || !author || !category || !source || !addedById) {
      return NextResponse.json({ error: "Missing required fields: title, author, category, source, addedById" }, { status: 400 })
    }

    if (!CLASSIC_CATEGORIES.includes(category)) {
      return NextResponse.json({ error: `Invalid category. Must be one of: ${CLASSIC_CATEGORIES.join(", ")}` }, { status: 400 })
    }

    const book = await prisma.classicBook.create({
      data: {
        title,
        author,
        description,
        coverImage,
        category,
        source,
        sourceUrl,
        contentUrl,
        language: language || "en",
        addedById,
      },
    })

    return NextResponse.json({ book }, { status: 201 })
  } catch (error) {
    console.error("Failed to create classic book:", error)
    return NextResponse.json({ error: "Failed to create classic book" }, { status: 500 })
  }
}
