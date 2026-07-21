"use client"

import { useState } from "react"
import Link from "next/link"
import { formatDate } from "@/lib/utils"
import { DailyLimitModal } from "@/components/reader/DailyLimitModal"
import { WaitUnlockModal } from "@/components/reader/WaitUnlockModal"
import { checkChapterAccessAction } from "@/app/actions/reading"
import type { RestrictionReason } from "@/app/actions/reading"

interface ChapterListProps {
  storyId: string
  chapters: { id: string; title: string; number: number; createdAt: Date }[]
  freePreviewChapters: number
  canReadAll: boolean
  isAuthor: boolean
  accessType: string
  isPremium: boolean
}

export function ChapterList({
  storyId,
  chapters,
  freePreviewChapters,
  canReadAll,
  isAuthor,
  accessType,
  isPremium,
}: ChapterListProps) {
  const isPremiumStory = accessType === "PREMIUM"
  const isFreeStory = accessType === "FREE"

  const [pendingChapter, setPendingChapter] = useState<{ id: string; number: number } | null>(null)
  const [showDailyLimit, setShowDailyLimit] = useState(false)
  const [showWaitTimer, setShowWaitTimer] = useState(false)
  const [nextUnlockTime, setNextUnlockTime] = useState<Date | null>(null)

  const handleChapterClick = async (e: React.MouseEvent, ch: { id: string; number: number }) => {
    const idx = chapters.findIndex((c) => c.id === ch.id)
    const isFree = isFreeStory || (!isPremiumStory && idx < freePreviewChapters)
    const canAccess = isAuthor || canReadAll || isFree || isPremium

    if (!canAccess) {
      e.preventDefault()
      if (isPremiumStory) {
        alert("This story is exclusive to Premium members")
      } else if (!canReadAll) {
        alert("Log in to read all chapters")
      } else {
        alert("This chapter requires Premium access")
      }
      return
    }

    // For free chapters accessible to non-premium non-author users, check reading restrictions
    if (isFree && !isPremium && !isAuthor) {
      e.preventDefault()
      setPendingChapter(ch)
      const result = await checkChapterAccessAction(storyId, ch.number)
      if (result.allowed) {
        setPendingChapter(null)
        window.location.href = `/stories/${storyId}/chapter/${ch.id}`
      } else if (result.reason === "DAILY_LIMIT") {
        setShowDailyLimit(true)
        setPendingChapter(null)
      } else if (result.reason === "WAIT_TIMER") {
        setNextUnlockTime(result.nextUnlockTime)
        setShowWaitTimer(true)
        setPendingChapter(null)
      } else {
        setPendingChapter(null)
        window.location.href = `/stories/${storyId}/chapter/${ch.id}`
      }
      return
    }

    // Already allowed — navigate normally via Link
  }

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-4 text-amber-600 dark:text-zinc-100">Chapters</h2>

      {isPremiumStory && !isAuthor && !isPremium && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-center">
          <LockClosedIcon />
          <p className="mt-2 font-semibold text-amber-700">Premium Exclusive Story</p>
          <p className="mt-1 text-sm text-zinc-600">Upgrade to Premium to read this story.</p>
          <Link
            href="/premium"
            className="mt-2 inline-block rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
          >
            Upgrade to Premium
          </Link>
        </div>
      )}

      {isFreeStory && !isAuthor && (
        <p className="mb-4 text-sm text-green-600">All chapters are free to read.</p>
      )}

      {chapters.length === 0 ? (
        <p className="text-zinc-400 text-sm">No chapters yet.</p>
      ) : (
        <div className="space-y-1">
          {chapters.map((ch, idx) => {
            const isFree = isFreeStory || (!isPremiumStory && idx < freePreviewChapters)
            const canAccess = isAuthor || canReadAll || isFree || isPremium
            return (
              <Link
                key={ch.id}
                href={
                  canAccess
                    ? `/stories/${storyId}/chapter/${ch.id}`
                    : "#"
                }
                className={`flex items-center justify-between rounded-lg border px-4 py-3 text-sm transition-colors ${
                  canAccess
                    ? "hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    : "opacity-50 cursor-not-allowed"
                }`}
                onClick={(e) => handleChapterClick(e, ch)}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-700">
                    {ch.number}
                  </span>
                  <span className="font-medium text-zinc-800 dark:text-zinc-100">
                    {ch.title}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-400">
                  {!canAccess && !isAuthor && (
                    <span className="flex items-center gap-1 text-amber-600 font-medium">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m0 0v2m0-2h2m-2 0H10m9-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      {isPremiumStory ? "Premium" : "Locked"}
                    </span>
                  )}
                  {canAccess && !isFree && !isAuthor && isPremium && (
                    <span className="text-blue-600 font-medium">Premium ✓</span>
                  )}
                  <span>{formatDate(ch.createdAt)}</span>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      <DailyLimitModal open={showDailyLimit} onClose={() => setShowDailyLimit(false)} />
      <WaitUnlockModal
        open={showWaitTimer}
        onClose={() => setShowWaitTimer(false)}
        nextUnlockTime={nextUnlockTime}
      />
    </div>
  )
}

function LockClosedIcon() {
  return (
    <svg className="mx-auto h-8 w-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  )
}
