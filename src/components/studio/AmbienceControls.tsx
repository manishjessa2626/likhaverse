"use client"

import { useState } from "react"
import type { Genre } from "@/lib/ambience/types"
import { GENRE_LABELS } from "@/lib/ambience/types"
import type { AmbienceTheme } from "@/lib/ambience/types"

const ALL_GENRES = Object.keys(GENRE_LABELS) as Genre[]

export function AmbienceControls({
  genres,
  intensity,
  enabled,
  activeTheme,
  onToggle,
  onToggleGenre,
  onSetIntensity,
}: {
  genres: Genre[]
  intensity: number
  enabled: boolean
  activeTheme: AmbienceTheme
  onToggle: () => void
  onToggleGenre: (g: Genre) => void
  onSetIntensity: (v: number) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {open && (
        <div
          className="mb-2 w-64 overflow-hidden rounded-2xl border border-white/[0.08] bg-zinc-950/90 backdrop-blur-xl shadow-2xl animate-ambience-slide"
          style={{ borderColor: enabled ? `${activeTheme.accentColor}33` : undefined }}
        >
          <div className="border-b border-white/[0.06] px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-300">Ambience</span>
              <button
                onClick={onToggle}
                className={`relative h-5 w-9 rounded-full transition-colors ${
                  enabled ? "bg-violet-500" : "bg-zinc-700"
                }`}
              >
                <span
                  className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition-all ${
                    enabled ? "translate-x-4" : ""
                  }`}
                />
              </button>
            </div>
            {enabled && genres.length > 0 && (
              <p className={`mt-1 text-xs ${activeTheme.textColor}`}>
                {activeTheme.label}
              </p>
            )}
          </div>

          <div className="border-b border-white/[0.06] px-4 py-3">
            <label className="mb-2 block text-xs font-medium text-zinc-500">
              Intensity
            </label>
            <input
              type="range"
              min={0}
              max={100}
              value={intensity}
              onChange={(e) => onSetIntensity(Number(e.target.value))}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-zinc-800 accent-violet-500"
              style={{ accentColor: activeTheme.accentColor }}
            />
            <div className="mt-1 flex justify-between text-[10px] text-zinc-600">
              <span>Off</span>
              <span>Max</span>
            </div>
          </div>

          <div className="px-4 py-3">
            <p className="mb-2 text-xs font-medium text-zinc-500">Genres</p>
            <div className="flex flex-wrap gap-1.5">
              {ALL_GENRES.map((g) => {
                const active = genres.includes(g)
                const gTheme = g === activeTheme.label.toLowerCase()
                return (
                  <button
                    key={g}
                    onClick={() => onToggleGenre(g)}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-all ${
                      active
                        ? "text-white shadow-sm"
                        : "bg-zinc-800/50 text-zinc-500 hover:bg-zinc-700/50"
                    }`}
                    style={
                      active
                        ? { background: activeTheme.accentColor + "30", color: activeTheme.accentColor }
                        : undefined
                    }
                  >
                    {GENRE_LABELS[g]}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className={`flex h-10 w-10 items-center justify-center rounded-full shadow-lg transition-all hover:scale-110 active:scale-95 ${
          open || enabled
            ? "text-white"
            : "bg-zinc-800 text-zinc-500 hover:bg-zinc-700"
        }`}
        style={{
          background: open || enabled ? activeTheme.accentColor + "50" : undefined,
          boxShadow: open || enabled ? `0 0 20px ${activeTheme.glowColor}` : undefined,
        }}
        title="Toggle ambience controls"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
        </svg>
      </button>
    </div>
  )
}
