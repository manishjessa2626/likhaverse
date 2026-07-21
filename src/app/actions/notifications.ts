"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { syncNotificationToFirestore, markNotificationReadFirestore, markAllNotificationsReadFirestore } from "@/lib/firestore-sync"

function getCategoryTypes(category: "main" | "feed"): string[] {
  if (category === "main") return ["FOLLOW", "STORY_UPDATE", "STORY_COMMENT", "STUDIO_EVENT", "STORY_LIKE"]
  return ["POST_LIKE", "POST_COMMENT", "REEL_LIKE", "REEL_COMMENT", "TAG", "SHARE", "POST_SHARE"]
}

export async function getNotifications(category: "main" | "feed" = "main", page = 1, limit = 20) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return { notifications: [], total: 0, page, limit, category }

  const types = getCategoryTypes(category)

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: session.user.id, type: { in: types } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        actor: { select: { id: true, name: true, avatar: true } },
      },
    }),
    prisma.notification.count({ where: { userId: session.user.id, type: { in: types } } }),
  ])

  return { notifications, total, page, limit, category }
}

export async function markNotificationRead(notificationId: string, category?: "main" | "feed") {
  const session = await getServerSession(authOptions)
  if (!session?.user) return

  await prisma.notification.updateMany({
    where: { id: notificationId, userId: session.user.id },
    data: { read: true },
  })
  markNotificationReadFirestore(notificationId, category || undefined)
  revalidatePath("/notifications")
}

export async function markAllNotificationsRead(category: "main" | "feed" = "main") {
  const session = await getServerSession(authOptions)
  if (!session?.user) return
  const types = getCategoryTypes(category)

  await prisma.notification.updateMany({
    where: { userId: session.user.id, read: false, type: { in: types } },
    data: { read: true },
  })
  markAllNotificationsReadFirestore(session.user.id, category)
  revalidatePath("/notifications")
}

export async function getUnreadNotificationCount(category?: "main" | "feed") {
  const session = await getServerSession(authOptions)
  if (!session?.user) return 0

  const where: any = { userId: session.user.id, read: false }
  if (category) where.type = { in: getCategoryTypes(category) }

  return prisma.notification.count({ where })
}

export async function getUnreadCounts() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return { main: 0, feed: 0 }

  const [main, feed] = await Promise.all([
    prisma.notification.count({ where: { userId: session.user.id, read: false, type: { in: getCategoryTypes("main") } } }),
    prisma.notification.count({ where: { userId: session.user.id, read: false, type: { in: getCategoryTypes("feed") } } }),
  ])
  return { main, feed }
}
