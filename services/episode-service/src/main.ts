import { NestFactory } from "@nestjs/core"
import { EpisodeModule } from "./episode/episode.module"

async function bootstrap() {
  const app = await NestFactory.create(EpisodeModule)
  app.enableCors({ origin: "*", credentials: true })
  const port = process.env.PORT || 3005
  await app.listen(port)
  console.log(`[Episode Service] running on port ${port}`)
}
bootstrap()
