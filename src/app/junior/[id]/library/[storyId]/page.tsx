"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, ChevronLeft, ChevronRight, Bookmark } from "lucide-react"
import { ReadToMe } from "@/components/junior/ReadToMe"

interface Story {
  id: string
  title: string
  content: string | null
  blurb: string | null
  coverImage: string | null
  author: { name: string | null }
}

export default function JuniorStoryReaderPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = params.id as string
  const storyId = params.storyId as string
  const [story, setStory] = useState<Story | null>(null)
  const [page, setPage] = useState(0)
  const [bookmarked, setBookmarked] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initialPage = parseInt(searchParams.get("page") || "0", 10)
    setPage(isNaN(initialPage) ? 0 : initialPage)
  }, [searchParams])

  useEffect(() => {
    Promise.all([
      fetch(`/api/stories/${storyId}`).then((r) => r.json()),
      fetch(`/api/junior/reading/progress?juniorId=${id}&storyId=${storyId}`).then((r) => r.json()),
      fetch(`/api/junior/reading/bookmarks?juniorId=${id}`).then((r) => r.json()),
    ])
      .then(([storyData, progressData, bookmarksData]) => {
        if (storyData.error) throw new Error(storyData.error)
        setStory(storyData)
        if (progressData && progressData.currentPage > 0 && !searchParams.get("page")) {
          setPage(progressData.currentPage)
        }
        const bms = Array.isArray(bookmarksData) ? bookmarksData : []
        setBookmarked(bms.some((b: { storyId: string }) => b.storyId === storyId))
      })
      .catch(() => router.push(`/junior/${id}/library`))
      .finally(() => setLoading(false))
  }, [storyId, id, router, searchParams])

  const saveProgress = useCallback((currentPage: number, totalPages: number) => {
    fetch("/api/junior/reading/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ juniorId: id, storyId, currentPage, totalPages }),
    }).catch(() => {})
  }, [id, storyId])

  const toggleBookmark = useCallback(async () => {
    const res = await fetch("/api/junior/reading/bookmarks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ juniorId: id, storyId, page }),
    })
    const data = await res.json()
    setBookmarked(data.removed ? false : true)
  }, [id, storyId, page])

  const goToPage = useCallback((newPage: number) => {
    setPage(newPage)
    if (story) {
      const pages = story.content ? story.content.split("\n\n").filter(Boolean) : [story.blurb || ""]
      saveProgress(newPage, pages.length)
    }
  }, [story, saveProgress])

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-400 border-t-purple-600" /></div>
  }

  if (!story) return null

  const pages = story.content
    ? story.content.split("\n\n").filter(Boolean)
    : [story.blurb || ""]
  const totalPages = pages.length
  const currentPage = pages[page] || ""

  const handlePrev = () => { if (page > 0) goToPage(page - 1) }
  const handleNext = () => { if (page < totalPages - 1) goToPage(page + 1) }

  return (
    <div className="mx-auto flex min-h-screen flex-col p-4 md:p-8">
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => router.push(`/junior/${id}/library`)}
          className="flex items-center gap-1.5 rounded-xl border border-purple-200/60 bg-white/70 px-3 py-1.5 text-xs font-medium text-zinc-600 backdrop-blur-sm hover:bg-white dark:border-zinc-700/60 dark:bg-zinc-800/70 dark:text-zinc-400"
        >
          <ArrowLeft size={14} />
          Library
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400">{page + 1} / {totalPages}</span>
          <button
            onClick={toggleBookmark}
            className={`rounded-xl border px-2.5 py-1.5 text-xs font-medium backdrop-blur-sm transition-all ${
              bookmarked
                ? "border-orange-200 bg-orange-50 text-orange-600 dark:border-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
                : "border-purple-200/60 bg-white/70 text-zinc-500 hover:bg-white dark:border-zinc-700/60 dark:bg-zinc-800/70"
            }`}
          >
            <Bookmark size={14} fill={bookmarked ? "currentColor" : "none"} />
          </button>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col">
        <div className="flex-1 rounded-2xl border border-purple-200/60 bg-white/80 p-6 backdrop-blur-sm dark:border-zinc-700/60 dark:bg-zinc-800/80 md:p-10">
          {page === 0 && story.coverImage && (
            <div className="mb-4 flex justify-center">
              <img src={story.coverImage} alt={story.title} className="h-48 w-36 rounded-xl object-cover shadow-md" />
            </div>
          )}
          <h2 className="mb-4 text-center text-lg font-bold text-zinc-800 dark:text-zinc-100">
            {story.title}
          </h2>
          <div className="prose prose-sm max-w-none text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
            {currentPage}
          </div>
        </div>

        <div className="mt-3">
          <ReadToMe text={currentPage} />
        </div>

        <div className="mt-4 flex items-center justify-center gap-4">
          <button onClick={handlePrev} disabled={page === 0}
            className="rounded-xl border border-purple-200/60 bg-white/70 p-2.5 text-zinc-600 backdrop-blur-sm hover:bg-white disabled:opacity-30 dark:border-zinc-700/60 dark:bg-zinc-800/70 dark:text-zinc-400">
            <ChevronLeft size={20} />
          </button>
          <div className="flex gap-1.5">
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i} onClick={() => goToPage(i)}
                className={`h-2 rounded-full transition-all ${
                  i === page ? "w-6 bg-purple-500" : "w-2 bg-purple-200 dark:bg-zinc-600"
                }`} />
            ))}
          </div>
          <button onClick={handleNext} disabled={page >= totalPages - 1}
            className="rounded-xl border border-purple-200/60 bg-white/70 p-2.5 text-zinc-600 backdrop-blur-sm hover:bg-white disabled:opacity-30 dark:border-zinc-700/60 dark:bg-zinc-800/70 dark:text-zinc-400">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}
