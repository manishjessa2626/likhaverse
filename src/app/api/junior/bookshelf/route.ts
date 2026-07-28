import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiError, getSessionOrThrow } from "@/lib/api-auth"

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

    const books = await prisma.familyBook.findMany({
      where: { juniorId },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(books)
  } catch (error) {
    return apiError(error, "Failed to fetch bookshelf")
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionOrThrow()
    const body = await request.json()
    const { juniorId, title, content, authorName, coverImage, message } = body

    if (!juniorId || !title) {
      return NextResponse.json({ error: "juniorId and title required" }, { status: 400 })
    }

    const junior = await prisma.juniorProfile.findUnique({
      where: { id: juniorId },
      select: { parentUserId: true },
    })
    if (!junior || junior.parentUserId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const book = await prisma.familyBook.create({
      data: { juniorId, title, content, authorName: authorName || "Family", coverImage, message, sharedById: session.user.id },
    })
    return NextResponse.json(book)
  } catch (error) {
    return apiError(error, "Failed to share story")
  }
}
