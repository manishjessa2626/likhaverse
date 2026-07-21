import { Controller, Get, Patch, Post, Delete, Param, Body, Query, UseGuards, HttpException } from "@nestjs/common"
import { UserService } from "./user.service"
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard"
import { CurrentUser } from "../../common/decorators/current-user.decorator"

@Controller("users")
export class UserController {
  constructor(private user: UserService) {}

  @Get("me")
  @UseGuards(JwtAuthGuard)
  getMe(@CurrentUser() user: any) { return this.user.getProfile(user.id) }

  @Get(":id")
  getProfile(@Param("id") id: string) { return this.user.getProfile(id) }

  @Patch(":id")
  @UseGuards(JwtAuthGuard)
  updateProfile(@Param("id") id: string, @Body() body: any, @CurrentUser() user: any) {
    if (user.id !== id) throw new HttpException("Unauthorized", 403)
    return this.user.updateProfile(id, body)
  }

  @Get(":id/followers")
  getFollowers(@Param("id") id: string, @Query("page") page = "1", @Query("limit") limit = "20") {
    return this.user.getFollowers(id, Number(page), Number(limit))
  }

  @Get(":id/following")
  getFollowing(@Param("id") id: string, @Query("page") page = "1", @Query("limit") limit = "20") {
    return this.user.getFollowing(id, Number(page), Number(limit))
  }

  @Post(":id/follow")
  @UseGuards(JwtAuthGuard)
  follow(@Param("id") id: string, @Body() body: { followingId: string }) {
    return this.user.follow(id, body.followingId)
  }

  @Delete(":id/follow/:followingId")
  @UseGuards(JwtAuthGuard)
  unfollow(@Param("id") id: string, @Param("followingId") followingId: string) {
    return this.user.unfollow(id, followingId)
  }

  @Get(":id/stories")
  getStories(@Param("id") id: string, @Query("page") page = "1", @Query("limit") limit = "20") {
    return this.user.getStories(id, Number(page), Number(limit))
  }
}
