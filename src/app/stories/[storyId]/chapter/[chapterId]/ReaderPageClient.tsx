"use client"

import { useState, useEffect } from "react"
import { EpisodeListDrawer } from "@/components/reader/EpisodeListDrawer"
import { usePathname } from "next/navigation"

export function ReaderPageClient({
  storyId,
  storyTitle,
  chapterId,
  children,
}: {
  storyId: string
  storyTitle: string
  chapterId: string
  children: React.ReactNode
}) {
  const [episodeListOpen, setEpisodeListOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [chapterId, pathname])

  return (
    <>
      <EpisodeListDrawer
        storyId={storyId}
        storyTitle={storyTitle}
        currentChapterId={chapterId}
        open={episodeListOpen}
        onOpenChange={setEpisodeListOpen}
      />

      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
        <button
          onClick={() => setEpisodeListOpen(true)}
          className="mb-6 inline-flex items-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
          </svg>
          Episode List
        </button>

        {children}
      </div>
    </>
  )
}
