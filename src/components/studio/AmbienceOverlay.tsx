"use client"

import { useMemo } from "react"
import type { AmbienceTheme } from "@/lib/ambience/types"

function ParticleField({ theme, intensity }: { theme: AmbienceTheme; intensity: number }) {
  const particles = useMemo(() => {
    if (theme.particles.style === "none" || theme.particles.count === 0) return []
    const count = Math.round(theme.particles.count * (intensity / 100))
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 3 + Math.random() * 4,
      size: 2 + Math.random() * 3,
      opacity: 0.2 + Math.random() * 0.5,
    }))
  }, [theme, intensity])

  if (theme.particles.style === "none" || particles.length === 0) return null

  if (theme.particles.style === "fog") {
    return (
      <div className="pointer-events-none fixed inset-0 z-[1] overflow-hidden">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full animate-ambience-fog"
            style={{
              left: `${p.left}%`,
              bottom: "-10%",
              width: `${80 + p.size * 30}px`,
              height: `${30 + p.size * 10}px`,
              opacity: p.opacity * 0.3,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration * 2}s`,
              background: `radial-gradient(ellipse, ${theme.glowColor} 0%, transparent 70%)`,
            }}
          />
        ))}
      </div>
    )
  }

  if (theme.particles.style === "petals") {
    return (
      <div className="pointer-events-none fixed inset-0 z-[1] overflow-hidden">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute animate-ambience-petal"
            style={{
              left: `${p.left}%`,
              top: "-5%",
              width: `${p.size * 2}px`,
              height: `${p.size * 2}px`,
              opacity: p.opacity,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration + 4}s`,
              background: theme.accentColor,
              borderRadius: "50% 0 50% 0",
            }}
          />
        ))}
      </div>
    )
  }

  if (theme.particles.style === "embers") {
    return (
      <div className="pointer-events-none fixed inset-0 z-[1] overflow-hidden">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute animate-ambience-ember"
            style={{
              left: `${p.left}%`,
              bottom: "0%",
              width: `${p.size}px`,
              height: `${p.size}px`,
              opacity: p.opacity,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration + 2}s`,
              background: theme.accentColor,
              borderRadius: "50%",
              boxShadow: `0 0 4px ${theme.accentColor}`,
            }}
          />
        ))}
      </div>
    )
  }

  // stars
  return (
    <div className="pointer-events-none fixed inset-0 z-[1] overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute animate-ambience-twinkle"
          style={{
            left: `${p.left}%`,
            top: `${Math.random() * 100}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            background: theme.accentColor,
            borderRadius: "50%",
            boxShadow: `0 0 6px ${theme.accentColor}`,
          }}
        />
      ))}
    </div>
  )
}

export function AmbienceOverlay({
  theme,
  enabled,
  intensity,
}: {
  theme: AmbienceTheme
  enabled: boolean
  intensity: number
}) {
  if (!enabled || intensity === 0) return null

  const i = intensity / 100

  return (
    <>
      <div
        className="pointer-events-none fixed inset-0 z-0 transition-all duration-1000"
        style={{
          background: `linear-gradient(135deg, ${theme.gradient.replace(/from-|via-|to-/g, "")})`,
          opacity: 0.6 * i,
        }}
      />
      <div
        className="pointer-events-none fixed inset-0 z-[1] transition-all duration-1000"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${theme.glowColor} 0%, transparent 60%)`,
          opacity: 0.8 * i,
        }}
      />
      <ParticleField theme={theme} intensity={intensity} />
    </>
  )
}
