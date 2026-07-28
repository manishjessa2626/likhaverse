"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Volume2, VolumeX, Pause, Play, SkipBack, SkipForward } from "lucide-react"

interface ReadToMeProps {
  text: string
}

export function ReadToMe({ text }: ReadToMeProps) {
  const [speaking, setSpeaking] = useState(false)
  const [paused, setPaused] = useState(false)
  const [supported, setSupported] = useState(true)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoice, setSelectedVoice] = useState<string>("")
  const [rate, setRate] = useState(0.8)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const [currentChar, setCurrentChar] = useState(0)

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setSupported(false)
      return
    }
    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices().filter((v) => v.lang.startsWith("en"))
      setVoices(v)
      if (v.length > 0) setSelectedVoice(v[0].name)
    }
    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices
    return () => { window.speechSynthesis.onvoiceschanged = null }
  }, [])

  useEffect(() => {
    if (!speaking && !paused) {
      setCurrentChar(0)
    }
  }, [speaking, paused])

  const stopSpeech = useCallback(() => {
    window.speechSynthesis.cancel()
    setSpeaking(false)
    setPaused(false)
    setCurrentChar(0)
  }, [])

  const speak = useCallback(() => {
    if (!supported || !text) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = rate
    utterance.pitch = 1
    utterance.volume = 1
    if (selectedVoice) {
      const voice = voices.find((v) => v.name === selectedVoice)
      if (voice) utterance.voice = voice
    }
    utterance.onend = () => { setSpeaking(false); setPaused(false); setCurrentChar(0) }
    utterance.onpause = () => setPaused(true)
    utterance.onresume = () => setPaused(false)
    utterance.onboundary = (e) => {
      if (e.name === "word") setCurrentChar(e.charIndex + e.charLength)
    }
    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
    setSpeaking(true)
    setPaused(false)
  }, [text, supported, rate, selectedVoice, voices])

  const togglePause = useCallback(() => {
    if (paused) {
      window.speechSynthesis.resume()
      setPaused(false)
    } else {
      window.speechSynthesis.pause()
      setPaused(true)
    }
  }, [paused])

  if (!supported) return null

  return (
    <div className="rounded-2xl border border-purple-200/60 bg-white/70 p-3 backdrop-blur-sm dark:border-zinc-700/60 dark:bg-zinc-800/70">
      <div className="flex items-center gap-2">
        <button
          onClick={speaking ? stopSpeech : speak}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
            speaking
              ? "bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"
              : "bg-purple-100 text-purple-600 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400"
          }`}
        >
          {speaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
          {speaking ? "Stop" : "Read To Me"}
        </button>

        {speaking && (
          <>
            <button onClick={togglePause} className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800">
              {paused ? <Play size={14} /> : <Pause size={14} />}
            </button>

            <select
              value={rate.toString()}
              onChange={(e) => setRate(parseFloat(e.target.value))}
              className="rounded-lg border border-purple-200/60 bg-white/50 px-1.5 py-0.5 text-[10px] text-zinc-600 dark:border-zinc-700/60 dark:bg-zinc-800/50 dark:text-zinc-400"
            >
              <option value="0.5">0.5x</option>
              <option value="0.8">0.8x</option>
              <option value="1">1x</option>
              <option value="1.2">1.2x</option>
            </select>

            {voices.length > 1 && (
              <select
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="hidden sm:block max-w-[120px] rounded-lg border border-purple-200/60 bg-white/50 px-1.5 py-0.5 text-[10px] text-zinc-600 truncate dark:border-zinc-700/60 dark:bg-zinc-800/50 dark:text-zinc-400"
              >
                {voices.map((v) => (
                  <option key={v.name} value={v.name}>{v.name}</option>
                ))}
              </select>
            )}
          </>
        )}
      </div>
    </div>
  )
}
