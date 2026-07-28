"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Trophy, Star, Sparkles } from "lucide-react"

interface Achievement {
  key: string
  label: string
  description: string
  icon: string
  earned: boolean
  earnedAt: string | null
}

const LEVELS = [
  { label: "Beginner", stars: 1, min: 0 },
  { label: "Rising Star", stars: 2, min: 3 },
  { label: "Super Reader", stars: 3, min: 6 },
  { label: "Legend", stars: 4, min: 10 },
]

export default function JuniorAchievementsPage() {
  const params = useParams()
  const id = params.id as string
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let cancelled = false
    fetch(`/api/junior/achievements?juniorId=${id}`)
      .then((r) => { if (!r.ok) throw new Error("Failed to load"); return r.json() })
      .then((data) => { if (!cancelled) setAchievements(Array.isArray(data) ? data : []) })
      .catch((err) => { if (!cancelled) setError(err.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [id])

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-400 border-t-purple-600" /></div>
  }

  if (error) {
    return <div className="mx-auto max-w-3xl p-4 md:p-8"><div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-900/20"><p className="text-red-600 dark:text-red-400 text-sm">{error}</p></div></div>
  }

  const earned = achievements.filter((a) => a.earned).length
  const total = achievements.length
  const level = [...LEVELS].reverse().find((l) => earned >= l.min) || LEVELS[0]
  const recentEarned = achievements.filter((a) => a.earned).sort(
    (a, b) => new Date(b.earnedAt || 0).getTime() - new Date(a.earnedAt || 0).getTime(),
  ).slice(0, 3)

  return (
    <div className="mx-auto max-w-3xl p-4 md:p-8">
      <div className="mb-6 flex items-center gap-3">
        <Trophy size={24} className="text-orange-500" />
        <h1 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">Achievements</h1>
      </div>

      <div className="mb-8 rounded-2xl border border-purple-200/60 bg-gradient-to-r from-purple-100/50 to-orange-100/50 p-6 backdrop-blur-sm dark:border-zinc-700/60 dark:from-purple-900/20 dark:to-orange-900/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Your Level</p>
            <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-orange-500">
              {level.label}
            </p>
          </div>
          <div className="flex gap-0.5">
            {Array.from({ length: level.stars }, (_, i) => (
              <Star key={i} size={22} fill="currentColor" className="text-yellow-400" />
            ))}
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1 h-2 rounded-full bg-white/60 dark:bg-zinc-700/60 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-orange-400 transition-all" style={{ width: `${(earned / total) * 100}%` }} />
          </div>
          <span className="text-xs text-zinc-500">{earned}/{total}</span>
        </div>
      </div>

      {recentEarned.length > 0 && (
        <div className="mb-6 rounded-2xl border border-green-200/60 bg-green-50/70 p-4 backdrop-blur-sm dark:border-green-900/60 dark:bg-green-900/20">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} className="text-green-500" />
            <h2 className="text-sm font-bold text-green-700 dark:text-green-400">Recently Earned</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
            {recentEarned.map((a) => (
              <div key={a.key} className="shrink-0 rounded-xl border border-green-200/60 bg-white/70 p-3 text-center dark:border-green-900/60 dark:bg-zinc-800/70">
                <p className="text-2xl mb-1">{a.icon}</p>
                <p className="text-[10px] font-bold text-green-700 dark:text-green-400">{a.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {achievements.map((a) => (
          <div
            key={a.key}
            className={`rounded-2xl border p-4 text-center backdrop-blur-sm transition-all ${
              a.earned
                ? "border-purple-200/60 bg-white/80 dark:border-zinc-700/60 dark:bg-zinc-800/80"
                : "border-zinc-200/60 bg-zinc-50/50 dark:border-zinc-800/60 dark:bg-zinc-900/50 opacity-50"
            }`}
          >
            <p className="text-3xl mb-2">{a.icon}</p>
            <p className="text-xs font-bold text-zinc-800 dark:text-zinc-100">{a.label}</p>
            <p className="mt-0.5 text-[10px] text-zinc-500">{a.description}</p>
            {!a.earned && <p className="mt-2 text-[10px] text-zinc-400">🔒 Locked</p>}
            {a.earned && a.earnedAt && (
              <p className="mt-2 text-[8px] text-green-500">{new Date(a.earnedAt).toLocaleDateString()}</p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-purple-200/60 bg-white/70 p-6 backdrop-blur-sm dark:border-zinc-700/60 dark:bg-zinc-800/70">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={16} className="text-purple-500" />
          <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-100">Keep Going!</h2>
        </div>
        <p className="text-xs text-zinc-500 leading-relaxed">
          You&apos;ve earned {earned} out of {total} achievements. Read more stories and write your own to unlock them all!
        </p>
      </div>
    </div>
  )
}
