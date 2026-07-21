import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  ParseIntPipe,
  DefaultValuePipe,
} from "@nestjs/common"
import { StoryService } from "./story.service"

@Controller("stories")
export class StoryController {
  constructor(private storyService: StoryService) {}

  @Post()
  create(@Body() body: { authorId: string; title: string; description?: string; category?: string; tags?: string; mature?: boolean }) {
    return this.storyService.create(body.authorId, body)
  }

  @Get()
  list(
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("limit", new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query("category") category?: string,
    @Query("status") status?: string,
    @Query("search") search?: string,
    @Query("sort") sort?: string,
  ) {
    return this.storyService.list({ page, limit, category, status, search, sort })
  }

  @Get("author/:authorId")
  getByAuthor(
    @Param("authorId") authorId: string,
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("limit", new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.storyService.getByAuthor(authorId, page, limit)
  }

  @Get(":id")
  getById(@Param("id") id: string) {
    return this.storyService.getById(id)
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() body: { authorId: string; title?: string; description?: string; cover?: string; category?: string; tags?: string; status?: string; mature?: boolean },
  ) {
    return this.storyService.update(id, body.authorId, body)
  }

  @Delete(":id")
  delete(@Param("id") id: string, @Body() body: { authorId: string }) {
    return this.storyService.delete(id, body.authorId)
  }

  @Post(":id/view")
  incrementView(@Param("id") id: string) {
    return this.storyService.incrementView(id)
  }
}
