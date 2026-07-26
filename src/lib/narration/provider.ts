import type { Voice } from "./types"

export interface SpeakChunk {
  text: string
  rate: number
  pitch: number
  volume: number
  pauseAfterMs: number
  onStart?: () => void
  onEnd?: () => void
}

export interface NarrationProvider {
  name: string
  speak(chunks: SpeakChunk[]): Promise<void>
  stop(): void
  pause(): void
  resume(): void
  getVoices(): Voice[]
  isPaused: boolean
  isSpeaking: boolean
}
