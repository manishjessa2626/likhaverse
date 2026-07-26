"use client"

import { useState } from "react"
import { Play, Pause, SkipBack, SkipForward, Volume2, X, Music } from "lucide-react"
import { useNarration } from "@/lib/reading/NarrationContext"
import { useReadingSettings } from "@/lib/reading/ReadingSettingsContext"

const GENRE_COLORS: Record<string, string> = {
  comedy: "from-yellow-500/30 to-transparent",
  horror: "from-red-900/30 to-transparent",
  romance: "from-pink-500/30 to-transparent",
  action: "from-orange-500/30 to-transparent",
  mystery: "from-indigo-500/30 to-transparent",
  fantasy: "from-purple-500/30 to-transparent",
  drama: "from-amber-500/30 to-transparent",
  thriller: "from-red-800/30 to-transparent",
  scifi: "from-cyan-500/30 to-transparent",
  adventure: "from-amber-500/30 to-transparent",
}

export function CinematicPlayer({
  storyTitle,
  authorName,
  chapterTitle,
  coverUrl,
  onClose,
}: {
  storyTitle?: string
  authorName?: string
  chapterTitle?: string
  coverUrl?: string
  onClose?: () => void
}) {
  const { state, pause, resume, stop, skipForward, skipBackward, setSpeed, setVoice } = useNarration()
  const { settings } = useReadingSettings()
  const [speedOpen, setSpeedOpen] = useState(false)
  const [voiceOpen, setVoiceOpen] = useState(false)

  const isDark = settings.theme === "dark"
  const isActive = state.isPlaying || state.isPaused
  const progressPct = state.totalSegments > 0 ? (state.currentSegment / state.totalSegments) * 100 : 0

  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2]
  const voices: SpeechSynthesisVoice[] = typeof window !== "undefined"
    ? window.speechSynthesis.getVoices() ?? []
    : []
  const genreKey = state.genre

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{
        backgroundColor: isDark ? "#0a0a0a" : "#FAF9F6",
      }}
    >
      {/* Background gradient */}
      <div
        className="absolute inset-0 bg-gradient-to-b opacity-40 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(ellipse at 50% 0%, rgba(168,85,247,0.15), transparent 70%)`,
        }}
      />

      {/* Close button */}
      <div className="relative z-10 flex items-center justify-between px-4 py-3">
        <button
          onClick={() => { stop(); onClose?.() }}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 transition-colors"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500">
          {storyTitle}
        </span>

        {/* Empty space for alignment */}
        <div className="w-8" />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 -mt-8">
        {/* Cover art */}
        <div
          className="w-48 h-64 sm:w-56 sm:h-72 rounded-2xl overflow-hidden shadow-2xl mb-6"
          style={{
            boxShadow: isDark
              ? `0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(168,85,247,0.1)`
              : `0 20px 60px rgba(0,0,0,0.15), 0 0 40px rgba(168,85,247,0.05)`,
          }}
        >
          {coverUrl ? (
            <img src={coverUrl} alt={storyTitle ?? ""} className="w-full h-full object-cover" />
          ) : (
            <div className={`flex h-full items-center justify-center ${isDark ? "bg-zinc-800" : "bg-purple-100"}`}>
              <Music size={40} className={isDark ? "text-zinc-600" : "text-purple-300"} />
            </div>
          )}
        </div>

        {/* Title & author */}
        <h2 className="text-xl font-bold text-center mb-1 text-zinc-800 dark:text-zinc-100">
          {storyTitle ?? "Untitled"}
        </h2>
        {authorName && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">{authorName}</p>
        )}
        {chapterTitle && (
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-6">{chapterTitle}</p>
        )}

        {/* Narration style badge */}
        <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-medium mb-8 ${
          isDark ? "bg-zinc-800 text-zinc-300" : "bg-zinc-100 text-zinc-600"
        }`}>
          {state.genre !== "default" ? `${state.genre} · ` : ""}Narrator
        </span>

        {/* Progress bar */}
        <div className="w-full max-w-sm mb-2">
          <div className={`h-1 rounded-full ${isDark ? "bg-zinc-800" : "bg-zinc-200"}`}>
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-amber-500 transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-zinc-400">{state.currentSegment}/{state.totalSegments} segments</span>
            <span className="text-[10px] text-zinc-400">{Math.round(progressPct)}%</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 mt-2">
          <button
            onClick={skipBackward}
            disabled={!isActive}
            className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 disabled:opacity-20 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 transition-colors"
          >
            <SkipBack size={18} />
          </button>

          {!isActive ? (
            <button
              className="flex h-14 w-14 items-center justify-center rounded-full bg-purple-600 text-white hover:bg-purple-500 shadow-lg shadow-purple-500/25 transition-all"
              aria-label="Play"
            >
              <Play size={22} fill="currentColor" />
            </button>
          ) : (
            <button
              onClick={state.isPaused ? resume : pause}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-purple-600 text-white hover:bg-purple-500 shadow-lg shadow-purple-500/25 transition-all"
              aria-label={state.isPaused ? "Resume" : "Pause"}
            >
              {state.isPaused ? <Play size={22} fill="currentColor" /> : <Pause size={22} fill="currentColor" />}
            </button>
          )}

          <button
            onClick={skipForward}
            disabled={!isActive}
            className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 disabled:opacity-20 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 transition-colors"
          >
            <SkipForward size={18} />
          </button>
        </div>

        {/* Bottom controls row */}
        <div className="flex items-center gap-3 mt-8 flex-wrap justify-center">
          {/* Speed */}
          <div className="relative">
            <button
              onClick={() => setSpeedOpen(!speedOpen)}
              className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                isDark
                  ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              <Volume2 size={12} />
              {state.speed}x
            </button>
            {speedOpen && (
              <div
                className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 rounded-lg border p-1 shadow-xl ${
                  isDark ? "border-zinc-700 bg-zinc-800" : "border-zinc-200 bg-white"
                }`}
              >
                {speeds.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setSpeed(s); setSpeedOpen(false) }}
                    className={`block w-full rounded px-3 py-1 text-left text-xs transition-colors ${
                      state.speed === s
                        ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                        : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-700"
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Voice */}
          <div className="relative">
            <button
              onClick={() => setVoiceOpen(!voiceOpen)}
              className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                isDark
                  ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              {state.voice ? voices.find((v: SpeechSynthesisVoice) => v.voiceURI === state.voice)?.name?.slice(0, 12) ?? "Voice" : "Voice"}
            </button>
            {voiceOpen && (
              <div
                className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 max-h-40 w-44 overflow-y-auto rounded-lg border p-1 shadow-xl ${
                  isDark ? "border-zinc-700 bg-zinc-800" : "border-zinc-200 bg-white"
                }`}
              >
                <button
                  onClick={() => { setVoice(null); setVoiceOpen(false) }}
                  className={`block w-full rounded px-3 py-1.5 text-left text-xs transition-colors ${
                    !state.voice
                      ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                      : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-700"
                  }`}
                >
                  Default
                </button>
                {voices.filter((v: SpeechSynthesisVoice) => v.lang.startsWith("en")).map((v: SpeechSynthesisVoice) => (
                  <button
                    key={v.voiceURI}
                    onClick={() => { setVoice(v.voiceURI); setVoiceOpen(false) }}
                    className={`block w-full rounded px-3 py-1.5 text-left text-xs transition-colors ${
                      state.voice === v.voiceURI
                        ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                        : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-700"
                    }`}
                  >
                    {v.name.slice(0, 20)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
