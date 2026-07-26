"use client"

import { useReadingSettings } from "@/lib/reading/ReadingSettingsContext"
import { useNarration } from "@/lib/reading/NarrationContext"

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
}

function highlightSentences(text: string, currentSentence: number, isActive: boolean): React.ReactNode[] {
  const sentences = splitSentences(text)
  return sentences.map((s, i) => {
    const isCurrent = isActive && i === currentSentence
    return (
      <span
        key={i}
        data-sentence-id={i}
        className="transition-all duration-300 rounded-sm"
        style={{
          backgroundColor: isCurrent ? "rgba(168, 85, 247, 0.15)" : "transparent",
          boxShadow: isCurrent ? "0 0 0 2px rgba(168, 85, 247, 0.2)" : "none",
          padding: "1px 0",
        }}
      >
        {s}{i < sentences.length - 1 ? " " : ""}
      </span>
    )
  })
}

export function ReaderContent({
  content,
}: {
  content: string
}) {
  const { settings } = useReadingSettings()
  const { state } = useNarration()
  const isNarrating = state.isPlaying || state.isPaused

  const fontFamily = settings.fontStyle === "serif"
    ? "Georgia, 'Times New Roman', serif"
    : "var(--font-sans, Inter, Arial, sans-serif)"

  const lineHeight = settings.lineSpacing === "relaxed" ? 2.0 : 1.85

  return (
    <div
      className="animate-fadeIn"
      style={{
        fontFamily,
        fontSize: `${settings.fontSize}px`,
        lineHeight,
        letterSpacing: "0.2px",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
      }}
    >
      {isNarrating ? highlightSentences(content, state.currentSentence, isNarrating) : content}
    </div>
  )
}
