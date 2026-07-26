"use client"

import { createContext, useContext, useState, useRef, useCallback, useEffect, type ReactNode } from "react"
import { WebSpeechProvider } from "@/lib/narration/providers/web-speech"
import { NarrationEngine, mapTagsToGenre, createInitialPlayerState } from "@/lib/narration/engine"
import type { PlayerState, Genre } from "@/lib/narration/types"

let engineInstance: NarrationEngine | null = null
function getEngine(): NarrationEngine {
  if (!engineInstance) {
    engineInstance = new NarrationEngine(new WebSpeechProvider())
  }
  return engineInstance
}

interface NarrationContextType {
  state: PlayerState
  play: (content: string, tags?: string | null) => void
  pause: () => void
  resume: () => void
  stop: () => void
  skipForward: () => void
  skipBackward: () => void
  setSpeed: (speed: number) => void
  setPitch: (pitch: number) => void
  setVoice: (voiceURI: string | null) => void
  openPlayer: () => void
  closePlayer: () => void
  togglePlayer: () => void
  genre: Genre
  setContentTags: (tags: string | null) => void
}

const NarrationContext = createContext<NarrationContextType | null>(null)

export function NarrationProvider({ children }: { children: ReactNode }) {
  const engine = getEngine()
  const [state, setState] = useState<PlayerState>(createInitialPlayerState())
  const contentRef = useRef("")
  const tagsRef = useRef<string | null>(null)
  const segmentIdxRef = useRef(0)

  const updateState = useCallback((partial: Partial<PlayerState>) => {
    setState((prev) => ({ ...prev, ...partial }))
  }, [])

  engine.setCallbacks(
    (idx: number) => {
      segmentIdxRef.current = idx
      const progress = state.totalSegments > 0 ? Math.round((idx / state.totalSegments) * 100) : 0
      setState((prev) => ({ ...prev, currentSegment: idx, progress }))
    },
    () => {
      setState((prev) => ({ ...prev, isPlaying: false, isPaused: false, currentSegment: 0, progress: 0 }))
    },
  )

  const play = useCallback((content: string, tags?: string | null) => {
    contentRef.current = content
    if (tags !== undefined) {
      tagsRef.current = tags
      engine.setTags(tags)
    }
    engine.loadContent(content)
    const segments = engine.getSegments()
    const genre = engine.getGenre()
    updateState({
      isPlaying: true,
      isPaused: false,
      currentSegment: 0,
      totalSegments: segments.length,
      segments,
      progress: 0,
      genre,
      isOpen: true,
    })
    segmentIdxRef.current = 0
    engine.play()
  }, [engine, updateState])

  const pause = useCallback(() => {
    engine.pause()
    updateState({ isPaused: true })
  }, [engine, updateState])

  const resume = useCallback(() => {
    engine.resume()
    updateState({ isPaused: false })
  }, [engine, updateState])

  const stop = useCallback(() => {
    engine.stop()
    updateState({ isPlaying: false, isPaused: false, currentSegment: 0, progress: 0 })
  }, [engine, updateState])

  const skipForward = useCallback(() => {
    if (!contentRef.current) return
    engine.stop()
    const next = Math.min(segmentIdxRef.current + 5, engine.getSegments().length - 1)
    segmentIdxRef.current = next
    engine.loadContent(contentRef.current)
    engine.play()
  }, [engine])

  const skipBackward = useCallback(() => {
    if (!contentRef.current) return
    engine.stop()
    const prev = Math.max(segmentIdxRef.current - 5, 0)
    segmentIdxRef.current = prev
    engine.loadContent(contentRef.current)
    engine.play()
  }, [engine])

  const setSpeed = useCallback((speed: number) => {
    engine.setUserSpeed(speed)
    updateState({ speed })
  }, [engine, updateState])

  const setPitch = useCallback((pitch: number) => {
    engine.setUserPitch(pitch)
    updateState({ pitch })
  }, [engine, updateState])

  const setVoice = useCallback((voiceURI: string | null) => {
    engine.getProvider().stop()
    ;(window as any).__lvNarratorVoice = voiceURI
    updateState({ voice: voiceURI })
  }, [engine, updateState])

  const openPlayer = useCallback(() => updateState({ isOpen: true }), [updateState])
  const closePlayer = useCallback(() => {
    stop()
    updateState({ isOpen: false })
  }, [stop, updateState])
  const togglePlayer = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: !prev.isOpen }))
  }, [])

  const setContentTags = useCallback((tags: string | null) => {
    tagsRef.current = tags
    engine.setTags(tags)
    updateState({ genre: engine.getGenre() })
  }, [engine, updateState])

  useEffect(() => {
    const updateVoices = () => {
      engine.getProvider().getVoices()
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = updateVoices
    }
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null
      }
    }
  }, [engine])

  useEffect(() => {
    return () => { engine.stop() }
  }, [engine])

  return (
    <NarrationContext.Provider value={{
      state, play, pause, resume, stop, skipForward, skipBackward,
      setSpeed, setPitch, setVoice, openPlayer, closePlayer, togglePlayer,
      genre: engine.getGenre(), setContentTags,
    }}>
      {children}
    </NarrationContext.Provider>
  )
}

export function useNarration() {
  const ctx = useContext(NarrationContext)
  if (!ctx) throw new Error("useNarration must be used within NarrationProvider")
  return ctx
}
