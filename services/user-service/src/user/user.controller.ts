import { Controller, Get, Patch, Post, Delete, Param, Query, Body, ParseIntPipe, DefaultValuePipe } from "@nestjs/common"
import { UserService } from "./user.service"

@Controller("users")
export class UserController {
  constructor(private userService: UserService) {}

  @Get(":id")
  getProfile(@Param("id") id: string) {
    return this.userService.getProfile(id)
  }

  @Patch(":id")
  updateProfile(@Param("id") id: string, @Body() body: { name?: string; bio?: string; avatar?: string }) {
    return this.userService.updateProfile(id, body)
  }

  @Get(":id/followers")
  getFollowers(
    @Param("id") id: string,
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("limit", new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.userService.getFollowers(id, page, limit)
  }

  @Get(":id/following")
  getFollowing(
    @Param("id") id: string,
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("limit", new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.userService.getFollowing(id, page, limit)
  }

  @Post(":userId/follow")
  follow(@Param("userId") userId: string, @Body() body: { followingId: string }) {
    return this.userService.follow(userId, body.followingId)
  }

  @Delete(":userId/follow/:followingId")
  unfollow(@Param("userId") userId: string, @Param("followingId") followingId: string) {
    return this.userService.unfollow(userId, followingId)
  }

  @Get(":id/stories")
  getStories(
    @Param("id") id: string,
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("limit", new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.userService.getStories(id, page, limit)
  }
}
