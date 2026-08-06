"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Sparkles, BookOpen, BookMarked, PenLine, Trophy, Sunrise, Star, Clock, TrendingUp } from "lucide-react"

interface Profile {
  id: string
  displayName: string
  avatar: string | null
  age: number
  readingLevel: string
  booksRead: number
  storiesWritten: number
  streak: number
}

interface ReadingProgress {
  storyId: string
  currentPage: number
  totalPages: number
  completed: boolean
  lastReadAt: string
}

const GREETINGS = ["Welcome back", "Hey there", "Ready to create", "Time for adventure", "Hello"]
const LEVEL_LABELS: Record<string, string> = {
  beginning: "Beginning Reader", beginner: "Beginning Reader",
  intermediate: "Intermediate Reader",
  advanced: "Advanced Reader",
}

export default function JuniorHomePage() {
  const params = useParams()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [progress, setProgress] = useState<ReadingProgress[]>([])
  const [stories, setStories] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const id = params.id as string

  useEffect(() => {
    let cancelled = false
    Promise.all([
      fetch(`/api/family/junior/${id}`).then((r) => { if (!r.ok) throw new Error("Failed to load profile"); return r.json() }),
      fetch(`/api/junior/reading/progress?juniorId=${id}`).then((r) => r.json()),
      fetch(`/api/junior/stories?juniorId=${id}`).then((r) => r.json()),
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
      .catch((err) => { if (!cancelled) setError(err.message || "Something went wrong") })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [id])

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-400 border-t-purple-600" /></div>
  }

  if (error) {
    return <div className="flex min-h-screen items-center justify-center p-4"><div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-900/20"><p className="text-red-600 dark:text-red-400 text-sm">{error}</p></div></div>
  }

  if (!profile) {
    return <div className="flex min-h-screen items-center justify-center text-zinc-500">Profile not found</div>
  }

  const greeting = GREETINGS[profile.age % GREETINGS.length]
  const continueReading = progress.filter((p) => !p.completed && p.currentPage > 0).slice(0, 3)
  const recentlyRead = [...progress].sort(
    (a, b) => new Date(b.lastReadAt).getTime() - new Date(a.lastReadAt).getTime(),
  ).slice(0, 4)

  return (
    <div className="mx-auto max-w-4xl p-4 md:p-8">
      <div className="mb-6 flex items-center gap-4">
        <span className="text-5xl">{profile.avatar || "😊"}</span>
        <div>
          <h1 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 md:text-2xl">
            {greeting}, {profile.displayName}! <Sunrise className="inline-block text-yellow-500" size={24} />
          </h1>
          <p className="text-sm text-zinc-500">{LEVEL_LABELS[profile.readingLevel] || profile.readingLevel} · Age {profile.age}</p>
        </div>
      </div>

      {profile.streak > 0 && (
        <div className="mb-6 rounded-2xl border border-orange-200/60 bg-gradient-to-r from-orange-50/80 to-yellow-50/80 p-4 backdrop-blur-sm dark:border-orange-900/60 dark:from-orange-900/20 dark:to-yellow-900/20">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔥</span>
            <span className="text-sm font-bold text-orange-700 dark:text-orange-400">{profile.streak}-day streak!</span>
          </div>
        </div>
      )}

      {continueReading.length > 0 && (
        <div className="mb-6">
          <div className="mb-3 flex items-center gap-2">
            <TrendingUp size={16} className="text-purple-500" />
            <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-100">Continue Reading</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            {continueReading.map((p) => (
              <Link key={p.storyId} href={`/junior/${id}/library/${p.storyId}?page=${p.currentPage}`}
                className="shrink-0 w-32 rounded-2xl border border-purple-200/60 bg-white/80 p-3 backdrop-blur-sm hover:border-purple-400 hover:shadow-lg dark:border-zinc-700/60 dark:bg-zinc-800/80">
                <div className="mb-2 aspect-[3/4] w-full overflow-hidden rounded-xl bg-gradient-to-br from-purple-200 to-pink-200 dark:from-purple-800 dark:to-pink-800">
                  <div className="flex h-full items-center justify-center text-3xl">📖</div>
                </div>
                <p className="text-[10px] font-bold text-zinc-800 dark:text-zinc-100 truncate">{stories[p.storyId] || "Story"}</p>
                <p className="mt-1 h-1 w-full rounded-full bg-purple-100 dark:bg-zinc-700 overflow-hidden">
                  <span className="block h-full rounded-full bg-purple-500" style={{ width: `${Math.min((p.currentPage / Math.max(p.totalPages, 1)) * 100, 100)}%` }} />
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link href={`/junior/${id}/library`}
          className="group rounded-2xl border border-purple-200/60 bg-white/80 p-6 backdrop-blur-sm transition-all hover:border-purple-400 hover:shadow-lg dark:border-zinc-700/60 dark:bg-zinc-800/80">
          <BookOpen size={28} className="mb-3 text-purple-500" />
          <h3 className="font-bold text-zinc-800 dark:text-zinc-100">Read Stories</h3>
          <p className="text-xs text-zinc-500 mt-1">Discover magical adventures</p>
          {profile.booksRead > 0 && <p className="mt-2 text-[10px] text-purple-500">{profile.booksRead} read</p>}
        </Link>

        <Link href={`/junior/${id}/classic-library`}
          className="group rounded-2xl border border-purple-200/60 bg-white/80 p-6 backdrop-blur-sm transition-all hover:border-emerald-400 hover:shadow-lg dark:border-zinc-700/60 dark:bg-zinc-800/80">
          <BookMarked size={28} className="mb-3 text-emerald-500" />
          <h3 className="font-bold text-zinc-800 dark:text-zinc-100">Classic Library</h3>
          <p className="text-xs text-zinc-500 mt-1">Timeless tales for all ages</p>
        </Link>

        <Link href={`/junior/${id}/write`}
          className="group rounded-2xl border border-purple-200/60 bg-white/80 p-6 backdrop-blur-sm transition-all hover:border-pink-400 hover:shadow-lg dark:border-zinc-700/60 dark:bg-zinc-800/80">
          <PenLine size={28} className="mb-3 text-pink-500" />
          <h3 className="font-bold text-zinc-800 dark:text-zinc-100">Write a Story</h3>
          <p className="text-xs text-zinc-500 mt-1">Let your imagination soar</p>
          {profile.storiesWritten > 0 && <p className="mt-2 text-[10px] text-pink-500">{profile.storiesWritten} written</p>}
        </Link>

        <Link href={`/junior/${id}/achievements`}
          className="group rounded-2xl border border-purple-200/60 bg-white/80 p-6 backdrop-blur-sm transition-all hover:border-orange-400 hover:shadow-lg dark:border-zinc-700/60 dark:bg-zinc-800/80">
          <Trophy size={28} className="mb-3 text-orange-500" />
          <h3 className="font-bold text-zinc-800 dark:text-zinc-100">Achievements</h3>
          <p className="text-xs text-zinc-500 mt-1">Your superpowers so far</p>
        </Link>
      </div>

      {recentlyRead.length > 0 && (
        <div className="mt-6">
          <div className="mb-3 flex items-center gap-2">
            <Clock size={16} className="text-blue-500" />
            <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-100">Recently Read</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            {recentlyRead.map((p) => (
              <Link key={`recent-${p.storyId}`} href={`/junior/${id}/library/${p.storyId}?page=${p.currentPage}`}
                className="shrink-0 w-24 rounded-xl border border-purple-200/60 bg-white/70 p-2 backdrop-blur-sm hover:border-purple-400 dark:border-zinc-700/60 dark:bg-zinc-800/70">
                <div className="mb-1 aspect-[3/4] w-full overflow-hidden rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900">
                  <div className="flex h-full items-center justify-center text-lg">📖</div>
                </div>
                <p className="text-[10px] font-bold text-zinc-800 dark:text-zinc-100 truncate">{stories[p.storyId] || "Story"}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 rounded-2xl border border-purple-200/60 bg-white/70 p-6 backdrop-blur-sm dark:border-zinc-700/60 dark:bg-zinc-800/70">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles size={18} className="text-purple-500" />
          <h2 className="font-bold text-zinc-800 dark:text-zinc-100">Daily Inspiration</h2>
        </div>
        <p className="text-zinc-600 dark:text-zinc-300 text-sm leading-relaxed">
          "Every great story begins with a single word. What will {profile.displayName}'s story be today?"
        </p>
        <div className="mt-4 flex items-center gap-1 text-yellow-500">
          {[1, 2, 3, 4, 5].map((i) => <Star key={i} size={14} fill="currentColor" />)}
        </div>
      </div>
    </div>
  )
}
