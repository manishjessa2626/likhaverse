"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useReadingSettings } from "@/lib/reading/ReadingSettingsContext"

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

export function PageFlipReader({ content }: { content: string }) {
  const { settings } = useReadingSettings()
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

  const totalPages = pages.length
  const pageText = pages[currentPage]?.join("\n\n") ?? ""
  const nextPageText = currentPage < totalPages - 1 ? pages[currentPage + 1]?.join("\n\n") ?? "" : null
  const prevPageText = currentPage > 0 ? pages[currentPage - 1]?.join("\n\n") ?? "" : null

  const isDark = settings.theme === "dark"
  const pageColor = isDark ? "#2A2A2A" : "#F5F0E8"
  const textColor = isDark ? "#D4D4D4" : "#1A1A1A"
  const mutedColor = isDark ? "#666" : "#999"
  const spineColor = isDark ? "#1E1E1E" : "#E8E0D0"
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
          backgroundColor: isDark ? "#1A1A1A" : "#E8E0D0",
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

        {/* Page pages stack edge (right side) */}
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

        {/* Current page */}
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
          {/* Page content */}
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

          {/* Flip shadow overlay */}
          {isFlipping && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: flipState === "forward"
                  ? `linear-gradient(to right, rgba(0,0,0,0.08), transparent 60%)`
                  : `linear-gradient(to left, rgba(0,0,0,0.08), transparent 60%)`,
              }}
            />
          )}
        </div>

        {/* Next page shown underneath during flip */}
        {isFlipping && flipState === "forward" && nextPageText && (
          <div
            className="absolute inset-0 z-20 flex"
            style={{
              margin: "0 18px",
              backgroundColor: pageColor,
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
                  opacity: 0.7,
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
          Prev
        </button>

        <span className="text-xs font-medium" style={{ color: mutedColor }}>
          {currentPage + 1} — {totalPages}
        </span>

        <button
          onClick={(e) => { e.stopPropagation(); goNext() }}
          disabled={currentPage >= totalPages - 1 || isFlipping}
          className="flex items-center gap-1 rounded px-3 py-1.5 text-xs font-medium disabled:opacity-20 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        >
          Next
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
