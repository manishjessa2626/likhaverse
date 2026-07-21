import { Module } from "@nestjs/common"
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler"
import { APP_GUARD } from "@nestjs/core"
import { PassportModule } from "@nestjs/passport"
import { JwtModule } from "@nestjs/jwt"
import { AuthModule } from "./modules/auth/auth.module"
import { UserModule } from "./modules/user/user.module"
import { StoryModule } from "./modules/story/story.module"
import { EpisodeModule } from "./modules/episode/episode.module"
import { AccessModule } from "./modules/access/access.module"
import { PaymentModule } from "./modules/payment/payment.module"
import { NotificationModule } from "./modules/notification/notification.module"
import { PrismaService } from "./common/prisma.service"
import { RedisService } from "./common/redis.service"
import { JwtStrategy } from "./common/strategies/jwt.strategy"

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || "likhaverse-dev-secret",
      signOptions: { expiresIn: "15m" },
    }),
    AuthModule,
    UserModule,
    StoryModule,
    EpisodeModule,
    AccessModule,
    PaymentModule,
    NotificationModule,
  ],
  providers: [
    PrismaService,
    RedisService,
    JwtStrategy,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
