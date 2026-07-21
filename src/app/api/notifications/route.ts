import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionOrThrow, apiError } from "@/lib/api-auth"

export async function GET() {
  try {
    const session = await getSessionOrThrow()

    const [notifications, total, unread] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: 20,
        include: {
          actor: { select: { id: true, name: true, avatar: true } },
        },
      }),
      prisma.notification.count({ where: { userId: session.user.id } }),
      prisma.notification.count({ where: { userId: session.user.id, read: false } }),
    ])

    return NextResponse.json({ notifications, total, unread })
  } catch (error) {
    return apiError(error)
  }
}
