import { NestFactory } from "@nestjs/core"
import { AuthModule } from "./auth/auth.module"

async function bootstrap() {
  const app = await NestFactory.create(AuthModule)
  app.enableCors({ origin: "*", credentials: true })
  const port = process.env.PORT || 3002
  await app.listen(port)
  console.log(`[Auth Service] running on port ${port}`)
}
bootstrap()
