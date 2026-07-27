"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useReadingSettings } from "@/lib/reading/ReadingSettingsContext"
import { getReaderDarkTheme } from "@/lib/reading/genre-themes"
import { saveReadingProgress } from "@/app/actions/reading"

function estimateCharsPerPage(fontSize: number): number {
  const viewportH = typeof window !== "undefined" ? window.innerHeight : 800
  const linesPerPage = Math.floor((viewportH - 220) / (fontSize * 1.85))
  const charsPerLine = fontSize <= 17 ? 72 : fontSize <= 19 ? 64 : 56
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

export function PageFlipReader({ content, coverUrl, storyTitle, authorName, tags, storyId, chapterId }: { content: string; coverUrl?: string; storyTitle?: string; authorName?: string; tags?: string | null; storyId?: string; chapterId?: string }) {
  const { settings } = useReadingSettings()
  const genreTheme = settings.theme === "dark" ? getReaderDarkTheme(tags ?? null) : null
  const hasCover = !!(coverUrl || storyTitle)
  const [currentPage, setCurrentPage] = useState(0)
  const [flipState, setFlipState] = useState<"idle" | "forward" | "backward">("idle")
  const [pages, setPages] = useState<string[][]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const animRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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
    if (currentPage >= pages.length - 1 || flipState !== "idle") return
    setFlipState("forward")
    animRef.current = setTimeout(() => {
      setCurrentPage((p) => p + 1)
      setFlipState("idle")
    }, 500)
  }, [currentPage, pages.length, flipState])

  const goPrev = useCallback(() => {
    if (currentPage <= 0 || flipState !== "idle") return
    setFlipState("backward")
    animRef.current = setTimeout(() => {
      setCurrentPage((p) => p - 1)
      setFlipState("idle")
    }, 500)
  }, [currentPage, flipState])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault(); goNext()
      }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault(); goPrev()
      }
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [goNext, goPrev])

  useEffect(() => {
    return () => { if (animRef.current) clearTimeout(animRef.current) }
  }, [])

  const handleClick = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = e.clientX - rect.left
    const third = rect.width / 3
    if (x < third) goPrev()
    else if (x > rect.width - third) goNext()
  }

  const totalPages = hasCover ? pages.length + 1 : pages.length
  const lastSavedPctRef = useRef(0)
  const progressPct = totalPages > 1 ? Math.round((currentPage / (totalPages - 1)) * 100) : 0
  useEffect(() => {
    if (!storyId || !chapterId) return
    const pct = currentPage === 0 ? 0 : progressPct
    if (Math.abs(pct - lastSavedPctRef.current) >= 10) {
      lastSavedPctRef.current = pct
      saveReadingProgress(storyId, chapterId, pct)
    }
  }, [currentPage, storyId, chapterId, progressPct])

  if (pages.length === 0) {
    return (
      <div className="mx-auto px-4 sm:px-6 py-16" style={{ maxWidth: "680px" }}>
        <div
          className="leading-relaxed tracking-wide"
          style={{
            fontFamily,
            fontSize: `${settings.fontSize}px`,
            lineHeight,
            whiteSpace: "pre-wrap",
          }}
        >
          {content}
        </div>
      </div>
    )
  }

  const isCoverPage = hasCover && currentPage === 0
  const contentPageIndex = hasCover ? currentPage - 1 : currentPage
  const pageText = !isCoverPage ? pages[contentPageIndex]?.join("\n\n") ?? "" : ""
  const nextContentIdx = hasCover
    ? currentPage === 0 ? 0 : contentPageIndex + 1
    : contentPageIndex + 1
  const nextPageText = currentPage < totalPages - 1
    ? (hasCover && currentPage === 0 ? pages[0]?.join("\n\n") : pages[nextContentIdx]?.join("\n\n")) ?? null
    : null

  const isDark = settings.theme === "dark"
  const pageColor = genreTheme ? genreTheme.page : isDark ? "#2A2A2A" : "#F5F0E8"
  const textColor = genreTheme ? genreTheme.text : isDark ? "#D4D4D4" : "#1A1A1A"
  const mutedColor = isDark ? "#666" : "#999"
  const spineColor = genreTheme ? genreTheme.spine : isDark ? "#1E1E1E" : "#E8E0D0"
  const shadowColor = isDark ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.12)"

  const isFlipping = flipState !== "idle"

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      className="relative mx-auto select-none cursor-pointer"
      style={{ maxWidth: "700px" }}
    >
      {/* Book container */}
      <div
        className="relative overflow-hidden rounded-sm"
        style={{
          minHeight: "calc(100vh - 180px)",
          backgroundColor: genreTheme ? genreTheme.bg : isDark ? "#1A1A1A" : "#E8E0D0",
          boxShadow: `0 4px 40px ${shadowColor}`,
        }}
      >
        {/* Spine gradient */}
        <div
          className="absolute top-0 bottom-0 left-0 z-10 w-8"
          style={{
            background: `linear-gradient(to right, ${spineColor}, transparent)`,
          }}
        />

        {/* Page stack edge (right side) */}
        {currentPage < totalPages - 1 && (
          <div
            className="absolute top-2 bottom-2 z-20"
            style={{
              right: "3px",
              width: "4px",
              background: isDark ? "#3A3A3A" : "#EDE5D8",
              borderRadius: "1px",
              boxShadow: `-1px 0 ${shadowColor}`,
            }}
          />
        )}
        {currentPage < totalPages - 2 && (
          <div
            className="absolute top-1 bottom-1 z-10"
            style={{
              right: "7px",
              width: "3px",
              background: isDark ? "#333" : "#F0E8DC",
              borderRadius: "1px",
              boxShadow: `-1px 0 ${shadowColor}`,
            }}
          />
        )}

        {/* Book shadow on the right edge */}
        <div
          className="absolute top-0 bottom-0 right-0 z-10 w-6 pointer-events-none"
          style={{
            background: `linear-gradient(to left, ${shadowColor}, transparent)`,
          }}
        />

        {/* Current page — Book Cover */}
        {isCoverPage ? (
          <div
            className="relative z-30 flex flex-col"
            style={{
              minHeight: "calc(100vh - 180px)",
              backgroundColor: genreTheme ? genreTheme.coverBg : isDark ? "#1E1A2E" : "#1A1A2E",
              margin: "0 18px",
              transform: isFlipping && flipState === "forward"
                ? "perspective(1800px) rotateY(-12deg) scale(0.97)"
                : "perspective(1800px) rotateY(0deg) scale(1)",
              transformOrigin: "left center",
              transition: "transform 0.45s cubic-bezier(0.22, 0.61, 0.36, 1)",
            }}
          >
            {coverUrl ? (
              <>
                <img src={coverUrl} alt={storyTitle ?? ""} className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              </>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-violet-800 via-purple-900 to-indigo-950" />
            )}
            <div className="absolute inset-0 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1),inset_3px_0_12px_rgba(0,0,0,0.15)] pointer-events-none" />
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-r from-black/25 to-transparent pointer-events-none" />
            <div className="relative z-10 mt-auto px-8 pb-12 text-center">
              <h1
                className="text-3xl font-black tracking-tight text-white sm:text-4xl drop-shadow-xl"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              >
                {storyTitle}
              </h1>
              {authorName && (
                <p className="mt-3 text-sm text-white/70">by {authorName}</p>
              )}
              <div className="mx-auto mt-8 h-px w-12 bg-white/20" />
              <p className="mt-5 text-[10px] uppercase tracking-[0.25em] text-white/40">
                LikhaVerse
              </p>
            </div>
            {isFlipping && (
              <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(to right, rgba(0,0,0,0.15), transparent 60%)" }} />
            )}
          </div>
        ) : (
          /* Current page — Content */
          <div
            className="relative z-30 flex flex-col"
            style={{
              minHeight: "calc(100vh - 180px)",
              backgroundColor: pageColor,
              margin: "0 18px",
              transform: isFlipping
                ? flipState === "forward"
                  ? "perspective(1800px) rotateY(-12deg) scale(0.97)"
                  : "perspective(1800px) rotateY(12deg) scale(0.97)"
                : "perspective(1800px) rotateY(0deg) scale(1)",
              transformOrigin: flipState === "forward" ? "left center" : "right center",
              transition: isFlipping
                ? "transform 0.45s cubic-bezier(0.22, 0.61, 0.36, 1), box-shadow 0.45s ease"
                : "transform 0.35s ease, box-shadow 0.35s ease",
              boxShadow: isFlipping
                ? flipState === "forward"
                  ? `-8px 0 24px ${shadowColor}`
                  : `8px 0 24px ${shadowColor}`
                : `0 1px 6px ${shadowColor.replace("0.", "0.06")}`,
            }}
          >
            <div className="flex-1 px-6 sm:px-10 py-10 overflow-y-auto">
              <div
                className="leading-relaxed tracking-wide"
                style={{
                  fontFamily,
                  fontSize: `${settings.fontSize}px`,
                  lineHeight,
                  color: textColor,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  opacity: isFlipping ? 0.6 : 1,
                  transition: "opacity 0.2s ease",
                }}
              >
                {pageText}
              </div>
            </div>
            {isFlipping && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: flipState === "forward"
                    ? "linear-gradient(to right, rgba(0,0,0,0.08), transparent 60%)"
                    : "linear-gradient(to left, rgba(0,0,0,0.08), transparent 60%)",
                }}
              />
            )}
          </div>
        )}

        {/* Next page underneath during flip */}
        {isFlipping && flipState === "forward" && nextPageText && !isCoverPage && (
          <div
            className="absolute inset-0 z-20 flex"
            style={{ margin: "0 18px", backgroundColor: pageColor }}
          >
            <div className="flex-1 px-6 sm:px-10 py-10 overflow-y-auto">
              <div
                className="leading-relaxed tracking-wide"
                style={{
                  fontFamily, fontSize: `${settings.fontSize}px`, lineHeight,
                  color: textColor, whiteSpace: "pre-wrap", wordBreak: "break-word", opacity: 0.7,
                }}
              >
                {nextPageText}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between px-2 py-3" style={{ color: textColor }}>
        <button
          onClick={(e) => { e.stopPropagation(); goPrev() }}
          disabled={currentPage <= 0 || isFlipping}
          className="flex items-center gap-1 rounded px-3 py-1.5 text-xs font-medium disabled:opacity-20 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        >
          <ChevronLeft size={14} />
          {isCoverPage ? "Close" : "Prev"}
        </button>

        <span className="text-xs font-medium" style={{ color: mutedColor }}>
          {isCoverPage ? "Cover" : `${currentPage} — ${totalPages - 1}`}
        </span>

        <button
          onClick={(e) => { e.stopPropagation(); goNext() }}
          disabled={currentPage >= totalPages - 1 || isFlipping}
          className="flex items-center gap-1 rounded px-3 py-1.5 text-xs font-medium disabled:opacity-20 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        >
          {isCoverPage ? "Open" : "Next"}
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Tip */}
      {totalPages > 1 && (
        <p className="text-center text-[10px] pb-4" style={{ color: mutedColor }}>
          Tap left or right side to turn pages · Use ← → keys
        </p>
      )}
    </div>
  )
}
