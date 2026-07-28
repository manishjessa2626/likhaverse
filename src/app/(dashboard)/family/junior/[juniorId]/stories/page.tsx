"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"

interface Story {
  id: string
  title: string
  author: { name: string }
  tags: string | null
  ageRating: string
  cover: string | null
  description: string | null
}

const CATEGORIES = ["All", "Adventure", "Fantasy", "Animals", "Friendship", "Fairy Tales", "Educational", "Bedtime"]
const CATEGORY_COLORS: Record<string, string> = {
  All: "bg-purple-600 text-white",
  Adventure: "bg-orange-500 text-white",
  Fantasy: "bg-indigo-500 text-white",
  Animals: "bg-emerald-500 text-white",
  Friendship: "bg-pink-500 text-white",
  "Fairy Tales": "bg-amber-500 text-white",
  Educational: "bg-blue-500 text-white",
  Bedtime: "bg-violet-500 text-white",
}
const CARD_GRADIENTS = [
  "from-rose-200 to-pink-300",
  "from-sky-200 to-blue-300",
  "from-emerald-200 to-teal-300",
  "from-amber-200 to-orange-300",
  "from-violet-200 to-purple-300",
  "from-lime-200 to-green-300",
]

const BLOCKED_TAGS = ["horror", "thriller", "violence", "mature", "explicit", "18+"]

function isSafe(tags: string | null): boolean {
  if (!tags) return true
  const tagList = tags.toLowerCase().split(",").map((t) => t.trim())
  return !BLOCKED_TAGS.some((b) => tagList.includes(b))
}

export default function JuniorStoriesPage({ params }: { params: Promise<{ juniorId: string }> }) {
  const { juniorId } = use(params)
  const [stories, setStories] = useState<Story[]>([])
  const [category, setCategory] = useState("All")
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/stories?status=PUBLISHED&limit=50")
        if (res.ok) {
          const all: Story[] = await res.json()
          const safe = all.filter((s) => isSafe(s.tags) && (s.ageRating === "ALL" || s.ageRating === "7+"))
          setStories(safe)
        }
      } catch {
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = stories.filter((s) => {
    const matchCategory = category === "All" || (s.tags && s.tags.toLowerCase().includes(category.toLowerCase()))
    const matchSearch = !search || s.title.toLowerCase().includes(search.toLowerCase()) || s.author?.name?.toLowerCase().includes(search.toLowerCase())
    return matchCategory && matchSearch
  })

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-100 via-purple-100 to-pink-100">
        <div className="h-10 w-10 animate-spin rounded-full border-3 border-purple-300 border-t-purple-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-purple-100 to-pink-100">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex items-center gap-4">
          <Link href={`/family/junior/${juniorId}/home`} className="text-purple-600 hover:text-purple-800 text-lg">&larr;</Link>
          <h1 className="text-2xl font-bold text-purple-900">📚 Stories for You</h1>
        </div>

        <div className="mb-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stories..."
            className="w-full rounded-xl border border-purple-200/60 bg-white/70 px-4 py-3 text-sm outline-none focus:border-purple-400 backdrop-blur-sm"
          />
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${CATEGORY_COLORS[c]} ${category === c ? "ring-2 ring-purple-400 ring-offset-2" : "opacity-70 hover:opacity-100"}`}
            >
              {c}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-3">📖</p>
            <p className="text-zinc-500">No stories found</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filtered.map((story, i) => (
              <Link
                key={story.id}
                href={`/stories/${story.id}`}
                className="group rounded-2xl bg-white/70 backdrop-blur-sm border border-purple-200/60 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all"
              >
                <div className={`h-32 bg-gradient-to-br ${CARD_GRADIENTS[i % CARD_GRADIENTS.length]} flex items-center justify-center`}>
                  {story.cover ? (
                    <img src={story.cover} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-5xl">📘</span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-purple-900 truncate group-hover:text-purple-700 transition-colors">{story.title}</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">by {story.author?.name || "Unknown"}</p>
                  {story.tags && (
                    <span className="mt-2 inline-block rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700">
                      {story.tags.split(",")[0].trim()}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
