"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Library, Search, ExternalLink } from "lucide-react"

interface ClassicBook {
  id: string
  title: string
  author: string
  description: string | null
  coverImage: string | null
  category: string
  source: string
  sourceUrl: string | null
  contentUrl: string | null
  language: string
  addedAt: string
}

const CATEGORIES = [
  { id: "all", label: "All", emoji: "📚" },
  { id: "BEDTIME", label: "Bedtime Stories", emoji: "🌙" },
  { id: "FAIRY_TALE", label: "Fairy Tales", emoji: "👑" },
  { id: "ANIMAL", label: "Animal Stories", emoji: "🐾" },
  { id: "CLASSIC_ADVENTURE", label: "Classic Adventures", emoji: "🗺️" },
  { id: "EDUCATIONAL", label: "Educational Stories", emoji: "📖" },
]

export default function ClassicLibraryPage() {
  const params = useParams()
  const [books, setBooks] = useState<ClassicBook[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const id = params.id as string

  useEffect(() => {
    const url = category === "all"
      ? "/api/classic-books"
      : `/api/classic-books?category=${category}`

    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        const list: ClassicBook[] = data.books || []
        setBooks(list)
      })
      .catch(() => setError("Failed to load classic library"))
      .finally(() => setLoading(false))
  }, [category])

  const filtered = books.filter((b) =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.author.toLowerCase().includes(search.toLowerCase()),
  )

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-400 border-t-purple-600" /></div>
  }

  if (error) {
    return <div className="mx-auto max-w-4xl p-4 md:p-8"><div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-900/20"><p className="text-red-600 dark:text-red-400 text-sm">{error}</p></div></div>
  }

  return (
    <div className="mx-auto max-w-4xl p-4 md:p-8">
      <div className="mb-6 flex items-center gap-3">
        <Library size={24} className="text-emerald-500" />
        <h1 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">Classic Library</h1>
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-medium text-emerald-600 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">Free</span>
      </div>

      <p className="mb-4 text-sm text-zinc-500">
        Timeless public-domain stories from around the world. Read online for free.
      </p>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          placeholder="Search classic books..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-purple-200/60 bg-white/70 px-9 py-2.5 text-sm text-zinc-800 placeholder:text-zinc-400 focus:border-purple-400 focus:outline-none dark:border-zinc-700/60 dark:bg-zinc-800/70 dark:text-zinc-100"
        />
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none -mx-1 px-1 mb-4">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={`flex shrink-0 items-center gap-1 rounded-xl border px-3 py-1.5 text-xs font-medium transition-all whitespace-nowrap ${
              category === cat.id
                ? "border-emerald-400 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                : "border-purple-200/60 bg-white/70 text-zinc-600 hover:border-emerald-300 dark:border-zinc-700/60 dark:bg-zinc-800/70 dark:text-zinc-400"
            }`}
          >
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-purple-200/60 bg-white/70 p-12 text-center backdrop-blur-sm dark:border-zinc-700/60 dark:bg-zinc-800/70">
          <p className="text-5xl mb-3">📚</p>
          <p className="text-zinc-500">No classic books found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((book) => (
            <div
              key={book.id}
              className="rounded-2xl border border-purple-200/60 bg-white/80 p-4 backdrop-blur-sm transition-all hover:border-emerald-300 hover:shadow-md dark:border-zinc-700/60 dark:bg-zinc-800/80"
            >
              <div className="flex items-start gap-4">
                <div className="h-20 w-14 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-amber-200 to-emerald-200 dark:from-amber-800 dark:to-emerald-800">
                  {book.coverImage ? (
                    <img src={book.coverImage} alt={book.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xl">📖</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100">{book.title}</h3>
                      <p className="text-xs text-zinc-500">{book.author}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                        Free
                      </span>
                      <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-600 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                        Public Domain
                      </span>
                    </div>
                  </div>
                  {book.description && (
                    <p className="mt-1.5 text-xs text-zinc-500 line-clamp-2">{book.description}</p>
                  )}
                  <div className="mt-2 flex items-center gap-3">
                    <span className="text-[10px] text-zinc-400">
                      {CATEGORIES.find((c) => c.id === book.category)?.emoji}{" "}
                      {CATEGORIES.find((c) => c.id === book.category)?.label || book.category}
                    </span>
                    {book.contentUrl && (
                      <a
                        href={book.contentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[10px] font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-400"
                      >
                        <ExternalLink size={10} />
                        Read Online
                      </a>
                    )}
                    {book.sourceUrl && !book.contentUrl && (
                      <a
                        href={book.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[10px] font-medium text-zinc-400 hover:text-zinc-500"
                      >
                        <ExternalLink size={10} />
                        View Source
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
