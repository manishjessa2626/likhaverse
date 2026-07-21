"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { useTheme } from "@/components/ThemeProvider"

export type ReaderFontStyle = "serif" | "sans"
export type ReaderTheme = "light" | "dark"
export type ReaderLineSpacing = "normal" | "relaxed"

export interface ReadingSettings {
  fontSize: number
  theme: ReaderTheme
  fontStyle: ReaderFontStyle
  lineSpacing: ReaderLineSpacing
}

const STORAGE_KEY = "lv-reader-settings"

const DEFAULT_SETTINGS: ReadingSettings = {
  fontSize: 18,
  theme: "light",
  fontStyle: "serif",
  lineSpacing: "normal",
}

interface ReadingSettingsContextType {
  settings: ReadingSettings
  setFontSize: (size: number) => void
  setTheme: (theme: ReaderTheme) => void
  setFontStyle: (style: ReaderFontStyle) => void
  setLineSpacing: (spacing: ReaderLineSpacing) => void
  resetSettings: () => void
}

const ReadingSettingsContext = createContext<ReadingSettingsContextType | null>(null)

function loadSettings(): ReadingSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return { ...DEFAULT_SETTINGS, ...parsed }
    }
  } catch {}
  return DEFAULT_SETTINGS
}

function saveSettings(settings: ReadingSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {}
}

export function ReadingSettingsProvider({ children }: { children: ReactNode }) {
  const { setTheme: setGlobalTheme } = useTheme()
  const [settings, setSettings] = useState<ReadingSettings>(DEFAULT_SETTINGS)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setSettings(loadSettings())
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    saveSettings(settings)
    setGlobalTheme(settings.theme)
  }, [settings, mounted])

  const setFontSize = useCallback((fontSize: number) => {
    setSettings((prev) => ({ ...prev, fontSize: Math.max(16, Math.min(22, fontSize)) }))
  }, [])

  const setTheme = useCallback((theme: ReaderTheme) => {
    setSettings((prev) => ({ ...prev, theme }))
  }, [])

  const setFontStyle = useCallback((fontStyle: ReaderFontStyle) => {
    setSettings((prev) => ({ ...prev, fontStyle }))
  }, [])

  const setLineSpacing = useCallback((lineSpacing: ReaderLineSpacing) => {
    setSettings((prev) => ({ ...prev, lineSpacing }))
  }, [])

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS)
  }, [])

  return (
    <ReadingSettingsContext.Provider value={{ settings, setFontSize, setTheme, setFontStyle, setLineSpacing, resetSettings }}>
      {children}
    </ReadingSettingsContext.Provider>
  )
}

export function useReadingSettings() {
  const ctx = useContext(ReadingSettingsContext)
  if (!ctx) throw new Error("useReadingSettings must be used within ReadingSettingsProvider")
  return ctx
}
