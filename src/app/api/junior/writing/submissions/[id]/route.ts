import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiError, getSessionOrThrow } from "@/lib/api-auth"

const VALID_STATUSES = ["DRAFT", "PENDING", "FLAGGED", "APPROVED", "PRIVATE", "REJECTED", "ARCHIVED"]

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSessionOrThrow()
    const { id } = await params
    const body = await request.json()
    const { status, parentFeedback } = body

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` }, { status: 400 })
    }

    const submission = await prisma.juniorSubmission.findUnique({
      where: { id },
      include: { junior: { select: { parentUserId: true } } },
    })

    if (!submission || submission.junior.parentUserId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    // If approving a flagged story, clear moderation flags
    const updateData: Record<string, unknown> = { status, parentFeedback, reviewedAt: new Date() }
    if (status === "APPROVED") {
      updateData.moderationFlags = null
    }

    const updated = await prisma.juniorSubmission.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(updated)
  } catch (error) {
    return apiError(error, "Failed to update submission")
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSessionOrThrow()
    const { id } = await params

    const submission = await prisma.juniorSubmission.findUnique({
      where: { id },
      include: { junior: { select: { parentUserId: true } } },
    })

    if (!submission || submission.junior.parentUserId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    await prisma.juniorSubmission.delete({ where: { id } })

    return NextResponse.json({ ok: true })
  } catch (error) {
    return apiError(error, "Failed to delete submission")
  }
}
