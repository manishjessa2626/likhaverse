export type AccessResult = {
  allowed: boolean
  reason?: "DAILY_LIMIT" | "WAIT_TIMER" | null
}

export interface EpisodeAccessUser {
  isVIP: boolean
  premium: boolean
  role: string
  dailyEpisodesRead: number
  lastReadReset: Date | null
  lastEpisodeUnlockTime: Date | null
}

export function checkEpisodeAccess(
  user: EpisodeAccessUser,
  chapterNumber: number,
): AccessResult {
  try {
    const isVip = user.isVIP || user.premium || user.role === "VIP_GOLD" || user.role === "PREMIUM_CREATOR" || user.role === "ADMIN" || user.role === "SUPER_ADMIN"
    if (isVip) {
      return { allowed: true }
    }

    const now = new Date()

    if (chapterNumber <= 20) {
      const lastReset = user.lastReadReset
      const needsReset = !lastReset || (now.getTime() - new Date(lastReset).getTime() >= 24 * 60 * 60 * 1000)

      if (needsReset) {
        return { allowed: true }
      }

      if (user.dailyEpisodesRead < 2) {
        return { allowed: true }
      }

      return { allowed: false, reason: "DAILY_LIMIT" }
    }

    // Episodes 21+
    const unlockTime = user.lastEpisodeUnlockTime
    if (!unlockTime || now.getTime() >= new Date(unlockTime).getTime()) {
      return { allowed: true }
    }

    return { allowed: false, reason: "WAIT_TIMER" }
  } catch {
    return { allowed: true }
  }
}

export function getNextUnlockTime(
  user: Pick<EpisodeAccessUser, "lastEpisodeUnlockTime">,
): Date | null {
  try {
    if (!user.lastEpisodeUnlockTime) return null
    const unlock = new Date(user.lastEpisodeUnlockTime)
    return unlock > new Date() ? unlock : null
  } catch {
    return null
  }
}
