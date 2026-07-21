"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"

interface StoryResult {
  id: string
  title: string
  cover: string | null
  author: { id: string; name: string }
}

interface AuthorResult {
  id: string
  name: string
  avatar: string | null
  role: string
}

interface SearchResults {
  stories: StoryResult[]
  authors: AuthorResult[]
}

export default function SearchBar() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResults | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const activeRef = useRef(false)

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults(null)
      setIsOpen(false)
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
      if (!res.ok) throw new Error("Search failed")
      const data: SearchResults = await res.json()
      setResults(data)
      setIsOpen(true)
    } catch {
      setResults(null)
    } finally {
      setLoading(false)
    }
  }, [])

  function handleChange(value: string) {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (value.length < 2) {
      setResults(null)
      setIsOpen(false)
      return
    }
    debounceRef.current = setTimeout(() => doSearch(value), 250)
  }

  function handleClear() {
    setQuery("")
    setResults(null)
    setIsOpen(false)
    inputRef.current?.focus()
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      setIsOpen(false)
      inputRef.current?.blur()
    }
    if (e.key === "Enter" && query.length >= 2) {
      setIsOpen(false)
      router.push(`/stories?q=${encodeURIComponent(query)}`)
    }
  }

  function handleNavigate() {
    setIsOpen(false)
    setQuery("")
    setResults(null)
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (results && results.stories.length > 0 && query.length >= 2 && !activeRef.current) {
      activeRef.current = true
    }
  }, [results, query])

  const hasResults =
    results && (results.stories.length > 0 || results.authors.length > 0)
  const totalResults =
    (results?.stories.length ?? 0) + (results?.authors.length ?? 0)

  return (
    <div className="relative">
      <div className="relative flex items-center">
        <Search size={14} className="pointer-events-none absolute left-3 text-zinc-500" />
        <input
          ref={inputRef}
          type="text"
          inputMode="search"
          placeholder="Search stories..."
          value={query}
          autoComplete="off"
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results && (results.stories.length > 0 || results.authors.length > 0)) {
              setIsOpen(true)
            }
          }}
          className="w-44 appearance-none rounded-lg border border-zinc-700 bg-zinc-800/50 pl-8 pr-8 py-1.5 text-sm text-zinc-100 placeholder-zinc-500 transition-all focus:w-60 focus:border-zinc-600 focus:bg-zinc-800 focus:outline-none"
        />

        {loading && (
          <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
            <svg
              className="h-4 w-4 animate-spin text-zinc-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        )}

        {query.length > 0 && !loading && (
          <button
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
            aria-label="Clear search"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 top-full z-50 mt-1 w-80 rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
        >
          {!hasResults ? (
            <div className="px-4 py-6 text-center text-sm text-zinc-400">
              No results found
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto py-2">
              {results!.stories.length > 0 && (
                <div>
                  <p className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Stories
                  </p>
                  {results!.stories.map((story) => (
                    <Link
                      key={story.id}
                      href={"/stories/" + story.id}
                      onClick={handleNavigate}
                      className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-gradient-to-br from-blue-100 to-purple-100 text-xs font-bold text-zinc-500 dark:from-blue-900 dark:to-purple-900 dark:text-zinc-400">
                        {story.cover ? (
                          <img
                            src={story.cover}
                            alt=""
                            className="h-full w-full rounded object-cover"
                          />
                        ) : (
                          story.title.charAt(0)
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-zinc-900 dark:text-zinc-100">
                          {story.title}
                        </p>
                        <p className="truncate text-xs text-zinc-400">
                          by {story.author.name}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {results!.authors.length > 0 && (
                <div>
                  <p className="border-t border-zinc-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:border-zinc-800">
                    Authors
                  </p>
                  {results!.authors.map((author) => (
                    <Link
                      key={author.id}
                      href={"/stories?author=" + encodeURIComponent(author.name)}
                      onClick={handleNavigate}
                      className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-emerald-100 text-xs font-bold text-amber-700 dark:from-amber-900 dark:to-emerald-900 dark:text-amber-300">
                        {author.avatar ? (
                          <img
                            src={author.avatar}
                            alt=""
                            className="h-full w-full rounded-full object-cover"
                          />
                        ) : (
                          author.name.charAt(0)
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-zinc-900 dark:text-zinc-100">
                          {author.name}
                        </p>
                        <p className="truncate text-xs text-zinc-400">
                          {author.role === "SUPER_ADMIN"
                            ? "Founder"
                            : author.role === "PREMIUM_CREATOR"
                              ? "Premium Creator"
                              : "Author"}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {totalResults >= 20 && (
                <Link
                  href={"/stories?q=" + encodeURIComponent(query)}
                  onClick={handleNavigate}
                  className="block border-t border-zinc-100 px-3 py-2 text-center text-xs font-medium text-blue-600 hover:bg-zinc-50 dark:border-zinc-800 dark:text-blue-400 dark:hover:bg-zinc-800"
                >
                  View all results
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
