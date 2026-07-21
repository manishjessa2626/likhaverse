import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionOrThrow, apiError } from "@/lib/api-auth"

export async function GET() {
  try {
    const session = await getSessionOrThrow()

    const [messages, notifications] = await Promise.all([
      prisma.message.count({
        where: { receiverId: session.user.id, read: false, conversationId: { not: null } },
      }),
      prisma.notification.count({
        where: { userId: session.user.id, read: false },
      }),
    ])

    return NextResponse.json({ messages, notifications })
  } catch (error) {
    return apiError(error)
  }
}
