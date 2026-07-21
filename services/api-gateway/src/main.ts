import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { AllExceptionsFilter } from "./common/filters/http-exception.filter"

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.enableCors({ origin: "*", credentials: true })
  app.useGlobalFilters(new AllExceptionsFilter())

  const port = process.env.PORT || 3001
  await app.listen(port)
  console.log(`[API Gateway] running on port ${port}`)
}
bootstrap()
