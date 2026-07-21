"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import type { Genre, AmbienceState } from "@/lib/ambience/types"
import { AMBIENCE_THEMES, FALLBACK_THEME } from "@/lib/ambience/themes"

const STORAGE_KEY = "likhaverse-ambience"

function loadState(): AmbienceState {
  if (typeof window === "undefined") return { enabled: true, genres: [], intensity: 60 }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return { enabled: true, genres: [], intensity: 60 }
}

export function useAmbience() {
  const [state, setState] = useState<AmbienceState>(loadState)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const nodesRef = useRef<AudioNode[]>([])

  const persist = useCallback((s: AmbienceState) => {
    setState(s)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)) } catch {}
  }, [])

  const toggle = useCallback(() => {
    persist({ ...state, enabled: !state.enabled })
  }, [state, persist])

  const setGenres = useCallback((genres: Genre[]) => {
    persist({ ...state, genres })
  }, [state, persist])

  const toggleGenre = useCallback((g: Genre) => {
    const next = state.genres.includes(g)
      ? state.genres.filter((x) => x !== g)
      : [...state.genres, g]
    persist({ ...state, genres: next })
  }, [state, persist])

  const setIntensity = useCallback((intensity: number) => {
    persist({ ...state, intensity })
  }, [state, persist])

  const activeTheme = state.genres.length === 0
    ? FALLBACK_THEME
    : state.genres.length === 1
      ? AMBIENCE_THEMES[state.genres[0]]
      : blendThemes(state.genres)

  function blendThemes(genres: Genre[]): typeof FALLBACK_THEME {
    const themes = genres.map((g) => AMBIENCE_THEMES[g]).filter(Boolean)
    if (themes.length === 0) return FALLBACK_THEME
    const w = 1 / themes.length
    const pCount = Math.round(themes.reduce((s, t) => s + t.particles.count * w, 0))
    const dominant = themes.reduce((a, b) =>
      a.sound.gain > b.sound.gain ? a : b
    )
    return {
      label: themes.map((t) => t.label).join(" + "),
      gradient: themes.map((t) => t.gradient).join(", "),
      bgColor: themes[0].bgColor,
      accentColor: themes[Math.floor(themes.length / 2)].accentColor,
      textColor: themes[0].textColor,
      glowColor: averageColor(themes.map((t) => t.glowColor)),
      particles: { style: dominant.particles.style, count: pCount },
      sound: { ...dominant.sound, gain: dominant.sound.gain },
    }
  }

  function averageColor(colors: string[]): string {
    const parsed = colors.map((c) => {
      const m = c.match(/rgba?\((\d+),(\d+),(\d+),([\d.]+)\)/)
      if (!m) return { r: 100, g: 100, b: 100, a: 0.1 }
      return { r: +m[1], g: +m[2], b: +m[3], a: +m[4] }
    })
    const n = parsed.length
    const avg = {
      r: Math.round(parsed.reduce((s, c) => s + c.r, 0) / n),
      g: Math.round(parsed.reduce((s, c) => s + c.g, 0) / n),
      b: Math.round(parsed.reduce((s, c) => s + c.b, 0) / n),
      a: parsed.reduce((s, c) => s + c.a, 0) / n,
    }
    return `rgba(${avg.r},${avg.g},${avg.b},${avg.a})`
  }

  // Audio
  useEffect(() => {
    if (!state.enabled || state.genres.length === 0 || state.intensity === 0) {
      nodesRef.current.forEach((n) => {
        try { (n as AudioScheduledSourceNode).stop?.() } catch {}
        try { n.disconnect() } catch {}
      })
      nodesRef.current = []
      return
    }

    const ctx = audioCtxRef.current ?? new AudioContext()
    audioCtxRef.current = ctx
    if (ctx.state === "suspended") ctx.resume()

    const i = state.intensity / 100
    const theme = activeTheme
    if (theme.sound.type === "none") return

    const nodes: AudioNode[] = []
    const gain = ctx.createGain()
    gain.gain.value = theme.sound.gain * i * 2
    gain.connect(ctx.destination)
    nodes.push(gain)

    if (theme.sound.type === "drone") {
      const osc = ctx.createOscillator()
      osc.type = "sawtooth"
      osc.frequency.value = theme.sound.frequency
      const filter = ctx.createBiquadFilter()
      filter.type = "lowpass"
      filter.frequency.value = theme.sound.filterFrequency + (1 - i) * 500
      osc.connect(filter)
      filter.connect(gain)
      osc.start()
      nodes.push(osc, filter)
      const osc2 = ctx.createOscillator()
      osc2.type = "sine"
      osc2.frequency.value = theme.sound.frequency * 1.5
      const g2 = ctx.createGain()
      g2.gain.value = 0.3
      osc2.connect(g2)
      g2.connect(gain)
      osc2.start()
      nodes.push(osc2, g2)
    } else if (theme.sound.type === "noise") {
      const bufferSize = ctx.sampleRate * 2
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let j = 0; j < bufferSize; j++) {
        data[j] = (Math.random() * 2 - 1) * Math.pow(1 - j / bufferSize, 0.5)
      }
      const noise = ctx.createBufferSource()
      noise.buffer = buffer
      noise.loop = true
      const filter = ctx.createBiquadFilter()
      filter.type = "lowpass"
      filter.frequency.value = theme.sound.filterFrequency
      const filter2 = ctx.createBiquadFilter()
      filter2.type = "highpass"
      filter2.frequency.value = 80
      noise.connect(filter)
      filter.connect(filter2)
      filter2.connect(gain)
      noise.start()
      nodes.push(noise, filter, filter2)
    } else if (theme.sound.type === "tone") {
      const osc = ctx.createOscillator()
      osc.type = "sine"
      osc.frequency.value = theme.sound.frequency
      const lfo = ctx.createOscillator()
      lfo.type = "sine"
      lfo.frequency.value = 0.5 + i * 1.5
      const lfoGain = ctx.createGain()
      lfoGain.gain.value = 10
      lfo.connect(lfoGain)
      lfoGain.connect(osc.frequency)
      osc.connect(gain)
      osc.start()
      lfo.start()
      nodes.push(osc, lfo, lfoGain)
    }

    nodesRef.current = nodes
    return () => {
      nodes.forEach((n) => {
        try { (n as AudioScheduledSourceNode).stop?.() } catch {}
        try { n.disconnect() } catch {}
      })
    }
  }, [state.enabled, state.genres, state.intensity, activeTheme])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      nodesRef.current.forEach((n) => {
        try { (n as AudioScheduledSourceNode).stop?.() } catch {}
        try { n.disconnect() } catch {}
      })
      nodesRef.current = []
    }
  }, [])

  return {
    state,
    activeTheme,
    toggle,
    setGenres,
    toggleGenre,
    setIntensity,
  }
}
