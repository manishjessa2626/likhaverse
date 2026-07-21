"use client"

import { useReadingSettings } from "@/lib/reading/ReadingSettingsContext"
import { X, Sun, Moon, Type, AlignLeft } from "lucide-react"

export function ReadingSettingsPanel({ onClose }: { onClose: () => void }) {
  const { settings, setFontSize, setTheme, setFontStyle, setLineSpacing, resetSettings } = useReadingSettings()

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-sm rounded-t-2xl sm:rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-700 dark:bg-zinc-900 animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-base font-semibold text-zinc-800 dark:text-zinc-100">Reading Settings</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5">
          {/* Font Size */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Font Size</label>
              <span className="text-xs text-zinc-400 dark:text-zinc-500">{settings.fontSize}px</span>
            </div>
            <input
              type="range"
              min={16}
              max={22}
              step={1}
              value={settings.fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-zinc-200 dark:bg-zinc-700 accent-amber-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-500 [&::-webkit-slider-thumb]:shadow-md"
            />
          </div>

          {/* Theme */}
          <div>
            <label className="mb-2 block text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Theme</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setTheme("light")}
                className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                  settings.theme === "light"
                    ? "border-amber-400 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                    : "border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
                }`}
              >
                <Sun size={16} />
                Light
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                  settings.theme === "dark"
                    ? "border-amber-400 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                    : "border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
                }`}
              >
                <Moon size={16} />
                Dark
              </button>
            </div>
          </div>

          {/* Font Style */}
          <div>
            <label className="mb-2 block text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Font Style</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setFontStyle("serif")}
                className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                  settings.fontStyle === "serif"
                    ? "border-amber-400 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                    : "border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
                }`}
              >
                <span className="font-serif text-base">Aa</span>
                Serif
              </button>
              <button
                onClick={() => setFontStyle("sans")}
                className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                  settings.fontStyle === "sans"
                    ? "border-amber-400 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                    : "border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
                }`}
              >
                <span className="font-sans text-base">Aa</span>
                Sans
              </button>
            </div>
          </div>

          {/* Line Spacing */}
          <div>
            <label className="mb-2 block text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Line Spacing</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setLineSpacing("normal")}
                className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                  settings.lineSpacing === "normal"
                    ? "border-amber-400 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                    : "border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
                }`}
              >
                <AlignLeft size={16} />
                Normal
              </button>
              <button
                onClick={() => setLineSpacing("relaxed")}
                className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                  settings.lineSpacing === "relaxed"
                    ? "border-amber-400 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                    : "border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
                }`}
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                Relaxed
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={resetSettings}
          className="mt-6 w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-xs font-medium text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700 transition-colors dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
        >
          Reset to Default
        </button>
      </div>
    </div>
  )
}
