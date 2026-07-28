"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { BookOpen, Search, Bookmark, Clock, TrendingUp } from "lucide-react"
import Link from "next/link"
import { CategoryFilter, CATEGORIES, matchCategory } from "@/components/junior/CategoryFilter"

interface Story {
  id: string
  title: string
  blurb: string | null
  coverImage: string | null
  ageRating: string | null
  tags: string | null
  author: { name: string | null }
}

interface ReadingProgress {
  storyId: string
  currentPage: number
  totalPages: number
  completed: boolean
  lastReadAt: string
}

interface Bookmark {
  storyId: string
  page: number
}

const SAFE_AGE_RATINGS = ["everyone", "children", "kids", "all", null]

export default function JuniorLibraryPage() {
  const params = useParams()
  const [stories, setStories] = useState<Story[]>([])
  const [progress, setProgress] = useState<ReadingProgress[]>([])
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const id = params.id as string

  useEffect(() => {
    Promise.all([
      fetch("/api/stories").then((r) => r.json()),
      fetch(`/api/junior/reading/progress?juniorId=${id}`).then((r) => r.json()),
      fetch(`/api/junior/reading/bookmarks?juniorId=${id}`).then((r) => r.json()),
    ])
      .then(([storiesData, progressData, bookmarksData]) => {
        const list: Story[] = storiesData.stories || storiesData || []
        setStories(list.filter((s: Story) =>
          SAFE_AGE_RATINGS.includes(s.ageRating) ||
          (s.tags && !s.tags.toLowerCase().includes("mature") && !s.tags.toLowerCase().includes("adult")),
        ))
        setProgress(Array.isArray(progressData) ? progressData : [])
        setBookmarks(Array.isArray(bookmarksData) ? bookmarksData : [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  const filtered = stories.filter((s) => {
    const matchesSearch = s.title.toLowerCase().includes(search.toLowerCase())
    const cat = CATEGORIES.find((c) => c.id === category)
    const matchesCategory = cat ? matchCategory(s, cat) : true
    return matchesSearch && matchesCategory
  })

  const continueReading = progress.filter((p) => !p.completed && p.currentPage > 0)
  const recentlyRead = [...progress].sort(
    (a, b) => new Date(b.lastReadAt).getTime() - new Date(a.lastReadAt).getTime(),
  ).slice(0, 5)

  const getStory = useCallback((storyId: string) => stories.find((s) => s.id === storyId), [stories])
  const isBookmarked = useCallback((storyId: string) => bookmarks.some((b) => b.storyId === storyId), [bookmarks])

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-400 border-t-purple-600" /></div>
  }

  return (
    <div className="mx-auto max-w-4xl p-4 md:p-8">
      <div className="mb-6 flex items-center gap-3">
        <BookOpen size={24} className="text-purple-500" />
        <h1 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">Story Library</h1>
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          placeholder="Search stories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-purple-200/60 bg-white/70 px-9 py-2.5 text-sm text-zinc-800 placeholder:text-zinc-400 focus:border-purple-400 focus:outline-none dark:border-zinc-700/60 dark:bg-zinc-800/70 dark:text-zinc-100"
        />
      </div>

      <CategoryFilter selected={category} onSelect={setCategory} />

      {continueReading.length > 0 && (
        <div className="mb-6 mt-4">
          <div className="mb-3 flex items-center gap-2">
            <TrendingUp size={16} className="text-purple-500" />
            <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-100">Continue Reading</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            {continueReading.map((p) => {
              const story = getStory(p.storyId)
              if (!story) return null
              return (
                <Link key={p.storyId} href={`/junior/${id}/library/${p.storyId}?page=${p.currentPage}`}
                  className="shrink-0 w-36 rounded-2xl border border-purple-200/60 bg-white/80 p-3 backdrop-blur-sm hover:border-purple-400 hover:shadow-lg dark:border-zinc-700/60 dark:bg-zinc-800/80">
                  <div className="mb-2 aspect-[3/4] w-full overflow-hidden rounded-xl bg-gradient-to-br from-purple-200 to-pink-200 dark:from-purple-800 dark:to-pink-800">
                    {story.coverImage ? <img src={story.coverImage} alt={story.title} className="h-full w-full object-cover" />
                      : <div className="flex h-full items-center justify-center text-2xl">📖</div>}
                  </div>
                  <p className="text-xs font-bold text-zinc-800 dark:text-zinc-100 truncate">{story.title}</p>
                  <p className="mt-1 h-1.5 w-full rounded-full bg-purple-100 dark:bg-zinc-700 overflow-hidden">
                    <span className="block h-full rounded-full bg-purple-500" style={{ width: `${(p.currentPage / Math.max(p.totalPages, 1)) * 100}%` }} />
                  </p>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {recentlyRead.length > 0 && (
        <div className="mb-6">
          <div className="mb-3 flex items-center gap-2">
            <Clock size={16} className="text-blue-500" />
            <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-100">Recently Read</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            {recentlyRead.map((p) => {
              const story = getStory(p.storyId)
              if (!story) return null
              return (
                <Link key={`recent-${p.storyId}`} href={`/junior/${id}/library/${p.storyId}`}
                  className="shrink-0 w-28 rounded-xl border border-purple-200/60 bg-white/70 p-2 backdrop-blur-sm hover:border-purple-400 dark:border-zinc-700/60 dark:bg-zinc-800/70">
                  <div className="mb-1.5 aspect-[3/4] w-full overflow-hidden rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900">
                    {story.coverImage ? <img src={story.coverImage} alt={story.title} className="h-full w-full object-cover" />
                      : <div className="flex h-full items-center justify-center text-xl">📖</div>}
                  </div>
                  <p className="text-[10px] font-bold text-zinc-800 dark:text-zinc-100 truncate">{story.title}</p>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {bookmarks.length > 0 && (
        <div className="mb-6">
          <div className="mb-3 flex items-center gap-2">
            <Bookmark size={16} className="text-orange-500" />
            <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-100">Bookmarks</h2>
          </div>
          <div className="space-y-2">
            {bookmarks.slice(0, 5).map((b) => {
              const story = getStory(b.storyId)
              if (!story) return null
              return (
                <Link key={`bm-${b.storyId}-${b.page}`} href={`/junior/${id}/library/${b.storyId}?page=${b.page}`}
                  className="flex items-center gap-3 rounded-xl border border-purple-200/60 bg-white/70 p-3 backdrop-blur-sm hover:border-purple-400 dark:border-zinc-700/60 dark:bg-zinc-800/70">
                  <span className="text-lg">{isBookmarked(b.storyId) ? "🔖" : "📄"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100 truncate">{story.title}</p>
                    <p className="text-[10px] text-zinc-500">Page {b.page + 1}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-purple-200/60 bg-white/70 p-12 text-center backdrop-blur-sm dark:border-zinc-700/60 dark:bg-zinc-800/70 mt-4">
          <p className="text-5xl mb-3">📚</p>
          <p className="text-zinc-500">No stories found</p>
        </div>
      ) : (
        <div className="mt-4">
          <div className="mb-3 flex items-center gap-2">
            <BookOpen size={14} className="text-purple-400" />
            <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-100">
              {category === "all" ? "All Stories" : CATEGORIES.find((c) => c.id === category)?.label}
            </h2>
          </div>
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
        </div>
      )}
    </div>
  )
}
