import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from "@nestjs/common"
import { NotificationService } from "./notification.service"
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard"

@Controller("notifications")
export class NotificationController {
  constructor(private notification: NotificationService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() body: any) { return this.notification.create(body) }

  @Get(":userId")
  getForUser(@Param("userId") userId: string, @Query("page") page = "1", @Query("limit") limit = "20") {
    return this.notification.getForUser(userId, Number(page), Number(limit))
  }

  @Patch(":id/read")
  @UseGuards(JwtAuthGuard)
  markRead(@Param("id") id: string) { return this.notification.markRead(id) }

  @Patch("user/:userId/read-all")
  @UseGuards(JwtAuthGuard)
  markAllRead(@Param("userId") userId: string) { return this.notification.markAllRead(userId) }

  @Get("user/:userId/unread-count")
  getUnreadCount(@Param("userId") userId: string) { return this.notification.getUnreadCount(userId) }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  delete(@Param("id") id: string) { return this.notification.delete(id) }
}
