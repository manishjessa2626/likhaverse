"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react"

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
  const id = params.id as string
  const storyId = params.storyId as string
  const [story, setStory] = useState<Story | null>(null)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/stories/${storyId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error)
        setStory(data)
      })
      .catch(() => router.push(`/junior/${id}/library`))
      .finally(() => setLoading(false))
  }, [storyId, id, router])

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-400 border-t-purple-600" /></div>
  }

  if (!story) return null

  const pages = story.content
    ? story.content.split("\n\n").filter(Boolean)
    : [story.blurb || ""]
  const totalPages = pages.length
  const currentPage = pages[page] || ""

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
        <span className="text-xs text-zinc-400">{page + 1} / {totalPages}</span>
      </div>

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col">
        <div className="flex-1 rounded-2xl border border-purple-200/60 bg-white/80 p-6 backdrop-blur-sm dark:border-zinc-700/60 dark:bg-zinc-800/80 md:p-10">
          {page === 0 && story.coverImage && (
            <div className="mb-4 flex justify-center">
              <img
                src={story.coverImage}
                alt={story.title}
                className="h-48 w-36 rounded-xl object-cover shadow-md"
              />
            </div>
          )}
          <h2 className="mb-4 text-center text-lg font-bold text-zinc-800 dark:text-zinc-100">
            {story.title}
          </h2>
          <div className="prose prose-sm max-w-none text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
            {currentPage}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center gap-4">
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="rounded-xl border border-purple-200/60 bg-white/70 p-2.5 text-zinc-600 backdrop-blur-sm hover:bg-white disabled:opacity-30 dark:border-zinc-700/60 dark:bg-zinc-800/70 dark:text-zinc-400"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex gap-1.5">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`h-2 w-2 rounded-full transition-all ${
                  i === page ? "w-6 bg-purple-500" : "bg-purple-200 dark:bg-zinc-600"
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
            disabled={page >= totalPages - 1}
            className="rounded-xl border border-purple-200/60 bg-white/70 p-2.5 text-zinc-600 backdrop-blur-sm hover:bg-white disabled:opacity-30 dark:border-zinc-700/60 dark:bg-zinc-800/70 dark:text-zinc-400"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}
