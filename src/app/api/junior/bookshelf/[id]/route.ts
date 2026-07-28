import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiError, getSessionOrThrow } from "@/lib/api-auth"

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSessionOrThrow()
    const { id } = await params

    const book = await prisma.familyBook.findUnique({
      where: { id },
      include: { junior: { select: { parentUserId: true } } },
    })
    if (!book || book.junior.parentUserId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    await prisma.familyBook.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return apiError(error, "Failed to delete book")
  }
}
