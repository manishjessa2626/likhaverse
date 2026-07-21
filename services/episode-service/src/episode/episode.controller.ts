import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
} from "@nestjs/common"
import { EpisodeService } from "./episode.service"

@Controller("episodes")
export class EpisodeController {
  constructor(private episodeService: EpisodeService) {}

  @Post()
  create(
    @Body()
    body: {
      storyId: string
      title: string
      content?: string
      description?: string
      seasonNumber?: number
      episodeNumber?: number
      isFree?: boolean
    },
  ) {
    return this.episodeService.create(body.storyId, body)
  }

  @Get(":id")
  getById(@Param("id") id: string) {
    return this.episodeService.getById(id)
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body()
    body: {
      title?: string
      content?: string
      description?: string
      cover?: string
      audioUrl?: string
      status?: string
      isFree?: boolean
    },
  ) {
    return this.episodeService.update(id, body)
  }

  @Delete(":id")
  delete(@Param("id") id: string) {
    return this.episodeService.delete(id)
  }

  @Get("story/:storyId")
  listByStory(@Param("storyId") storyId: string) {
    return this.episodeService.listByStory(storyId)
  }

  @Post(":id/progress")
  updateProgress(
    @Param("id") id: string,
    @Body() body: { userId: string; progress: number; completed?: boolean },
  ) {
    return this.episodeService.updateProgress(body.userId, id, body.progress, body.completed)
  }

  @Get(":id/progress/:userId")
  getProgress(@Param("id") id: string, @Param("userId") userId: string) {
    return this.episodeService.getProgress(userId, id)
  }

  @Get("story/:storyId/progress/:userId")
  getUserProgress(@Param("storyId") storyId: string, @Param("userId") userId: string) {
    return this.episodeService.getUserProgress(userId, storyId)
  }

  @Post(":id/view")
  incrementView(@Param("id") id: string) {
    return this.episodeService.incrementView(id)
  }
}
