"use client"

import { useState, useEffect } from "react"
import { Play, Pause, SkipBack, SkipForward, Volume2, X, Music, Headphones, Sparkles, Moon, Zap, Mic } from "lucide-react"
import { useNarration } from "@/lib/reading/NarrationContext"
import { useReadingSettings } from "@/lib/reading/ReadingSettingsContext"
import { NARRATION_PRESETS } from "@/lib/narration/voices"
import { getVoicePersonas, findBestSystemVoice } from "@/lib/narration/voices"

const PRESET_ICONS: Record<string, any> = {
  warm: Sparkles,
  dramatic: Mic,
  calm: Moon,
  energetic: Zap,
  neutral: Headphones,
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
  const { state, pause, resume, stop, skipForward, skipBackward, setSpeed, setVoice, setPreset, playVoiceSample } = useNarration()
  const { settings } = useReadingSettings()
  const [speedOpen, setSpeedOpen] = useState(false)
  const [voiceOpen, setVoiceOpen] = useState(false)
  const [systemVoices, setSystemVoices] = useState<SpeechSynthesisVoice[]>([])

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return
    const update = () => setSystemVoices(window.speechSynthesis.getVoices() ?? [])
    update()
    window.speechSynthesis.onvoiceschanged = update
    return () => { window.speechSynthesis.onvoiceschanged = null }
  }, [])

  const isDark = settings.theme === "dark"
  const isActive = state.isPlaying || state.isPaused
  const progressPct = state.totalSegments > 0 ? (state.currentSegment / state.totalSegments) * 100 : 0

  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2]
  const personas = getVoicePersonas()
  const currentPreset = NARRATION_PRESETS.find((p) => p.id === state.preset) ?? NARRATION_PRESETS[4]

  const currentVoiceName = state.voice
    ? systemVoices.find((v: SpeechSynthesisVoice) => v.voiceURI === state.voice)?.name ?? "Voice"
    : "Auto"

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col overflow-y-auto"
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

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-4 py-3">
        <button
          onClick={() => { stop(); onClose?.() }}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 transition-colors"
          aria-label="Close"
        >
          <X size={18} />
        </button>
        <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500">{storyTitle}</span>
        <div className="w-8" />
      </div>

      <div className="relative z-10 flex flex-1 flex-col items-center px-6 pb-8">
        {/* Cover art */}
        <div
          className="w-48 h-64 sm:w-52 sm:h-68 rounded-2xl overflow-hidden shadow-2xl mb-5 mt-2"
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

        <h2 className="text-xl font-bold text-center mb-1 text-zinc-800 dark:text-zinc-100">
          {storyTitle ?? "Untitled"}
        </h2>
        {authorName && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">{authorName}</p>
        )}
        {chapterTitle && (
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-4">{chapterTitle}</p>
        )}

        {/* Current narrator persona badge */}
        <div className="flex items-center gap-2 mb-6">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-medium ${
            isDark ? "bg-zinc-800 text-zinc-300" : "bg-zinc-100 text-zinc-600"
          }`}>
            <Headphones size={10} />
            {currentPreset.icon} {currentPreset.label}
          </span>
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-medium ${
            isDark ? "bg-zinc-800 text-zinc-300" : "bg-zinc-100 text-zinc-600"
          }`}>
            {state.genre !== "default" ? state.genre : ""}
          </span>
        </div>

        {/* Preset selector */}
        <div className="w-full max-w-sm mb-4">
          <p className="text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2 font-medium">Narration Style</p>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {NARRATION_PRESETS.map((preset) => {
              const Icon = PRESET_ICONS[preset.id] ?? Headphones
              const isActive = state.preset === preset.id
              return (
                <button
                  key={preset.id}
                  onClick={() => setPreset(preset.id)}
                  className={`flex flex-col items-center gap-1 rounded-xl px-3 py-2 text-[10px] font-medium transition-all flex-shrink-0 ${
                    isActive
                      ? "bg-purple-100 text-purple-700 ring-2 ring-purple-400 dark:bg-purple-900/30 dark:text-purple-300 dark:ring-purple-500"
                      : "text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  }`}
                >
                  <Icon size={14} />
                  {preset.icon}
                  <span>{preset.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Progress */}
        <div className="w-full max-w-sm mb-3">
          <div className={`h-1 rounded-full ${isDark ? "bg-zinc-800" : "bg-zinc-200"}`}>
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-amber-500 transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-zinc-400">{state.currentSegment}/{state.totalSegments}</span>
            <span className="text-[10px] text-zinc-400">{Math.round(progressPct)}%</span>
          </div>
        </div>

        {/* Playback controls */}
        <div className="flex items-center gap-4 mb-6">
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

        {/* Voice & Speed selector */}
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-sm w-full">
          {/* Speed */}
          <div className="relative">
            <button
              onClick={() => setSpeedOpen(!speedOpen)}
              className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                isDark ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              <Volume2 size={12} />
              {state.speed}x
            </button>
            {speedOpen && (
              <div
                className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 rounded-lg border p-1 shadow-xl z-20 ${
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

          {/* Voice selector with personas */}
          <div className="relative">
            <button
              onClick={() => setVoiceOpen(!voiceOpen)}
              className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                isDark ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              <Headphones size={12} />
              {currentVoiceName.slice(0, 14)}
            </button>
            {voiceOpen && (
              <div
                className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 max-h-60 w-56 overflow-y-auto rounded-lg border p-2 shadow-xl z-20 ${
                  isDark ? "border-zinc-700 bg-zinc-900" : "border-zinc-200 bg-white"
                }`}
              >
                <p className="text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 px-2 pb-1 font-medium">Voice Personas</p>
                {personas.map((persona) => {
                  const bestVoice = findBestSystemVoice(persona.voiceType, systemVoices)
                  const isSelected = state.voice === bestVoice?.voiceURI
                  return (
                    <div key={persona.id} className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          if (bestVoice) setVoice(bestVoice.voiceURI)
                          setVoiceOpen(false)
                        }}
                        className={`flex-1 flex items-center gap-2 rounded px-2 py-1.5 text-left text-xs transition-colors ${
                          isSelected
                            ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                            : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-700"
                        }`}
                      >
                        <span>{persona.emoji}</span>
                        <div>
                          <span className="font-medium">{persona.name}</span>
                          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 ml-1">· {persona.tagline}</span>
                        </div>
                      </button>
                      {bestVoice && (
                        <button
                          onClick={() => playVoiceSample(bestVoice.voiceURI)}
                          className="flex h-6 w-6 items-center justify-center rounded text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-700 dark:hover:text-zinc-300 transition-colors"
                          title="Play sample"
                        >
                          <Play size={10} fill="currentColor" />
                        </button>
                      )}
                    </div>
                  )
                })}
                <div className="h-px bg-zinc-200 dark:bg-zinc-700 my-1.5" />
                <p className="text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 px-2 pb-1 font-medium">All Voices</p>
                {systemVoices.filter((v: SpeechSynthesisVoice) => v.lang.startsWith("en")).map((v: SpeechSynthesisVoice) => (
                  <div key={v.voiceURI} className="flex items-center gap-1">
                    <button
                      onClick={() => { setVoice(v.voiceURI); setVoiceOpen(false) }}
                      className={`flex-1 rounded px-2 py-1 text-left text-xs transition-colors ${
                        state.voice === v.voiceURI
                          ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                          : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-700"
                      }`}
                    >
                      {v.name.slice(0, 24)}
                    </button>
                    <button
                      onClick={() => playVoiceSample(v.voiceURI)}
                      className="flex h-6 w-6 items-center justify-center rounded text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-700 dark:hover:text-zinc-300 transition-colors"
                      title="Play sample"
                    >
                      <Play size={10} fill="currentColor" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
