"use client"

import { useEffect, useState } from "react"
import { DailyLimitModal } from "@/components/reader/DailyLimitModal"
import { WaitUnlockModal } from "@/components/reader/WaitUnlockModal"
import { recordEpisodeAccessAction } from "@/app/actions/reading"

interface Props {
  reason: "DAILY_LIMIT" | "WAIT_TIMER" | null
  nextUnlockTime: Date | null
  chapterNumber: number
  storyId: string
}

export function ReaderAccessOverlay({ reason, nextUnlockTime, chapterNumber, storyId }: Props) {
  const [show, setShow] = useState(true)

  useEffect(() => {
    // Record that user accessed this chapter
    recordEpisodeAccessAction(storyId, chapterNumber)
  }, [storyId, chapterNumber])

  if (!show) return null

  if (reason === "DAILY_LIMIT") {
    return (
      <>
        <div className="fixed inset-0 z-[99] bg-black/80 backdrop-blur-md" />
        <DailyLimitModal open={true} onClose={() => setShow(false)} />
      </>
    )
  }

  if (reason === "WAIT_TIMER") {
    return (
      <>
        <div className="fixed inset-0 z-[99] bg-black/80 backdrop-blur-md" />
        <WaitUnlockModal
          open={true}
          onClose={() => setShow(false)}
          nextUnlockTime={nextUnlockTime}
        />
      </>
    )
  }

  return null
}
