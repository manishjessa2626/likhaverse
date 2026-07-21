"use client"

import { useReadingSettings } from "@/lib/reading/ReadingSettingsContext"

export function ChapterHeader({
  storyTitle,
  chapterNumber,
  totalChapters,
  chapterTitle,
  wordCount,
}: {
  storyTitle: string
  chapterNumber: number
  totalChapters: number
  chapterTitle: string
  wordCount: number
}) {
  return (
    <header className="mb-10 text-center">
      <p
        className="text-xs uppercase tracking-[0.15em] font-medium mb-4"
        style={{ color: "#6B6B6B" }}
      >
        Episode {chapterNumber} of {totalChapters}
      </p>

      <h1
        className="font-semibold leading-tight mb-3"
        style={{
          fontSize: "26px",
          color: "inherit",
          fontFamily: "Georgia, 'Times New Roman', serif",
        }}
      >
        {chapterTitle}
      </h1>

      <p style={{ fontSize: "13px", color: "#6B6B6B" }}>
        {wordCount.toLocaleString()} words
      </p>

      <div className="mt-8" style={{ borderTop: "1px solid #EAEAEA" }} />
    </header>
  )
}
