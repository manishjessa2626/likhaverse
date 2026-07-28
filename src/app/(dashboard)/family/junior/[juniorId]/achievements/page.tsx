"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"

interface Badge {
  badgeType: string
  title: string
  description: string | null
  icon: string
  awardedAt: string
}

interface StatsData {
  booksRead: number
  readingTimeMinutes: number
  storiesWritten: number
  badges: Badge[]
}

const ALL_BADGES: { badgeType: string; icon: string; title: string; description: string }[] = [
  { badgeType: "FIRST_BOOK", icon: "📚", title: "First Book", description: "Read your first book" },
  { badgeType: "READ_7_DAYS", icon: "🌟", title: "Read for 7 Days", description: "Read 7 days in a row" },
  { badgeType: "FIRST_STORY", icon: "✍️", title: "First Story", description: "Write your first story" },
  { badgeType: "FANTASY_EXPLORER", icon: "🦄", title: "Fantasy Explorer", description: "Read 3 fantasy stories" },
  { badgeType: "SPACE_ADVENTURER", icon: "🚀", title: "Space Adventurer", description: "Read 3 adventure stories" },
  { badgeType: "READING_CHAMPION", icon: "🏅", title: "Reading Champion", description: "Read 10 books" },
]

export default function JuniorAchievementsPage({ params }: { params: Promise<{ juniorId: string }> }) {
  const { juniorId } = use(params)
  const [data, setData] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/family/junior/${juniorId}/stats`)
        if (res.ok) {
          setData(await res.json())
        }
      } catch {
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [juniorId])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-100 via-purple-100 to-pink-100">
        <div className="h-10 w-10 animate-spin rounded-full border-3 border-purple-300 border-t-purple-600" />
      </div>
    )
  }

  const earnedTypes = new Set(data?.badges.map((b) => b.badgeType) || [])
  const earnedCount = earnedTypes.size
  const totalCount = ALL_BADGES.length
  const progressPct = totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-purple-100 to-pink-100">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6 flex items-center gap-4">
          <Link href={`/family/junior/${juniorId}/home`} className="text-purple-600 hover:text-purple-800 text-lg">&larr;</Link>
          <h1 className="text-2xl font-bold text-purple-900">⭐ Achievements</h1>
        </div>

        <div className="glass-card rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-zinc-600">Progress</span>
            <span className="text-sm font-bold text-purple-800">{earnedCount}/{totalCount}</span>
          </div>
          <div className="h-3 rounded-full bg-purple-200 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-zinc-500 text-center">
            {earnedCount === 0 ? "Start reading to earn badges!" : `You've earned ${earnedCount} of ${totalCount} badges!`}
          </p>
        </div>

        <div className="grid gap-4">
          {ALL_BADGES.map((badge) => {
            const earned = data?.badges.find((b) => b.badgeType === badge.badgeType)
            return (
              <div
                key={badge.badgeType}
                className={`rounded-2xl p-5 flex items-center gap-4 transition-all ${earned ? "bg-white/70 backdrop-blur-sm border border-purple-200/60 shadow-sm" : "bg-white/30 border border-zinc-200/40"}`}
              >
                <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-3xl ${earned ? "bg-purple-100" : "bg-zinc-100 grayscale opacity-40"}`}>
                  {badge.icon}
                </div>
                <div className="flex-1">
                  <p className={`font-bold ${earned ? "text-purple-900" : "text-zinc-400"}`}>{badge.title}</p>
                  <p className={`text-sm ${earned ? "text-zinc-600" : "text-zinc-400"}`}>{badge.description}</p>
                  {earned && (
                    <p className="text-xs text-purple-500 mt-1">
                      Earned {new Date(earned.awardedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className={`text-2xl ${earned ? "opacity-100" : "opacity-30"}`}>
                  {earned ? "✅" : "🔒"}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
