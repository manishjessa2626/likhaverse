import { prisma } from "../prisma"
import { eventBus } from "../realtime/event-bus"
import { createLogger } from "../observability/logger"
import { enqueue, JobType } from "../queue"

const log = createLogger("notifications")

type NotificationInput = {
  userId: string
  type: string
  message: string
  link?: string
  actorId?: string
}

export async function createNotification(input: NotificationInput): Promise<{ id: string } | null> {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        message: input.message,
        link: input.link || null,
        actorId: input.actorId || null,
      },
    })

    eventBus.broadcast({
      type: "notification",
      userId: input.userId,
      notification: {
        id: notification.id,
        type: notification.type,
        message: notification.message,
        link: notification.link,
        actorId: notification.actorId,
        createdAt: notification.createdAt.toISOString(),
      },
    })

    enqueue(JobType.SYNC_FIRESTORE, {
      model: "notification",
      id: notification.id,
      userId: input.userId,
      type: input.type,
      message: input.message,
      link: input.link,
      actorId: input.actorId,
    }).catch(() => {})

    return { id: notification.id }
  } catch (error) {
    log.error({ err: error, input }, "Failed to create notification")
    return null
  }
}

export async function createNotificationToSelf(
  userId: string,
  type: string,
  message: string,
  link?: string,
): Promise<{ id: string } | null> {
  return createNotification({ userId, type, message, link })
}

export async function broadcastToMultipleUsers(
  userIds: string[],
  type: string,
  message: string,
  link?: string,
  actorId?: string,
): Promise<void> {
  await Promise.allSettled(
    userIds.map((userId) => createNotification({ userId, type, message, link, actorId })),
  )
}
