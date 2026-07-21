"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { getEpisodeList } from "@/app/actions/reading"
import type { RestrictionReason } from "@/app/actions/reading"

interface Episode {
  id: string
  number: number
  title: string
  isFree: boolean
  canAccess: boolean
  isRead: boolean
  restrictionReason?: RestrictionReason
}

export function EpisodeListDrawer({
  storyId,
  currentChapterId,
  storyTitle,
  open: initialOpen,
  onOpenChange,
}: {
  storyId: string
  currentChapterId: string
  storyTitle: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!initialOpen) return
    setLoading(true)
    getEpisodeList(storyId)
      .then(setEpisodes)
      .finally(() => setLoading(false))
  }, [storyId, initialOpen])

  function restrictionLabel(ep: Episode): string {
    if (ep.restrictionReason === "DAILY_LIMIT") return "Daily limit"
    if (ep.restrictionReason === "WAIT_TIMER") return "Timed unlock"
    return "Premium only"
  }

  return (
    <>
      {initialOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => onOpenChange(false)}
        />
      )}

      <div
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-sm bg-white dark:bg-zinc-900 shadow-2xl transform transition-transform duration-300 ease-in-out ${
          initialOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="font-semibold text-zinc-800 dark:text-zinc-100 truncate">
            {storyTitle}
          </h2>
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-lg p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto h-[calc(100%-60px)]">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-amber-500" />
            </div>
          ) : episodes.length === 0 ? (
            <div className="text-center py-20 text-zinc-400 text-sm">
              No episodes found.
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {episodes.map((ep) => {
                const isCurrent = ep.id === currentChapterId
                return (
                  <div key={ep.id} className="px-4 py-3">
                    {ep.canAccess ? (
                      <Link
                        href={`/stories/${storyId}/chapter/${ep.id}`}
                        className={`flex items-center gap-3 py-1 ${
                          isCurrent
                            ? "text-amber-700 dark:text-amber-400"
                            : "text-zinc-700 dark:text-zinc-300"
                        } hover:text-amber-600 dark:hover:text-amber-400 transition-colors`}
                      >
                        <span className="shrink-0 w-5 text-center">
                          {ep.isRead ? (
                            <svg className="w-4 h-4 text-emerald-500 inline" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <span className="text-xs text-zinc-300 dark:text-zinc-600">
                              {ep.number}
                            </span>
                          )}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm truncate ${isCurrent ? "font-semibold" : ""}`}>
                            Episode {ep.number} — {ep.title}
                          </p>
                          {!ep.isFree && (
                            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                              Premium
                            </span>
                          )}
                        </div>
                        {isCurrent && (
                          <span className="shrink-0 w-2 h-2 rounded-full bg-amber-500" />
                        )}
                      </Link>
                    ) : (
                      <div className="flex items-center gap-3 py-1 text-zinc-400 dark:text-zinc-600 cursor-default">
                        <span className="shrink-0 w-5 text-center text-base">🔒</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">
                            Episode {ep.number} — {ep.title}
                          </p>
                          <span className="text-xs text-amber-600 dark:text-amber-500 font-medium">
                            {restrictionLabel(ep)}
                          </span>
                        </div>
                        <Link
                          href="/premium"
                          className="shrink-0 text-xs font-medium text-amber-600 dark:text-amber-400 hover:underline"
                        >
                          Unlock
                        </Link>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
