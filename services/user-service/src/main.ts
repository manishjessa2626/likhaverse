import { NestFactory } from "@nestjs/core"
import { UserModule } from "./user/user.module"

async function bootstrap() {
  const app = await NestFactory.create(UserModule)
  app.enableCors({ origin: "*", credentials: true })
  const port = process.env.PORT || 3003
  await app.listen(port)
  console.log(`[User Service] running on port ${port}`)
}
bootstrap()
