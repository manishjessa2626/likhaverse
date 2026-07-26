"use client"

import { useState, useEffect, useCallback, type ReactNode } from "react"
import Link from "next/link"
import { ArrowLeft, Bookmark, List, Type as TypeIcon, Book, ScrollText, Headphones } from "lucide-react"
import { ReadingSettingsProvider, useReadingSettings } from "@/lib/reading/ReadingSettingsContext"
import { NarrationProvider, useNarration } from "@/lib/reading/NarrationContext"
import { EpisodeListDrawer } from "./EpisodeListDrawer"
import { ReadingSettingsPanel } from "./ReadingSettingsPanel"
import { PageFlipReader } from "./PageFlipReader"
import { NarratorBar } from "./NarratorBar"
import { CinematicPlayer } from "./CinematicPlayer"
import { ReadingProgressBar } from "./ReadingProgressBar"
import { getReaderDarkTheme } from "@/lib/reading/genre-themes"

function TopBar({
  storyId,
  storyTitle,
  chapterId,
  initialSaved,
  onOpenEpisodeList,
  onOpenSettings,
  onNarrate,
  isNarrating,
}: {
  storyId: string
  storyTitle: string
  chapterId: string
  initialSaved: boolean
  onOpenEpisodeList: () => void
  onOpenSettings: () => void
  onNarrate: () => void
  isNarrating: boolean
}) {
  const [saved, setSaved] = useState(initialSaved)
  const { settings, setReadingMode } = useReadingSettings()

  const toggleBookmark = useCallback(async () => {
    const prev = saved
    setSaved((p) => !p)
    try {
      const { toggleSave } = await import("@/app/actions/saves")
      await toggleSave(storyId)
    } catch {
      setSaved(prev)
    }
  }, [storyId, saved])

  return (
    <header className="fixed top-[3px] left-0 right-0 z-40 border-b border-zinc-200/60 bg-white/90 backdrop-blur-md dark:border-zinc-800/60 dark:bg-[#191919]/90">
      <div className="mx-auto flex h-12 max-w-4xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link
            href={"/stories/" + storyId}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors"
            aria-label="Back to story"
          >
            <ArrowLeft size={18} />
          </Link>
          <span className="hidden sm:inline text-sm font-medium text-zinc-700 dark:text-zinc-300 truncate max-w-[200px]">
            {storyTitle}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={toggleBookmark}
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
              saved
                ? "text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                : "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
            }`}
            aria-label={saved ? "Remove bookmark" : "Bookmark"}
          >
            <Bookmark size={16} fill={saved ? "currentColor" : "none"} />
          </button>

          <button
            onClick={() => setReadingMode(settings.readingMode === "scroll" ? "page" : "scroll")}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 transition-colors"
            aria-label={settings.readingMode === "scroll" ? "Switch to page view" : "Switch to scroll view"}
            title={settings.readingMode === "scroll" ? "Page view" : "Scroll view"}
          >
            {settings.readingMode === "scroll" ? <Book size={16} /> : <ScrollText size={16} />}
          </button>

          <button
            onClick={onOpenSettings}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 transition-colors"
            aria-label="Reading settings"
          >
            <TypeIcon size={16} />
          </button>

          <button
            onClick={onNarrate}
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
              isNarrating
                ? "text-purple-500 bg-purple-50 dark:bg-purple-900/20"
                : "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
            }`}
            aria-label="Listen Mode"
            title="Listen Mode"
          >
            <Headphones size={16} />
          </button>

          <button
            onClick={onOpenEpisodeList}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 transition-colors"
            aria-label="Episode list"
          >
            <List size={16} />
          </button>
        </div>
      </div>
    </header>
  )
}

function ReaderContentWrapper({ children, content, chapterNumber, totalChapters, chapterTitle, coverUrl, storyTitle, authorName, tags, storyId, chapterId }: { children: ReactNode; content?: string; chapterNumber?: number; totalChapters?: number; chapterTitle?: string; coverUrl?: string; storyTitle?: string; authorName?: string; tags?: string | null; storyId?: string; chapterId?: string }) {
  const { settings } = useReadingSettings()
  const isPageMode = settings.readingMode === "page" && content
  const genreTheme = settings.theme === "dark" ? getReaderDarkTheme(tags ?? null) : null

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{
        backgroundColor: genreTheme ? genreTheme.bg : settings.theme === "dark" ? "#191919" : "#FAF9F6",
        color: genreTheme ? genreTheme.text : settings.theme === "dark" ? "#EDEDED" : "#2C2C2C",
      }}
    >
      {isPageMode ? (
        <div className="pt-16">
          <style>{`[data-lv-text="true"] { display: none; }`}</style>
          <div className="mx-auto px-4 sm:px-6 pb-16" style={{ maxWidth: "680px" }}>
            {chapterTitle && (
              <header className="mb-6 text-center">
                <p className="text-xs uppercase tracking-[0.15em] font-medium mb-3" style={{ color: "#6B6B6B" }}>
                  Episode {chapterNumber} of {totalChapters}
                </p>
                <h1
                  className="font-semibold leading-tight"
                  style={{
                    fontSize: "24px",
                    color: "inherit",
                    fontFamily: "Georgia, 'Times New Roman', serif",
                  }}
                >
                  {chapterTitle}
                </h1>
              </header>
            )}
            <PageFlipReader content={content} coverUrl={coverUrl} storyTitle={storyTitle} authorName={authorName} tags={tags} storyId={storyId} chapterId={chapterId} />
          </div>
          <div className="mx-auto px-4 sm:px-6 pb-16" style={{ maxWidth: "680px" }}>
            {children}
          </div>
        </div>
      ) : (
        <div
          className="mx-auto px-4 sm:px-6 pb-16 animate-fadeIn"
          style={{
            maxWidth: "680px",
            paddingTop: "88px",
          }}
        >
          {children}
        </div>
      )}
    </div>
  )
}

