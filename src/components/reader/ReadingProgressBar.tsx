"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { saveReadingProgress } from "@/app/actions/reading"

export function ReadingProgressBar({
  storyId,
  chapterId,
  initialScroll,
}: {
  storyId: string
  chapterId: string
  initialScroll: number | null
}) {
  const [progress, setProgress] = useState(initialScroll ?? 0)
  const [visible, setVisible] = useState(false)
  const savedRef = useRef(initialScroll ?? 0)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const save = useCallback(
    (scrollTop: number, scrollHeight: number, clientHeight: number) => {
      const pct = Math.min(100, Math.max(0, (scrollTop / (scrollHeight - clientHeight)) * 100))
      setProgress(pct)

      if (Math.abs(pct - savedRef.current) > 1) {
        if (debounceRef.current) clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => {
          savedRef.current = pct
          saveReadingProgress(storyId, chapterId, pct)
        }, 2000)
      }
    },
    [storyId, chapterId],
  )

  useEffect(() => {
    const el = document.documentElement
    const handleScroll = () => {
      save(el.scrollTop, el.scrollHeight, el.clientHeight)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()

    const timer = setTimeout(() => setVisible(true), 100)
    return () => {
      window.removeEventListener("scroll", handleScroll)
      if (debounceRef.current) clearTimeout(debounceRef.current)
      clearTimeout(timer)
    }
  }, [save])

  useEffect(() => {
    if (initialScroll && initialScroll > 1 && initialScroll < 99) {
      const el = document.documentElement
      const target = (initialScroll / 100) * (el.scrollHeight - el.clientHeight)
      window.scrollTo(0, target)
    }
  }, [initialScroll])

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 h-1 bg-zinc-200 dark:bg-zinc-700 transition-opacity duration-500 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
