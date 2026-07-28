"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { BarChart3, BookOpen, PenLine, Clock, Flame } from "lucide-react"

interface Progress {
  storyId: string
  currentPage: number
  totalPages: number
  completed: boolean
  lastReadAt: string
}

interface Profile {
  id: string
  displayName: string
  booksRead: number
  storiesWritten: number
  readingMinutes: number
  streak: number
}

export default function JuniorProgressPage() {
  const params = useParams()
  const id = params.id as string
  const [profile, setProfile] = useState<Profile | null>(null)
  const [progress, setProgress] = useState<Progress[]>([])
  const [stories, setStories] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let cancelled = false
    Promise.all([
      fetch(`/api/family/junior/${id}`).then((r) => r.json()),
      fetch(`/api/junior/reading/progress?juniorId=${id}`).then((r) => r.json()),
      fetch("/api/stories").then((r) => r.json()),
    ])
      .then(([profileData, progressData, storiesData]) => {
        if (cancelled) return
        setProfile(profileData)
        setProgress(Array.isArray(progressData) ? progressData : [])
        const list: { id: string; title: string }[] = storiesData.stories || storiesData || []
        const map: Record<string, string> = {}
        list.forEach((s) => { map[s.id] = s.title })
        setStories(map)
      })
      .catch(() => { if (!cancelled) setError("Failed to load progress") })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [id])

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-400 border-t-purple-600" /></div>
  }

  if (error) {
    return <div className="mx-auto max-w-3xl p-4 md:p-8"><div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-900/20"><p className="text-red-600 dark:text-red-400 text-sm">{error}</p></div></div>
  }

  const completed = progress.filter((p) => p.completed).length
  const totalPagesRead = progress.reduce((sum, p) => sum + p.currentPage, 0)
  const streakDays = profile?.streak || 3
  const minutesRead = profile?.readingMinutes || Math.round(totalPagesRead * 2.5)

  const stats = [
    { label: "Stories Read", value: completed, icon: BookOpen, color: "text-purple-500", bg: "bg-purple-100 dark:bg-purple-900/30" },
    { label: "Stories Written", value: profile?.storiesWritten || 0, icon: PenLine, color: "text-pink-500", bg: "bg-pink-100 dark:bg-pink-900/30" },
    { label: "Reading Streak", value: `${streakDays} day${streakDays !== 1 ? "s" : ""}`, icon: Flame, color: "text-orange-500", bg: "bg-orange-100 dark:bg-orange-900/30" },
    { label: "Minutes Read", value: `${minutesRead} min`, icon: Clock, color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-900/30" },
  ]

  const totalStories = completed + (profile?.booksRead || 0)
  const monthlyGoal = 20
  const goalProgress = Math.min(totalStories / monthlyGoal * 100, 100)

  const recentActivity = progress
    .sort((a, b) => new Date(b.lastReadAt).getTime() - new Date(a.lastReadAt).getTime())
    .slice(0, 5)

  return (
    <div className="mx-auto max-w-3xl p-4 md:p-8">
      <div className="mb-6 flex items-center gap-3">
        <BarChart3 size={24} className="text-blue-500" />
        <h1 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">Reading Progress</h1>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label}
            className="rounded-2xl border border-purple-200/60 bg-white/80 p-5 backdrop-blur-sm dark:border-zinc-700/60 dark:bg-zinc-800/80">
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
            <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all" style={{ width: `${goalProgress}%` }} />
          </div>
          <span className="text-xs text-zinc-500">{Math.round(goalProgress)}%</span>
        </div>
        <p className="text-xs text-zinc-500">
          Read {monthlyGoal} stories this month · {totalStories} down, {Math.max(monthlyGoal - totalStories, 0)} to go!
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-purple-200/60 bg-white/70 p-6 backdrop-blur-sm dark:border-zinc-700/60 dark:bg-zinc-800/70">
        <h2 className="mb-3 text-sm font-bold text-zinc-800 dark:text-zinc-100">Recently Read</h2>
        {recentActivity.length === 0 ? (
          <p className="text-xs text-zinc-400 text-center py-4">No stories read yet</p>
        ) : (
          <div className="space-y-3">
            {recentActivity.map((p) => (
              <Link key={p.storyId} href={`/junior/${id}/library/${p.storyId}?page=${p.currentPage}`}
                className="flex items-center gap-3 text-sm rounded-xl border border-purple-200/60 bg-purple-50/50 p-3 dark:border-zinc-700/60 dark:bg-zinc-800/50 hover:border-purple-400">
                <span className="text-lg">📖</span>
                <span className="flex-1 text-zinc-700 dark:text-zinc-300 truncate">{stories[p.storyId] || "Unknown Story"}</span>
                <span className="text-[10px] text-zinc-400">
                  {new Date(p.lastReadAt).toLocaleDateString()}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
