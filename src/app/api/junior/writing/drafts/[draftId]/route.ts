import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiError, getSessionOrThrow } from "@/lib/api-auth"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ draftId: string }> },
) {
  try {
    const session = await getSessionOrThrow()
    const { draftId } = await params
    const url = new URL(request.url)
    const juniorId = url.searchParams.get("juniorId")

    if (!juniorId) return NextResponse.json({ error: "juniorId required" }, { status: 400 })

    const junior = await prisma.juniorProfile.findUnique({ where: { id: juniorId }, select: { parentUserId: true } })
    if (!junior || junior.parentUserId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const draft = await prisma.juniorDraft.findUnique({ where: { id: draftId } })
    if (!draft || draft.juniorId !== juniorId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    return NextResponse.json(draft)
  } catch (error) {
    return apiError(error, "Failed to fetch draft")
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ draftId: string }> },
) {
  try {
    const session = await getSessionOrThrow()
    const { draftId } = await params
    const url = new URL(request.url)
    const juniorId = url.searchParams.get("juniorId")

    if (!juniorId) return NextResponse.json({ error: "juniorId required" }, { status: 400 })

    const junior = await prisma.juniorProfile.findUnique({ where: { id: juniorId }, select: { parentUserId: true } })
    if (!junior || junior.parentUserId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    await prisma.juniorDraft.delete({ where: { id: draftId, juniorId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return apiError(error, "Failed to delete draft")
  }
}
