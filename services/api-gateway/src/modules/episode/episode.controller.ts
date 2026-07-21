import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from "@nestjs/common"
import { EpisodeService } from "./episode.service"
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard"

@Controller("episodes")
export class EpisodeController {
  constructor(private episode: EpisodeService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() body: any) { return this.episode.create(body) }

  @Get(":id")
  getById(@Param("id") id: string) { return this.episode.getById(id) }

  @Patch(":id")
  @UseGuards(JwtAuthGuard)
  update(@Param("id") id: string, @Body() body: any) { return this.episode.update(id, body) }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  delete(@Param("id") id: string) { return this.episode.delete(id) }

  @Get("story/:storyId")
  listByStory(@Param("storyId") storyId: string) { return this.episode.listByStory(storyId) }

  @Post(":id/progress")
  @UseGuards(JwtAuthGuard)
  updateProgress(@Param("id") id: string, @Body() body: { userId: string; progress: number; completed?: boolean }) {
    return this.episode.updateProgress(id, body.userId, body.progress, body.completed)
  }

  @Get(":id/progress/:userId")
  getProgress(@Param("id") id: string, @Param("userId") userId: string) {
    return this.episode.getProgress(id, userId)
  }

  @Get("story/:storyId/progress/:userId")
  getUserProgress(@Param("storyId") storyId: string, @Param("userId") userId: string) {
    return this.episode.getUserProgress(storyId, userId)
  }

  @Post(":id/view")
  incrementView(@Param("id") id: string) { return this.episode.incrementView(id) }
}
