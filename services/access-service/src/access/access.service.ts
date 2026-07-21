import { Injectable } from "@nestjs/common"
import { PrismaService } from "../common/prisma.service"

@Injectable()
export class AccessService {
  constructor(private readonly prisma: PrismaService) {}

  async checkEpisodeAccess(userId: string, episodeId: string) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId } })
      const episode = await this.prisma.episode.findUnique({
        where: { id: episodeId },
        include: { story: { include: { episodes: { orderBy: { episodeNumber: "asc" } } } } },
      })

      if (!user || !episode) {
        return { allowed: false, reason: "User or episode not found" }
      }

      if (episode.isFree) {
        return { allowed: true }
      }

      const role = user.role as string
      const vipRoles = ["VIP_GOLD", "PREMIUM_CREATOR", "ADMIN", "SUPER_ADMIN"]
      if (vipRoles.includes(role)) {
        await this.trackAccess(user, episode)
        return { allowed: true }
      }

      if (user.isVIP) {
        await this.trackAccess(user, episode)
        return { allowed: true }
      }

      const episodeIndex = episode.story.episodes.findIndex((e) => e.id === episodeId) + 1
      if (episodeIndex < 1) {
        return { allowed: false, reason: "Episode not found in story" }
      }

      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      if (!user.lastReadReset || user.lastReadReset < today) {
        await this.prisma.user.update({
          where: { id: userId },
          data: { dailyEpisodesRead: 0, lastReadReset: now },
        })
        user.dailyEpisodesRead = 0
      }

      if (episodeIndex <= 20) {
        if (user.dailyEpisodesRead >= 2) {
          const nextReset = new Date(today.getTime() + 24 * 60 * 60 * 1000)
          return { allowed: false, reason: "Daily limit reached", nextUnlockAt: nextReset }
        }
      } else {
        if (user.lastEpisodeUnlockTime) {
          const hoursSinceLastUnlock = (now.getTime() - new Date(user.lastEpisodeUnlockTime).getTime()) / (1000 * 60 * 60)
          if (hoursSinceLastUnlock < 24) {
            const nextUnlock = new Date(user.lastEpisodeUnlockTime.getTime() + 24 * 60 * 60 * 1000)
            return { allowed: false, reason: "Time lock active", nextUnlockAt: nextUnlock }
          }
        }
      }

      await this.trackAccess(user, episode)
      return { allowed: true }
    } catch {
      return { allowed: true }
    }
  }

  private async trackAccess(user: any, episode: any) {
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        dailyEpisodesRead: { increment: 1 },
        lastEpisodeUnlockTime: new Date(),
      },
    })
  }

  async getDailyLimit(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return { used: 0, max: 2, resetAt: new Date() }
    }

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    if (!user.lastReadReset || user.lastReadReset < today) {
      return { used: 0, max: 2, resetAt: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
    }

    return {
      used: user.dailyEpisodesRead,
      max: 2,
      resetAt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
    }
  }

  async getNextUnlockTime(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user || !user.lastEpisodeUnlockTime) {
      return { nextUnlockAt: null }
    }

    const nextUnlock = new Date(user.lastEpisodeUnlockTime.getTime() + 24 * 60 * 60 * 1000)
    return { nextUnlockAt: nextUnlock > new Date() ? nextUnlock : null }
  }
}
