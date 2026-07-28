"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"

interface JuniorStats {
  booksRead: number
  readingTimeMinutes: number
  storiesWritten: number
  streak?: number
}

interface JuniorProfile {
  id: string
  name: string
  avatar: string | null
  age: number
}

const HOME_CARDS = [
  { emoji: "📚", label: "Read Stories", href: "stories", color: "from-blue-400 to-blue-500" },
  { emoji: "✍️", label: "Write My Story", href: "write", color: "from-emerald-400 to-emerald-500" },
  { emoji: "🎨", label: "Draw Characters", href: "#", color: "from-pink-400 to-pink-500" },
  { emoji: "⭐", label: "Achievements", href: "achievements", color: "from-yellow-400 to-amber-500" },
  { emoji: "🏆", label: "Reading Streak", href: "#", color: "from-orange-400 to-orange-500" },
  { emoji: "👨‍👩‍👧", label: "Parent Library", href: "/family", color: "from-purple-400 to-purple-500" },
]

function getCardScale(age: number): string {
  if (age >= 4 && age <= 6) return "p-8 text-5xl text-lg"
  if (age >= 7 && age <= 9) return "p-6 text-4xl text-base"
  return "p-5 text-3xl text-sm"
}

export default function JuniorHomePage({ params }: { params: Promise<{ juniorId: string }> }) {
  const { juniorId } = use(params)
  const [profile, setProfile] = useState<JuniorProfile | null>(null)
  const [stats, setStats] = useState<JuniorStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [juniorRes, statsRes] = await Promise.all([
          fetch(`/api/family/junior`),
          fetch(`/api/family/junior/${juniorId}/stats`),
        ])
        if (juniorRes.ok) {
          const juniors: JuniorProfile[] = await juniorRes.json()
          const found = juniors.find((j) => j.id === juniorId)
          if (found) setProfile(found)
        }
        if (statsRes.ok) {
          const data = await statsRes.json()
          setStats(data)
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

  const age = profile?.age || 7
  const [cardPad, emojiSize, cardText] = getCardScale(age).split(" ")

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-purple-100 to-pink-100">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6 text-center">
          <span className="text-7xl block mb-2">{profile?.avatar || "👶"}</span>
          <h1 className="text-3xl font-bold text-purple-900">{profile?.name}&apos;s World</h1>
        </div>

        <div className="mb-8 grid grid-cols-3 gap-3">
          <div className="rounded-2xl bg-white/60 backdrop-blur-sm p-3 text-center">
            <p className={`font-bold text-purple-800 ${age <= 6 ? "text-2xl" : "text-xl"}`}>{stats?.booksRead || 0}</p>
            <p className="text-xs text-zinc-500">Books Read</p>
          </div>
          <div className="rounded-2xl bg-white/60 backdrop-blur-sm p-3 text-center">
            <p className={`font-bold text-emerald-700 ${age <= 6 ? "text-2xl" : "text-xl"}`}>{stats?.readingTimeMinutes || 0}m</p>
            <p className="text-xs text-zinc-500">Reading Time</p>
          </div>
          <div className="rounded-2xl bg-white/60 backdrop-blur-sm p-3 text-center">
            <p className={`font-bold text-amber-700 ${age <= 6 ? "text-2xl" : "text-xl"}`}>{stats?.storiesWritten || 0}</p>
            <p className="text-xs text-zinc-500">Stories</p>
          </div>
        </div>

        <div className={`grid ${age <= 6 ? "grid-cols-2 gap-5" : age <= 9 ? "grid-cols-2 gap-4" : "grid-cols-3 gap-4"}`}>
          {HOME_CARDS.map((card) => (
            <Link
              key={card.label}
              href={card.href.startsWith("/") ? card.href : `${juniorId}/${card.href}`}
              className={`rounded-2xl bg-gradient-to-br ${card.color} shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all ${cardPad}`}
            >
              <div className="flex flex-col items-center justify-center gap-2 h-full">
                <span className={emojiSize}>{card.emoji}</span>
                <span className={`font-bold text-white text-center leading-tight ${cardText}`}>
                  {card.label}
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/family"
            className="inline-block rounded-full bg-purple-600/80 hover:bg-purple-600 text-white px-6 py-2 text-sm font-medium backdrop-blur-sm transition-colors"
          >
            🔒 Enter Parent PIN
          </Link>
        </div>
      </div>
    </div>
  )
}
