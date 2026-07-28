"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { HeartHandshake, Heart, ChevronLeft, ChevronRight } from "lucide-react"

interface FamilyBook {
  id: string
  title: string
  content: string | null
  authorName: string
  coverImage: string | null
  message: string | null
  createdAt: string
}

export default function JuniorBookshelfPage() {
  const params = useParams()
  const id = params.id as string
  const [books, setBooks] = useState<FamilyBook[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [reading, setReading] = useState<FamilyBook | null>(null)
  const [page, setPage] = useState(0)

  useEffect(() => {
    let cancelled = false
    fetch(`/api/junior/bookshelf?juniorId=${id}`)
      .then((r) => { if (!r.ok) throw new Error("Failed to load bookshelf"); return r.json() })
      .then((data) => { if (!cancelled) setBooks(Array.isArray(data) ? data : []) })
      .catch((err) => { if (!cancelled) setError(err.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [id])

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-400 border-t-purple-600" /></div>
  }

  if (error) {
    return <div className="mx-auto max-w-3xl p-4 md:p-8"><div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-900/20"><p className="text-red-600 dark:text-red-400 text-sm">{error}</p></div></div>
  }

  if (reading) {
    const pages = reading.content
      ? reading.content.split("\n\n").filter(Boolean)
      : [""]
    const totalPages = pages.length

    return (
      <div className="mx-auto flex min-h-screen flex-col p-4 md:p-8">
        <div className="mb-4 flex items-center justify-between">
          <button onClick={() => { setReading(null); setPage(0) }}
            className="flex items-center gap-1.5 rounded-xl border border-purple-200/60 bg-white/70 px-3 py-1.5 text-xs font-medium text-zinc-600 backdrop-blur-sm dark:border-zinc-700/60 dark:bg-zinc-800/70 dark:text-zinc-400">
            <ChevronLeft size={14} />
            Back
          </button>
          <span className="text-xs text-zinc-400">{page + 1} / {totalPages}</span>
        </div>
        <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col">
          <div className="flex-1 rounded-2xl border border-purple-200/60 bg-white/80 p-6 backdrop-blur-sm dark:border-zinc-700/60 dark:bg-zinc-800/80 md:p-10">
            {page === 0 && (
              <div className="mb-4 text-center">
                <div className="mb-2 flex items-center justify-center gap-2 text-sm text-pink-500">
                  <Heart size={14} fill="currentColor" />
                  <span className="font-medium">From {reading.authorName}</span>
                  <Heart size={14} fill="currentColor" />
                </div>
                {reading.coverImage && (
                  <img src={reading.coverImage} alt={reading.title} className="mx-auto mb-3 h-40 w-32 rounded-xl object-cover shadow-md" />
                )}
                {reading.message && (
                  <p className="mb-3 text-xs italic text-zinc-500">&ldquo;{reading.message}&rdquo;</p>
                )}
              </div>
            )}
            <h2 className="mb-4 text-center text-lg font-bold text-zinc-800 dark:text-zinc-100">{reading.title}</h2>
            <div className="prose prose-sm max-w-none text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
              {pages[page] || reading.content || "A story from family."}
            </div>
          </div>
          <div className="mt-4 flex items-center justify-center gap-4">
            <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} aria-label="Previous page"
              className="rounded-xl border border-purple-200/60 bg-white/70 p-2.5 text-zinc-600 backdrop-blur-sm disabled:opacity-30 dark:border-zinc-700/60 dark:bg-zinc-800/70 dark:text-zinc-400">
              <ChevronLeft size={20} />
            </button>
            <div className="flex gap-1.5">
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i} onClick={() => setPage(i)} aria-label={`Go to page ${i + 1}`}
                  className={`h-2 rounded-full transition-all ${i === page ? "w-6 bg-pink-500" : "w-2 bg-pink-200 dark:bg-zinc-600"}`} />
              ))}
            </div>
            <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} aria-label="Next page"
              className="rounded-xl border border-purple-200/60 bg-white/70 p-2.5 text-zinc-600 backdrop-blur-sm disabled:opacity-30 dark:border-zinc-700/60 dark:bg-zinc-800/70 dark:text-zinc-400">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl p-4 md:p-8">
      <div className="mb-6 flex items-center gap-3">
        <HeartHandshake size={24} className="text-pink-500" />
        <h1 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">Family Bookshelf</h1>
      </div>

      {books.length === 0 ? (
        <div className="rounded-2xl border border-purple-200/60 bg-white/70 p-12 text-center backdrop-blur-sm dark:border-zinc-700/60 dark:bg-zinc-800/70">
          <p className="text-5xl mb-3">📚</p>
          <p className="text-zinc-500 mb-1">Your bookshelf is empty</p>
          <p className="text-xs text-zinc-400">Ask your family to share stories with you!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {books.map((book) => (
            <button key={book.id} onClick={() => setReading(book)}
              className="group rounded-2xl border border-purple-200/60 bg-white/80 p-3 text-left backdrop-blur-sm transition-all hover:border-pink-400 hover:shadow-lg dark:border-zinc-700/60 dark:bg-zinc-800/80">
              <div className="mb-2 aspect-[3/4] w-full overflow-hidden rounded-xl bg-gradient-to-br from-pink-200 to-purple-200 dark:from-pink-800 dark:to-purple-800">
                {book.coverImage ? (
                  <img src={book.coverImage} alt={book.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Heart size={32} className="text-pink-400" />
                  </div>
                )}
              </div>
              <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-100 leading-tight line-clamp-2">{book.title}</h3>
              <p className="mt-0.5 flex items-center gap-1 text-[10px] text-pink-500">
                <Heart size={10} fill="currentColor" />
                From {book.authorName}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
