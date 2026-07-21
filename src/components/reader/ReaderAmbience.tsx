"use client"

import { useMemo, useState, useEffect } from "react"

const GENRE_THEMES: Record<string, { gradient: string; particles: string; count: number; color: string }> = {
  fantasy: { gradient: "from-indigo-900/20 via-purple-900/10", particles: "✨", count: 20, color: "#a78bfa" },
  romance: { gradient: "from-rose-900/20 via-pink-900/10", particles: "🌸", count: 15, color: "#f472b6" },
  horror: { gradient: "from-zinc-900/30 via-stone-900/10", particles: "🌫️", count: 10, color: "#525252" },
  "sci-fi": { gradient: "from-cyan-900/20 via-blue-900/10", particles: "✦", count: 25, color: "#22d3ee" },
  mystery: { gradient: "from-amber-900/20 via-yellow-900/10", particles: "🌫️", count: 10, color: "#d4d4d8" },
  drama: { gradient: "from-amber-900/20 via-orange-900/10", particles: "✨", count: 8, color: "#fb923c" },
  adventure: { gradient: "from-emerald-900/20 via-teal-900/10", particles: "🔥", count: 15, color: "#34d399" },
}

function getTheme(tags?: string | null) {
  const tag = tags?.toLowerCase() ?? ""
  for (const [key, theme] of Object.entries(GENRE_THEMES)) {
    if (tag.includes(key)) return theme
  }
  return GENRE_THEMES.fantasy!
}

function Particle({ theme, index }: { theme: NonNullable<ReturnType<typeof getTheme>>; index: number }) {
  const [style, setStyle] = useState<React.CSSProperties>({ opacity: 0 })

  useEffect(() => {
    setStyle({
      left: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 5}s`,
      animationDuration: `${4 + Math.random() * 6}s`,
      fontSize: `${12 + Math.random() * 12}px`,
      opacity: 0.3 + Math.random() * 0.4,
    })
  }, [])

  return (
    <div
      className="absolute animate-ambience-petal pointer-events-none"
      style={style}
    >
      {theme.particles}
    </div>
  )
}

export function ReaderAmbience({ tags }: { tags?: string | null }) {
  const theme = getTheme(tags)
  const particles = useMemo(() => Array.from({ length: theme.count }, (_, i) => i), [theme.count])

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-b ${theme.gradient} to-transparent`} />

      {/* Particles */}
      {particles.map((_, i) => (
        <Particle key={i} theme={theme} index={i} />
      ))}
    </div>
  )
}
