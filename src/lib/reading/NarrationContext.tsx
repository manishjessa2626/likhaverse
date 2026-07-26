"use client"

import { createContext, useContext, useState, useRef, useCallback, useEffect, type ReactNode } from "react"

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
}

interface NarrationState {
  isPlaying: boolean
  isPaused: boolean
  currentSentence: number
  totalSentences: number
  sentences: string[]
  speed: number
  voices: SpeechSynthesisVoice[]
  selectedVoice: string | null
  isSupported: boolean
}

interface NarrationContextType {
  state: NarrationState
  play: (content: string) => void
  pause: () => void
  resume: () => void
  stop: () => void
  skipForward: () => void
  skipBackward: () => void
  setSpeed: (speed: number) => void
  setVoice: (voiceURI: string) => void
}

const NarrationContext = createContext<NarrationContextType | null>(null)

let globalVoices: SpeechSynthesisVoice[] = []
if (typeof window !== "undefined" && window.speechSynthesis) {
  globalVoices = window.speechSynthesis.getVoices()
  window.speechSynthesis.onvoiceschanged = () => {
    globalVoices = window.speechSynthesis.getVoices()
  }
}

export function NarrationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<NarrationState>({
    isPlaying: false,
    isPaused: false,
    currentSentence: 0,
    totalSentences: 0,
    sentences: [],
    speed: 1,
    voices: [],
    selectedVoice: null,
    isSupported: typeof window !== "undefined" && "speechSynthesis" in window,
  })

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const contentRef = useRef<string>("")
  const sentenceIdxRef = useRef(0)

  const stopSynth = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
  }, [])

  const speakSentence = useCallback((sentences: string[], idx: number, speed: number, voiceURI: string | null) => {
    if (idx >= sentences.length) {
      setState((prev) => ({ ...prev, isPlaying: false, isPaused: false, currentSentence: 0 }))
      return
    }

    sentenceIdxRef.current = idx
    setState((prev) => ({ ...prev, currentSentence: idx, isPaused: false, isPlaying: true }))

    const utterance = new SpeechSynthesisUtterance(sentences[idx])
    utterance.rate = speed
    utterance.pitch = 1

    if (voiceURI) {
      const found = globalVoices.find((v) => v.voiceURI === voiceURI)
      if (found) utterance.voice = found
    }

    utterance.onend = () => {
      if (sentenceIdxRef.current < sentences.length - 1) {
        speakSentence(sentences, idx + 1, speed, voiceURI)
      } else {
        setState((prev) => ({ ...prev, isPlaying: false, isPaused: false, currentSentence: 0 }))
      }
    }

    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }, [])

  const play = useCallback((content: string) => {
    stopSynth()
    contentRef.current = content
    const sentences = splitSentences(content)
    if (sentences.length === 0) return

    setState((prev) => ({
      ...prev,
      sentences,
      totalSentences: sentences.length,
      currentSentence: 0,
      isPaused: false,
      isPlaying: true,
    }))

    sentenceIdxRef.current = 0
    speakSentence(sentences, 0, state.speed, state.selectedVoice)
  }, [state.speed, state.selectedVoice, stopSynth, speakSentence])

  const pause = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.pause()
    }
    setState((prev) => ({ ...prev, isPaused: true }))
  }, [])

  const resume = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.resume()
    }
    setState((prev) => ({ ...prev, isPaused: false }))
  }, [])

  const stop = useCallback(() => {
    stopSynth()
    setState((prev) => ({ ...prev, isPlaying: false, isPaused: false, currentSentence: 0 }))
  }, [stopSynth])

  const skipForward = useCallback(() => {
    if (!contentRef.current) return
    stopSynth()
    const sentences = splitSentences(contentRef.current)
    const next = Math.min(sentenceIdxRef.current + 3, sentences.length - 1)
    setState((prev) => ({ ...prev, sentences, totalSentences: sentences.length }))
    speakSentence(sentences, next, state.speed, state.selectedVoice)
  }, [state.speed, state.selectedVoice, stopSynth, speakSentence])

  const skipBackward = useCallback(() => {
    if (!contentRef.current) return
    stopSynth()
    const sentences = splitSentences(contentRef.current)
    const prev = Math.max(sentenceIdxRef.current - 3, 0)
    setState((prev) => ({ ...prev, sentences, totalSentences: sentences.length }))
    speakSentence(sentences, prev, state.speed, state.selectedVoice)
  }, [state.speed, state.selectedVoice, stopSynth, speakSentence])

  const setSpeed = useCallback((speed: number) => {
    setState((prev) => ({ ...prev, speed }))
  }, [])

  const setVoice = useCallback((voiceURI: string) => {
    setState((prev) => ({ ...prev, selectedVoice: voiceURI }))
  }, [])

  useEffect(() => {
    const updateVoices = () => {
      setState((prev) => ({ ...prev, voices: globalVoices }))
    }
    updateVoices()
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = updateVoices
    }
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null
      }
    }
  }, [])

  useEffect(() => {
    return () => {
      stopSynth()
    }
  }, [stopSynth])

  return (
    <NarrationContext.Provider value={{ state, play, pause, resume, stop, skipForward, skipBackward, setSpeed, setVoice }}>
      {children}
    </NarrationContext.Provider>
  )
}

export function useNarration() {
  const ctx = useContext(NarrationContext)
  if (!ctx) throw new Error("useNarration must be used within NarrationProvider")
  return ctx
}
