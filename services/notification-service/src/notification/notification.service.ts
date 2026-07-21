import { Injectable } from "@nestjs/common"
import { PrismaService } from "../common/prisma.service"

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    recipientId: string
    type: string
    title?: string
    message?: string
    link?: string
    actorId?: string
  }) {
    return this.prisma.notification.create({
      data: {
        recipientId: data.recipientId,
        type: data.type,
        title: data.title ?? "",
        message: data.message ?? "",
        link: data.link,
        actorId: data.actorId,
      },
    })
  }

  async getForUser(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit
    const [data, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { recipientId: userId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where: { recipientId: userId } }),
    ])

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }
  }

  async markRead(notificationId: string) {
    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    })
  }

  async markAllRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { recipientId: userId, read: false },
      data: { read: true },
    })
    return { success: true }
  }

  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: { recipientId: userId, read: false },
    })
    return { count }
  }

  async delete(notificationId: string) {
    await this.prisma.notification.delete({ where: { id: notificationId } })
    return { success: true }
  }
}
