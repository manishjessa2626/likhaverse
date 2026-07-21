import { Controller, Get, Post, Body, Param, Query } from "@nestjs/common"
import { AccessService } from "./access.service"

@Controller("access")
export class AccessController {
  constructor(private readonly accessService: AccessService) {}

  @Post("check")
  async checkAccess(@Body() body: { userId: string; episodeId: string }) {
    return this.accessService.checkEpisodeAccess(body.userId, body.episodeId)
  }

  @Get("daily-limit/:userId")
  async getDailyLimit(@Param("userId") userId: string) {
    return this.accessService.getDailyLimit(userId)
  }

  @Get("next-unlock/:userId")
  async getNextUnlock(@Param("userId") userId: string) {
    return this.accessService.getNextUnlockTime(userId)
  }
}
