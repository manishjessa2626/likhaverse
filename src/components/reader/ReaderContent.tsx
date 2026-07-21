"use client"

import { useReadingSettings } from "@/lib/reading/ReadingSettingsContext"

export function ReaderContent({
  content,
}: {
  content: string
}) {
  const { settings } = useReadingSettings()

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
      {content}
    </div>
  )
}
