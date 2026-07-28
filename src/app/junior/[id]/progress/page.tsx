"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { BarChart3, BookOpen, PenLine, Clock, Flame } from "lucide-react"

export default function JuniorProgressPage() {
  const params = useParams()
  const id = params.id as string
  const [storyCount] = useState(12)
  const [writtenCount] = useState(2)

  useEffect(() => {
    fetch(`/api/family/junior/${id}`).catch(() => {})
  }, [id])

  const stats = [
    { label: "Stories Read", value: storyCount, icon: BookOpen, color: "text-purple-500", bg: "bg-purple-100 dark:bg-purple-900/30" },
    { label: "Stories Written", value: writtenCount, icon: PenLine, color: "text-pink-500", bg: "bg-pink-100 dark:bg-pink-900/30" },
    { label: "Reading Streak", value: "3 days", icon: Flame, color: "text-orange-500", bg: "bg-orange-100 dark:bg-orange-900/30" },
    { label: "Minutes Read", value: "45 min", icon: Clock, color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-900/30" },
  ]

  return (
    <div className="mx-auto max-w-3xl p-4 md:p-8">
      <div className="mb-6 flex items-center gap-3">
        <BarChart3 size={24} className="text-blue-500" />
        <h1 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">Reading Progress</h1>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div
            key={label}
            className="rounded-2xl border border-purple-200/60 bg-white/80 p-5 backdrop-blur-sm dark:border-zinc-700/60 dark:bg-zinc-800/80"
          >
            <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${bg}`}>
              <Icon size={20} className={color} />
            </div>
            <p className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">{value}</p>
            <p className="text-xs text-zinc-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-purple-200/60 bg-white/70 p-6 backdrop-blur-sm dark:border-zinc-700/60 dark:bg-zinc-800/70">
        <h2 className="mb-3 text-sm font-bold text-zinc-800 dark:text-zinc-100">Reading Goal</h2>
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-1 h-3 rounded-full bg-purple-100 dark:bg-zinc-700 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
              style={{ width: "35%" }}
            />
          </div>
          <span className="text-xs text-zinc-500">35%</span>
        </div>
        <p className="text-xs text-zinc-500">
          Read 20 stories this month · {storyCount} down, {20 - storyCount} to go!
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-purple-200/60 bg-white/70 p-6 backdrop-blur-sm dark:border-zinc-700/60 dark:bg-zinc-800/70">
        <h2 className="mb-3 text-sm font-bold text-zinc-800 dark:text-zinc-100">Recent Activity</h2>
        <div className="space-y-3">
          {[
            { icon: "📖", text: "Read 'The Lost City'", time: "Today" },
            { icon: "✍️", text: "Wrote 'My Dragon Friend'", time: "Yesterday" },
            { icon: "📖", text: "Read 'Magical Forest'", time: "2 days ago" },
            { icon: "🏆", text: "Earned 'Explorer' badge", time: "3 days ago" },
          ].map((activity, i) => (
            <div key={i} className="flex items-center gap-3 text-sm">
              <span>{activity.icon}</span>
              <span className="flex-1 text-zinc-700 dark:text-zinc-300">{activity.text}</span>
              <span className="text-[10px] text-zinc-400">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
