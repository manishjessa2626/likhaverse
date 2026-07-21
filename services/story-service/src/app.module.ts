import { Module } from "@nestjs/common"
import { StoryModule } from "./story/story.module"

@Module({ imports: [StoryModule] })
export class AppModule {}
