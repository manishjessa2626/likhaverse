import { Controller, Get, Post, Param, Body, UseGuards } from "@nestjs/common"
import { AccessService } from "./access.service"
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard"

@Controller("access")
export class AccessController {
  constructor(private access: AccessService) {}

  @Post("check")
  @UseGuards(JwtAuthGuard)
  checkAccess(@Body() body: { userId: string; episodeId: string }) {
    return this.access.checkAccess(body.userId, body.episodeId)
  }

  @Get("daily-limit/:userId")
  getDailyLimit(@Param("userId") userId: string) { return this.access.getDailyLimit(userId) }

  @Get("next-unlock/:userId")
  getNextUnlock(@Param("userId") userId: string) { return this.access.getNextUnlock(userId) }
}
