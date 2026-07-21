import { Injectable, OnModuleDestroy } from "@nestjs/common"
import Redis from "ioredis"

@Injectable()
export class RedisService extends Redis implements OnModuleDestroy {
  constructor() {
    super({
      host: process.env.REDIS_HOST || "localhost",
      port: Number(process.env.REDIS_PORT) || 6379,
      retryStrategy: (times) => Math.min(times * 50, 2000),
    })
  }

  onModuleDestroy() {
    this.disconnect()
  }
}