function PremiumReaderInner({
  storyId,
  storyTitle,
  chapterId,
  initialSaved,
  content,
  chapterNumber,
  totalChapters,
  chapterTitle,
  coverUrl,
  authorName,
  tags,
  initialScroll,
  children,
}: {
  storyId: string
  storyTitle: string
  chapterId: string
  initialSaved: boolean
  content?: string
  chapterNumber?: number
  totalChapters?: number
  chapterTitle?: string
  coverUrl?: string
  authorName?: string
  tags?: string | null
  initialScroll?: number | null
  children: ReactNode
}) {
  const [episodeListOpen, setEpisodeListOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [playerOpen, setPlayerOpen] = useState(false)
  const { state, play, stop, setContentTags } = useNarration()
  const isNarrating = state.isPlaying || state.isPaused

  const handleNarrate = useCallback(() => {
    if (isNarrating && state.isOpen) {
      stop()
      setPlayerOpen(false)
    } else if (content) {
      setContentTags(tags ?? null)
      play(content, tags ?? null)
      setPlayerOpen(true)
    }
  }, [isNarrating, state.isOpen, content, tags, play, stop, setContentTags])

  return (
    <>
      <EpisodeListDrawer
        storyId={storyId}
        storyTitle={storyTitle}
        currentChapterId={chapterId}
        open={episodeListOpen}
        onOpenChange={setEpisodeListOpen}
      />

      {settingsOpen && <ReadingSettingsPanel onClose={() => setSettingsOpen(false)} />}

      <ReadingProgressBar storyId={storyId} chapterId={chapterId} initialScroll={initialScroll ?? null} />

      <TopBar
        storyId={storyId}
        storyTitle={storyTitle}
        chapterId={chapterId}
        initialSaved={initialSaved}
        onOpenEpisodeList={() => setEpisodeListOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
        onNarrate={handleNarrate}
        isNarrating={isNarrating}
      />

      <ReaderContentWrapper content={content} chapterNumber={chapterNumber} totalChapters={totalChapters} chapterTitle={chapterTitle} coverUrl={coverUrl} storyTitle={storyTitle} authorName={authorName} tags={tags} storyId={storyId} chapterId={chapterId}>
        {children}
      </ReaderContentWrapper>

      {/* Cinematic Player (full-screen) */}
      {playerOpen && (
        <CinematicPlayer
          storyTitle={storyTitle}
          authorName={authorName}
          chapterTitle={chapterTitle}
          coverUrl={coverUrl}
          onClose={() => setPlayerOpen(false)}
        />
      )}

      {/* NarratorBar (minimized) — show when playing but player is closed */}
      {!playerOpen && <NarratorBar content={content} storyTitle={storyTitle} />}
    </>
  )
}

export function PremiumReaderLayout({
  storyId,
  storyTitle,
  chapterId,
  initialSaved,
  content,
  chapterNumber,
  totalChapters,
  chapterTitle,
  wordCount,
  coverUrl,
  authorName,
  tags,
  initialScroll,
  children,
}: {
  storyId: string
  storyTitle: string
  chapterId: string
  initialSaved: boolean
  content?: string
  chapterNumber?: number
  totalChapters?: number
  chapterTitle?: string
  wordCount?: number
  coverUrl?: string
  authorName?: string
  tags?: string | null
  initialScroll?: number | null
  children: ReactNode
}) {
  return (
    <ReadingSettingsProvider>
      <NarrationProvider>
        <PremiumReaderInner
          storyId={storyId}
          storyTitle={storyTitle}
          chapterId={chapterId}
          initialSaved={initialSaved}
          content={content}
          chapterNumber={chapterNumber}
          totalChapters={totalChapters}
          chapterTitle={chapterTitle}
          coverUrl={coverUrl}
          authorName={authorName}
          tags={tags}
          initialScroll={initialScroll}
        >
          {children}
        </PremiumReaderInner>
      </NarrationProvider>
    </ReadingSettingsProvider>
  )
}
