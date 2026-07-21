import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

const MAIN_TYPES = ["FOLLOW", "STORY_UPDATE", "STORY_COMMENT", "STUDIO_EVENT", "STORY_LIKE"]
const FEED_TYPES = ["POST_LIKE", "POST_COMMENT", "REEL_LIKE", "REEL_COMMENT", "TAG", "SHARE", "POST_SHARE"]

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ main: 0, feed: 0 })

  const [main, feed] = await Promise.all([
    prisma.notification.count({
      where: { userId: session.user.id, read: false, type: { in: MAIN_TYPES } },
    }),
    prisma.notification.count({
      where: { userId: session.user.id, read: false, type: { in: FEED_TYPES } },
    }),
  ])

  return NextResponse.json({ main, feed })
}
