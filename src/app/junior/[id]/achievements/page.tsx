"use client"

import { Trophy, Star, BookOpen, PenLine, Sparkles } from "lucide-react"

const BADGES = [
  { name: "First Story", icon: "📖", desc: "Read your first story", earned: true },
  { name: "Young Author", icon: "✍️", desc: "Write your first story", earned: true },
  { name: "Bookworm", icon: "🐛", desc: "Read 5 stories", earned: false },
  { name: "Storyteller", icon: "🌟", desc: "Write 3 stories", earned: false },
  { name: "Explorer", icon: "🗺️", desc: "Visit all sections", earned: true },
  { name: "Superstar", icon: "⭐", desc: "Write 10 stories", earned: false },
  { name: "Adventurer", icon: "🏆", desc: "Read 20 stories", earned: false },
  { name: "Creative Mind", icon: "🎨", desc: "Write 5 stories", earned: false },
  { name: "Night Reader", icon: "🌙", desc: "Read after sunset", earned: false },
  { name: "Series Fan", icon: "📚", desc: "Read a series", earned: false },
]

const LEVELS = [
  { label: "Beginner", stars: 1, color: "from-zinc-300 to-zinc-400" },
  { label: "Rising Star", stars: 2, color: "from-yellow-300 to-yellow-400" },
  { label: "Super Reader", stars: 3, color: "from-orange-300 to-orange-400" },
  { label: "Legend", stars: 4, color: "from-purple-300 to-purple-400" },
]

export default function JuniorAchievementsPage() {
  const earned = BADGES.filter((b) => b.earned).length
  const currentLevel = Math.min(Math.floor(earned / 3), LEVELS.length - 1)
  const level = LEVELS[currentLevel]

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
            <div
              className={`h-full rounded-full bg-gradient-to-r ${level.color} transition-all`}
              style={{ width: `${(earned / BADGES.length) * 100}%` }}
            />
          </div>
          <span className="text-xs text-zinc-500">{earned}/{BADGES.length}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {BADGES.map((badge) => (
          <div
            key={badge.name}
            className={`rounded-2xl border p-4 text-center backdrop-blur-sm transition-all ${
              badge.earned
                ? "border-purple-200/60 bg-white/80 dark:border-zinc-700/60 dark:bg-zinc-800/80"
                : "border-zinc-200/60 bg-zinc-50/50 dark:border-zinc-800/60 dark:bg-zinc-900/50 opacity-50"
            }`}
          >
            <p className="text-3xl mb-2">{badge.icon}</p>
            <p className="text-xs font-bold text-zinc-800 dark:text-zinc-100">{badge.name}</p>
            <p className="mt-0.5 text-[10px] text-zinc-500">{badge.desc}</p>
            {!badge.earned && <p className="mt-2 text-[10px] text-zinc-400">🔒 Locked</p>}
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-purple-200/60 bg-white/70 p-6 backdrop-blur-sm dark:border-zinc-700/60 dark:bg-zinc-800/70">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={16} className="text-purple-500" />
          <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-100">Keep Going!</h2>
        </div>
        <p className="text-xs text-zinc-500 leading-relaxed">
          You&apos;ve earned {earned} out of {BADGES.length} badges. Read more stories and write your own to unlock them all!
        </p>
      </div>
    </div>
  )
}
