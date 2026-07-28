"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Sparkles, BookOpen, PenLine, Trophy, Sunrise, Star } from "lucide-react"
import { useSession } from "next-auth/react"

interface Profile {
  id: string
  displayName: string
  avatar: string | null
  age: number
  readingLevel: string
}

const GREETINGS = ["Welcome back", "Hey there", "Ready to create", "Time for adventure", "Hello"]
const LEVEL_LABELS: Record<string, string> = {
  beginning: "Beginning Reader",
  intermediate: "Intermediate Reader",
  advanced: "Advanced Reader",
}

export default function JuniorHomePage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const id = params.id as string

  useEffect(() => {
    fetch(`/api/family/junior/${id}`)
      .then((r) => r.json())
      .then((data) => { setProfile(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-400 border-t-purple-600" /></div>
  }

  if (!profile) {
    return <div className="flex min-h-screen items-center justify-center text-zinc-500">Profile not found</div>
  }

  const greeting = GREETINGS[profile.age % GREETINGS.length]

  return (
    <div className="mx-auto max-w-4xl p-4 md:p-8">
      <div className="mb-8 flex items-center gap-4">
        <span className="text-5xl">{profile.avatar || "😊"}</span>
        <div>
          <h1 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 md:text-2xl">
            {greeting}, {profile.displayName}! <Sunrise className="inline-block text-yellow-500" size={24} />
          </h1>
          <p className="text-sm text-zinc-500">{LEVEL_LABELS[profile.readingLevel] || profile.readingLevel} · Age {profile.age}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link href={`/junior/${id}/library`}
          className="group rounded-2xl border border-purple-200/60 bg-white/80 p-6 backdrop-blur-sm transition-all hover:border-purple-400 hover:shadow-lg dark:border-zinc-700/60 dark:bg-zinc-800/80">
          <BookOpen size={28} className="mb-3 text-purple-500" />
          <h3 className="font-bold text-zinc-800 dark:text-zinc-100">Read Stories</h3>
          <p className="text-xs text-zinc-500 mt-1">Discover magical adventures</p>
        </Link>

        <Link href={`/junior/${id}/write`}
          className="group rounded-2xl border border-purple-200/60 bg-white/80 p-6 backdrop-blur-sm transition-all hover:border-pink-400 hover:shadow-lg dark:border-zinc-700/60 dark:bg-zinc-800/80">
          <PenLine size={28} className="mb-3 text-pink-500" />
          <h3 className="font-bold text-zinc-800 dark:text-zinc-100">Write a Story</h3>
          <p className="text-xs text-zinc-500 mt-1">Let your imagination soar</p>
        </Link>

        <Link href={`/junior/${id}/achievements`}
          className="group rounded-2xl border border-purple-200/60 bg-white/80 p-6 backdrop-blur-sm transition-all hover:border-orange-400 hover:shadow-lg dark:border-zinc-700/60 dark:bg-zinc-800/80">
          <Trophy size={28} className="mb-3 text-orange-500" />
          <h3 className="font-bold text-zinc-800 dark:text-zinc-100">Achievements</h3>
          <p className="text-xs text-zinc-500 mt-1">Your superpowers so far</p>
        </Link>
      </div>

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
