"use client"

import { useState, useEffect, useRef } from "react"
import { Play, Pause, SkipBack, SkipForward, Volume2, ChevronDown, ChevronUp } from "lucide-react"
import { useNarration } from "@/lib/reading/NarrationContext"
import { useReadingSettings } from "@/lib/reading/ReadingSettingsContext"

export function NarratorBar({ content, storyTitle }: { content?: string; storyTitle?: string }) {
  const { state, play, pause, resume, stop, skipForward, skipBackward, setSpeed, setVoice, openPlayer } = useNarration()
  const { settings } = useReadingSettings()
  const [expanded, setExpanded] = useState(false)
  const [speedOpen, setSpeedOpen] = useState(false)
  const [voiceOpen, setVoiceOpen] = useState(false)

  const hasContent = !!content && content.length > 0
  const isActive = state.isPlaying || state.isPaused

  useEffect(() => {
    if (!hasContent && isActive) stop()
  }, [hasContent])

  const isDark = settings.theme === "dark"

  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2]
  const voices: SpeechSynthesisVoice[] = typeof window !== "undefined"
    ? window.speechSynthesis.getVoices() ?? []
    : []
  const progress = state.totalSegments > 0 ? ((state.currentSegment + 1) / state.totalSegments) * 100 : 0

  const currentSegmentText = state.segments[state.currentSegment]?.text ?? ""

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 border-t transition-all duration-300 ${
        isDark ? "border-zinc-700/60 bg-zinc-900/95 backdrop-blur-lg" : "border-zinc-200/60 bg-white/95 backdrop-blur-lg"
      }`}
      style={{ boxShadow: isDark ? "0 -4px 20px rgba(0,0,0,0.5)" : "0 -4px 20px rgba(0,0,0,0.08)" }}
    >
      {/* Progress bar */}
      <div className="h-[2px] bg-zinc-200 dark:bg-zinc-800">
        <div
          className="h-full transition-all duration-300 ease-out"
          style={{
            width: `${progress}%`,
            background: "linear-gradient(to right, #a78bfa, #7c3aed)",
            opacity: isActive ? 1 : 0.3,
          }}
        />
      </div>

      <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-2.5">
        {/* Expand / Open full player */}
        <button
          onClick={() => { if (isActive) openPlayer() }}
          className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 transition-colors"
          aria-label="Open full player"
        >
          {expanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>

        {/* Play/Pause */}
        {!isActive ? (
          <button
            onClick={() => { if (hasContent) play(content!) }}
            disabled={!hasContent}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-white hover:bg-purple-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Play narration"
          >
            <Play size={14} fill="currentColor" />
          </button>
        ) : (
          <button
            onClick={state.isPaused ? resume : pause}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-white hover:bg-purple-500 transition-colors"
            aria-label={state.isPaused ? "Resume" : "Pause"}
          >
            {state.isPaused ? <Play size={14} fill="currentColor" /> : <Pause size={14} fill="currentColor" />}
          </button>
        )}

        {/* Skip Backward */}
        <button
          onClick={skipBackward}
          disabled={!isActive}
          className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 disabled:opacity-20 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 transition-colors"
          aria-label="Skip backward"
        >
          <SkipBack size={14} />
        </button>

        {/* Skip Forward */}
        <button
          onClick={skipForward}
          disabled={!isActive}
          className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 disabled:opacity-20 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 transition-colors"
          aria-label="Skip forward"
        >
          <SkipForward size={14} />
        </button>

        {/* Stop */}
        {isActive && (
          <button
            onClick={stop}
            className="flex h-7 w-7 items-center justify-center rounded-md text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
            aria-label="Stop"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="16" height="16" rx="2" /></svg>
          </button>
        )}

        {/* Segment counter */}
        {isActive && (
          <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 whitespace-nowrap">
            {state.currentSegment + 1}/{state.totalSegments}
          </span>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Current segment text (expanded) */}
        {isActive && expanded && (
          <p className="hidden sm:block text-xs text-zinc-500 dark:text-zinc-400 truncate max-w-[200px] italic">
            &ldquo;{currentSegmentText.slice(0, 80)}&hellip;&rdquo;
          </p>
        )}

        {/* Genre badge */}
        {state.genre !== "default" && (
          <span className="hidden sm:inline text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
            {state.genre}
          </span>
        )}

        {/* Speed control */}
        <div className="relative">
          <button
            onClick={() => { setSpeedOpen(!speedOpen); setVoiceOpen(false) }}
            className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
              isDark ? "text-zinc-400 hover:bg-zinc-800" : "text-zinc-500 hover:bg-zinc-100"
            }`}
          >
            <Volume2 size={12} />
            {state.speed}x
          </button>
          {speedOpen && (
            <div
              className={`absolute bottom-full right-0 mb-2 rounded-lg border p-1 shadow-xl ${
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

        {/* Voice selection */}
        {voices.length > 0 && (
          <div className="relative">
            <button
              onClick={() => { setVoiceOpen(!voiceOpen); setSpeedOpen(false) }}
              className={`rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
                isDark ? "text-zinc-400 hover:bg-zinc-800" : "text-zinc-500 hover:bg-zinc-100"
              }`}
            >
              {state.voice
                ? voices.find((v: SpeechSynthesisVoice) => v.voiceURI === state.voice)?.name?.slice(0, 16) ?? "Voice"
                : "Voice"}
            </button>
            {voiceOpen && (
              <div
                className={`absolute bottom-full right-0 mb-2 max-h-48 w-48 overflow-y-auto rounded-lg border p-1 shadow-xl ${
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
                    {v.name.slice(0, 24)}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Close when playing */}
        {isActive && (
          <button
            onClick={stop}
            className="flex h-6 w-6 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 transition-colors"
            aria-label="Close narrator"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        )}
      </div>
    </div>
  )
}
