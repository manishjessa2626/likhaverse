import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from "@nestjs/common"
import { NotificationService } from "./notification.service"

@Controller("notifications")
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  async create(
    @Body()
    body: {
      recipientId: string
      type: string
      title?: string
      message?: string
      link?: string
      actorId?: string
    },
  ) {
    return this.notificationService.create(body)
  }

  @Get(":userId")
  async getForUser(
    @Param("userId") userId: string,
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "20",
  ) {
    return this.notificationService.getForUser(userId, parseInt(page, 10), parseInt(limit, 10))
  }

  @Patch(":id/read")
  async markRead(@Param("id") id: string) {
    return this.notificationService.markRead(id)
  }

  @Patch("user/:userId/read-all")
  async markAllRead(@Param("userId") userId: string) {
    return this.notificationService.markAllRead(userId)
  }

  @Get("user/:userId/unread-count")
  async getUnreadCount(@Param("userId") userId: string) {
    return this.notificationService.getUnreadCount(userId)
  }

  @Delete(":id")
  async delete(@Param("id") id: string) {
    return this.notificationService.delete(id)
  }
}
