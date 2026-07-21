import { NestFactory } from "@nestjs/core"
import { AccessModule } from "./access/access.module"

async function bootstrap() {
  const app = await NestFactory.create(AccessModule)
  app.enableCors({ origin: "*", credentials: true })
  const port = process.env.PORT || 3006
  await app.listen(port)
  console.log(`[Access Service] running on port ${port}`)
}
bootstrap()
