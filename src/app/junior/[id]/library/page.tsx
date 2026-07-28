"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { BookOpen, Search } from "lucide-react"
import Link from "next/link"

interface Story {
  id: string
  title: string
  blurb: string | null
  coverImage: string | null
  ageRating: string | null
  tags: string | null
  author: { name: string | null }
}

const SAFE_AGE_RATINGS = ["everyone", "children", "kids", "all", null]

export default function JuniorLibraryPage() {
  const params = useParams()
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const id = params.id as string

  useEffect(() => {
    fetch("/api/stories")
      .then((r) => r.json())
      .then((data) => {
        const list: Story[] = data.stories || data || []
        setStories(list.filter((s: Story) =>
          SAFE_AGE_RATINGS.includes(s.ageRating) ||
          (s.tags && !s.tags.toLowerCase().includes("mature") && !s.tags.toLowerCase().includes("adult")),
        ))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = stories.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase()),
  )

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-400 border-t-purple-600" /></div>
  }

  return (
    <div className="mx-auto max-w-4xl p-4 md:p-8">
      <div className="mb-6 flex items-center gap-3">
        <BookOpen size={24} className="text-purple-500" />
        <h1 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">Story Library</h1>
      </div>

      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          placeholder="Search stories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-purple-200/60 bg-white/70 px-9 py-2.5 text-sm text-zinc-800 placeholder:text-zinc-400 focus:border-purple-400 focus:outline-none dark:border-zinc-700/60 dark:bg-zinc-800/70 dark:text-zinc-100"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-purple-200/60 bg-white/70 p-12 text-center backdrop-blur-sm dark:border-zinc-700/60 dark:bg-zinc-800/70">
          <p className="text-5xl mb-3">📚</p>
          <p className="text-zinc-500">No stories found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {filtered.map((story) => (
            <Link
              key={story.id}
              href={`/junior/${id}/library/${story.id}`}
              className="group rounded-2xl border border-purple-200/60 bg-white/80 p-3 backdrop-blur-sm transition-all hover:border-purple-400 hover:shadow-lg dark:border-zinc-700/60 dark:bg-zinc-800/80"
            >
              <div className="mb-2 aspect-[3/4] w-full overflow-hidden rounded-xl bg-gradient-to-br from-purple-200 to-pink-200 dark:from-purple-800 dark:to-pink-800">
                {story.coverImage ? (
                  <img src={story.coverImage} alt={story.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-4xl">📖</div>
                )}
              </div>
              <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-100 leading-tight line-clamp-2">
                {story.title}
              </h3>
              <p className="mt-0.5 text-[10px] text-zinc-500">{story.author.name || "Unknown"}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
