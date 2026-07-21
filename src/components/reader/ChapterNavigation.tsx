"use client"

import Link from "next/link"

export function ChapterNavigation({
  storyId,
  prevChapter,
  nextChapter,
  isLastFreeChapter,
}: {
  storyId: string
  prevChapter: { id: string; number: number; title: string } | null
  nextChapter: { id: string; number: number; title: string } | null
  isLastFreeChapter: boolean
}) {
  if (isLastFreeChapter && nextChapter) {
    return null
  }

  return (
    <div className="mt-16 mb-8">
      <div style={{ borderTop: "1px solid #EAEAEA" }} className="mb-8" />

      <div className="flex items-center justify-between gap-3">
        {prevChapter ? (
          <Link
            href={`/stories/${storyId}/chapter/${prevChapter.id}`}
            className="group flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 transition-all dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Previous</span>
            <span className="hidden sm:inline text-zinc-400 dark:text-zinc-500 truncate max-w-[120px]">
              &mdash; {prevChapter.title}
            </span>
          </Link>
        ) : (
          <div />
        )}

        {nextChapter ? (
          <Link
            href={`/stories/${storyId}/chapter/${nextChapter.id}`}
            className="group flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-amber-600 hover:bg-amber-50 hover:text-amber-700 transition-all dark:text-amber-400 dark:hover:bg-amber-900/20 dark:hover:text-amber-300"
          >
            <span className="hidden sm:inline">Next</span>
            <span className="hidden sm:inline text-amber-400 dark:text-amber-500 truncate max-w-[120px]">
              &mdash; {nextChapter.title}
            </span>
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ) : (
          <div />
        )}
      </div>

      <div className="mt-6 text-center">
        <Link
          href={"/stories/" + storyId}
          className="text-sm text-zinc-400 hover:text-zinc-600 transition-colors dark:text-zinc-500 dark:hover:text-zinc-300"
        >
          Back to story overview
        </Link>
      </div>
    </div>
  )
}
