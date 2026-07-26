import type { NarrationProvider, SpeakChunk } from "../provider"
import type { Voice } from "../types"

export class WebSpeechProvider implements NarrationProvider {
  name = "Web Speech API"
  isPaused = false
  isSpeaking = false

  private currentUtterance: SpeechSynthesisUtterance | null = null
  private chunkQueue: SpeakChunk[] = []
  private currentIndex = 0
  private cancelled = false

  private resolvePromise: (() => void) | null = null

  speak(chunks: SpeakChunk[]): Promise<void> {
    this.stop()
    this.chunkQueue = [...chunks]
    this.currentIndex = 0
    this.cancelled = false
    this.isSpeaking = true

    return new Promise((resolve) => {
      this.resolvePromise = resolve
      this.speakNext()
    })
  }

  private speakNext() {
    if (this.cancelled || this.currentIndex >= this.chunkQueue.length) {
      this.isSpeaking = false
      this.resolvePromise?.()
      return
    }

    const chunk = this.chunkQueue[this.currentIndex]
    const utterance = new SpeechSynthesisUtterance(chunk.text)
    utterance.rate = chunk.rate
    utterance.pitch = chunk.pitch
    utterance.volume = 1

    if ((window as any).__lvNarratorVoice) {
      const voiceURI = (window as any).__lvNarratorVoice
      const voices = window.speechSynthesis.getVoices()
      const found = voices.find((v: SpeechSynthesisVoice) => v.voiceURI === voiceURI)
      if (found) utterance.voice = found
    }

    const pauseMs = chunk.pauseAfterMs

    utterance.onend = () => {
      this.currentIndex++
      if (pauseMs > 0 && this.currentIndex < this.chunkQueue.length) {
        setTimeout(() => this.speakNext(), pauseMs)
      } else {
        this.speakNext()
      }
    }

    utterance.onerror = () => {
      this.currentIndex++
      this.speakNext()
    }

    chunk.onStart?.()
    this.currentUtterance = utterance
    window.speechSynthesis.speak(utterance)
  }

  stop() {
    this.cancelled = true
    this.isSpeaking = false
    window.speechSynthesis.cancel()
    this.currentUtterance = null
    this.resolvePromise?.()
  }

  pause() {
    this.isPaused = true
    window.speechSynthesis.pause()
  }

  resume() {
    this.isPaused = false
    window.speechSynthesis.resume()
  }

  getVoices(): Voice[] {
    if (typeof window === "undefined") return []
    return window.speechSynthesis.getVoices().map((v) => ({
      id: v.voiceURI,
      name: v.name,
      lang: v.lang,
      isDefault: v.default,
      provider: "web-speech",
    }))
  }

  setVoice(voiceURI: string | null) {
    ;(window as any).__lvNarratorVoice = voiceURI
  }
}
