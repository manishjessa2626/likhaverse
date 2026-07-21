import { NestFactory } from "@nestjs/core"
import { StoryModule } from "./story/story.module"

async function bootstrap() {
  const app = await NestFactory.create(StoryModule)
  app.enableCors({ origin: "*", credentials: true })
  const port = process.env.PORT || 3004
  await app.listen(port)
  console.log(`[Story Service] running on port ${port}`)
}
bootstrap()
