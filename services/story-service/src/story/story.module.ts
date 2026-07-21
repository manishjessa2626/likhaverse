import { Module } from "@nestjs/common"
import { StoryController } from "./story.controller"
import { StoryService } from "./story.service"
import { PrismaService } from "../common/prisma.service"

@Module({
  controllers: [StoryController],
  providers: [StoryService, PrismaService],
  exports: [StoryService],
})
export class StoryModule {}
