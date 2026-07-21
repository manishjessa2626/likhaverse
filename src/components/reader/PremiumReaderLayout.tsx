"use client"

import { useState, useEffect, useCallback, type ReactNode } from "react"
import Link from "next/link"
import { ArrowLeft, Bookmark, List, Type as TypeIcon } from "lucide-react"
import { ReadingSettingsProvider, useReadingSettings } from "@/lib/reading/ReadingSettingsContext"
import { EpisodeListDrawer } from "./EpisodeListDrawer"
import { ReadingSettingsPanel } from "./ReadingSettingsPanel"

function ProgressBar() {
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = document.documentElement
    const handleScroll = () => {
      const pct = Math.min(100, Math.max(0, (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100))
      setProgress(pct)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()
    const timer = setTimeout(() => setVisible(true), 100)
    return () => {
      window.removeEventListener("scroll", handleScroll)
      clearTimeout(timer)
    }
  }, [])

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 h-[3px] bg-zinc-200 dark:bg-zinc-800 transition-opacity duration-500 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className="h-full bg-amber-500 dark:bg-amber-400 transition-all duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

function TopBar({
  storyId,
  storyTitle,
  chapterId,
  initialSaved,
  onOpenEpisodeList,
  onOpenSettings,
}: {
  storyId: string
  storyTitle: string
  chapterId: string
  initialSaved: boolean
  onOpenEpisodeList: () => void
  onOpenSettings: () => void
}) {
  const [saved, setSaved] = useState(initialSaved)

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
            onClick={onOpenSettings}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 transition-colors"
            aria-label="Reading settings"
          >
            <TypeIcon size={16} />
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

function ReaderContentWrapper({ children }: { children: ReactNode }) {
  const { settings } = useReadingSettings()

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{
        backgroundColor: settings.theme === "dark" ? "#191919" : "#FAF9F6",
        color: settings.theme === "dark" ? "#EDEDED" : "#2C2C2C",
      }}
    >
      <div
        className="mx-auto px-4 sm:px-6 pb-16 animate-fadeIn"
        style={{
          maxWidth: "680px",
          paddingTop: "88px",
        }}
      >
        {children}
      </div>
    </div>
  )
}

export function PremiumReaderLayout({
  storyId,
  storyTitle,
  chapterId,
  initialSaved,
  children,
}: {
  storyId: string
  storyTitle: string
  chapterId: string
  initialSaved: boolean
  children: ReactNode
}) {
  const [episodeListOpen, setEpisodeListOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <ReadingSettingsProvider>
      <EpisodeListDrawer
        storyId={storyId}
        storyTitle={storyTitle}
        currentChapterId={chapterId}
        open={episodeListOpen}
        onOpenChange={setEpisodeListOpen}
      />

      {settingsOpen && <ReadingSettingsPanel onClose={() => setSettingsOpen(false)} />}

      <ProgressBar />

      <TopBar
        storyId={storyId}
        storyTitle={storyTitle}
        chapterId={chapterId}
        initialSaved={initialSaved}
        onOpenEpisodeList={() => setEpisodeListOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <ReaderContentWrapper>
        {children}
      </ReaderContentWrapper>
    </ReadingSettingsProvider>
  )
}
