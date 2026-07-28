import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiError, getSessionOrThrow } from "@/lib/api-auth"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSessionOrThrow()
    const { id } = await params
    const body = await request.json()
    const { status, parentFeedback } = body

    if (!["APPROVED", "REJECTED", "ARCHIVED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const submission = await prisma.juniorSubmission.findUnique({
      where: { id },
      include: { junior: { select: { parentUserId: true } } },
    })

    if (!submission || submission.junior.parentUserId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const updated = await prisma.juniorSubmission.update({
      where: { id },
      data: { status, parentFeedback, reviewedAt: new Date() },
    })

    return NextResponse.json(updated)
  } catch (error) {
    return apiError(error, "Failed to update submission")
  }
}
