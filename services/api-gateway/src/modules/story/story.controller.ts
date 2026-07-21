import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from "@nestjs/common"
import { StoryService } from "./story.service"
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard"
import { CurrentUser } from "../../common/decorators/current-user.decorator"
import { RolesGuard } from "../../common/guards/roles.guard"
import { Roles } from "../../common/decorators/roles.decorator"

@Controller("stories")
export class StoryController {
  constructor(private story: StoryService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("AUTHOR", "VIP_GOLD", "PREMIUM_CREATOR", "ADMIN", "SUPER_ADMIN")
  create(@Body() body: any, @CurrentUser() user: any) {
    return this.story.create({ ...body, authorId: user.id })
  }

  @Get()
  list(
    @Query("page") page = "1",
    @Query("limit") limit = "20",
    @Query("category") category?: string,
    @Query("status") status?: string,
    @Query("search") search?: string,
    @Query("sort") sort?: string,
  ) {
    return this.story.list({ page, limit, ...(category && { category }), ...(status && { status }), ...(search && { search }), ...(sort && { sort }) })
  }

  @Get(":id")
  getById(@Param("id") id: string) { return this.story.getById(id) }

  @Patch(":id")
  @UseGuards(JwtAuthGuard)
  update(@Param("id") id: string, @Body() body: any) {
    return this.story.update(id, body)
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  delete(@Param("id") id: string) {
    return this.story.delete(id)
  }

  @Get("author/:authorId")
  getByAuthor(@Param("authorId") authorId: string, @Query("page") page = "1", @Query("limit") limit = "20") {
    return this.story.getByAuthor(authorId, Number(page), Number(limit))
  }

  @Post(":id/view")
  incrementView(@Param("id") id: string) { return this.story.incrementView(id) }
}
