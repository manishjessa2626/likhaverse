import { Module } from "@nestjs/common"
import { EpisodeModule } from "./episode/episode.module"

@Module({ imports: [EpisodeModule] })
export class AppModule {}
