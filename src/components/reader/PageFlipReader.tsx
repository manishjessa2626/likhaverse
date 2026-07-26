"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useReadingSettings } from "@/lib/reading/ReadingSettingsContext"

function estimateCharsPerPage(fontSize: number): number {
  const viewportH = typeof window !== "undefined" ? window.innerHeight : 800
  const linesPerPage = Math.floor((viewportH - 200) / (fontSize * 1.8))
  const charsPerLine = fontSize <= 17 ? 75 : fontSize <= 19 ? 68 : 60
  return linesPerPage * charsPerLine
}

function splitIntoPages(paragraphs: string[], charsPerPage: number): string[][] {
  const pages: string[][] = []
  let current: string[] = []
  let count = 0

  for (const p of paragraphs) {
    if (count + p.length > charsPerPage && current.length > 0) {
      pages.push(current)
      current = [p]
      count = p.length
    } else {
      current.push(p)
      count += p.length
    }
  }
  if (current.length > 0) pages.push(current)
  return pages
}

export function PageFlipReader({ content }: { content: string }) {
  const { settings } = useReadingSettings()
  const [currentPage, setCurrentPage] = useState(0)
  const [flipping, setFlipping] = useState<"next" | "prev" | null>(null)
  const [pages, setPages] = useState<string[][]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  const fontFamily = settings.fontStyle === "serif"
    ? "Georgia, 'Times New Roman', serif"
    : "var(--font-sans, Inter, Arial, sans-serif)"

  const lineHeight = settings.lineSpacing === "relaxed" ? 2.0 : 1.85

  useEffect(() => {
    const paragraphs = content.split(/\n\s*\n/).filter(Boolean)
    const cpp = estimateCharsPerPage(settings.fontSize)
    setPages(splitIntoPages(paragraphs, cpp))
    setCurrentPage(0)
  }, [content, settings.fontSize])

  const goNext = useCallback(() => {
    if (currentPage >= pages.length - 1 || flipping) return
    setFlipping("next")
    setTimeout(() => {
      setCurrentPage((p) => p + 1)
      setFlipping(null)
    }, 400)
  }, [currentPage, pages.length, flipping])

  const goPrev = useCallback(() => {
    if (currentPage <= 0 || flipping) return
    setFlipping("prev")
    setTimeout(() => {
      setCurrentPage((p) => p - 1)
      setFlipping(null)
    }, 400)
  }, [currentPage, flipping])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault()
        goNext()
      }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault()
        goPrev()
      }
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [goNext, goPrev])

  const handleClick = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = e.clientX - rect.left
    const third = rect.width / 3
    if (x < third) goPrev()
    else if (x > rect.width - third) goNext()
  }

  if (pages.length === 0) {
    return (
      <div
        className="mx-auto px-4 sm:px-6 py-16 animate-fadeIn"
        style={{
          maxWidth: "680px",
          fontFamily,
          fontSize: `${settings.fontSize}px`,
          lineHeight,
          whiteSpace: "pre-wrap",
        }}
      >
        {content}
      </div>
    )
  }

  const totalPages = pages.length
  const pageText = pages[currentPage]?.join("\n\n") ?? ""

  const bgColor = settings.theme === "dark" ? "#191919" : "#FAF9F6"
  const textColor = settings.theme === "dark" ? "#EDEDED" : "#2C2C2C"

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      className="relative mx-auto select-none cursor-pointer min-h-[70vh]"
      style={{ maxWidth: "680px" }}
    >
      <div className="relative flex items-center justify-center" style={{ minHeight: "calc(100vh - 200px)" }}>
        <div
          className="w-full px-4 sm:px-6 py-8 rounded-lg transition-all duration-300"
          style={{
            fontFamily,
            fontSize: `${settings.fontSize}px`,
            lineHeight,
            color: textColor,
            backgroundColor: bgColor,
            boxShadow: flipping
              ? "0 4px 24px rgba(0,0,0,0.15)"
              : "0 2px 12px rgba(0,0,0,0.08)",
            transform: flipping === "next"
              ? "perspective(1200px) rotateY(-8deg) scale(0.98)"
              : flipping === "prev"
              ? "perspective(1200px) rotateY(8deg) scale(0.98)"
              : "perspective(1200px) rotateY(0deg) scale(1)",
            transformOrigin: flipping === "next" ? "left center" : "right center",
            transition: "transform 0.35s ease, box-shadow 0.35s ease",
          }}
        >
          <div
            className="animate-fadeIn"
            style={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {pageText}
          </div>
        </div>
      </div>

      <div
        className="flex items-center justify-between px-4 py-4"
        style={{ color: textColor }}
      >
        <button
          onClick={(e) => { e.stopPropagation(); goPrev() }}
          disabled={currentPage <= 0}
          className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium disabled:opacity-30 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        >
          <ChevronLeft size={16} />
          Prev
        </button>

        <span className="text-xs font-medium opacity-60">
          {currentPage + 1} / {totalPages}
        </span>

        <button
          onClick={(e) => { e.stopPropagation(); goNext() }}
          disabled={currentPage >= totalPages - 1}
          className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium disabled:opacity-30 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
