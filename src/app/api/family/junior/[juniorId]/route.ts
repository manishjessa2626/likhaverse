import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiError, getSessionOrThrow } from "@/lib/api-auth"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ juniorId: string }> },
) {
  try {
    const { juniorId } = await params
    const session = await getSessionOrThrow()
    const body = await request.json()
    const { name, age, readingLevel, favoriteGenres, avatar, pinCode } = body

    const junior = await prisma.juniorProfile.findUnique({ where: { id: juniorId } })

    if (!junior || junior.parentId !== session.user.id) {
      return NextResponse.json({ error: "Junior profile not found" }, { status: 404 })
    }

    const updated = await prisma.juniorProfile.update({
      where: { id: juniorId },
      data: {
        ...(name !== undefined && { name }),
        ...(age !== undefined && { age }),
        ...(readingLevel !== undefined && { readingLevel }),
        ...(favoriteGenres !== undefined && { favoriteGenres }),
        ...(avatar !== undefined && { avatar }),
        ...(pinCode !== undefined && { pinCode }),
      },
      include: { readingProgress: true },
    })

    return NextResponse.json(updated)
  } catch (error) {
    return apiError(error, "Failed to update junior profile")
  }
}
