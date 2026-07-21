"use client"

import { useState, useRef, useCallback } from "react"
import { Mic, Square, Play, Pause, Trash2, Upload, Music, Check } from "lucide-react"

export function VoiceRecorder({ onSave }: { onSave?: (url: string) => void }) {
  const [recording, setRecording] = useState(false)
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" })
        const url = URL.createObjectURL(blob)
        setRecordedUrl(url)
        if (audioRef.current) {
          audioRef.current.src = url
          audioRef.current.load()
        }

        // Upload to server
        setUploading(true)
        const formData = new FormData()
        formData.append("file", blob, `voiceover-${Date.now()}.webm`)
        try {
          const res = await fetch("/api/upload-audio", { method: "POST", body: formData })
          const data = await res.json()
          if (data.url) setUploadedUrl(data.url)
        } catch {}
        setUploading(false)

        // Clean up stream
        stream.getTracks().forEach((t) => t.stop())
        streamRef.current = null
      }

      mediaRecorder.start()
      setRecording(true)
    } catch (err) {
      console.error("Recording error:", err)
    }
  }, [])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop()
    }
    setRecording(false)
  }, [])

  function togglePlayback() {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play().catch(() => {})
    }
    setIsPlaying(!isPlaying)
  }

  function clearRecording() {
    setRecordedUrl(null)
    setUploadedUrl(null)
    setCurrentTime(0)
    setDuration(0)
    setIsPlaying(false)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ""
    }
  }

  function formatTime(s: number) {
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, "0")}`
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const formData = new FormData()
    formData.append("file", file)
    try {
      const res = await fetch("/api/upload-audio", { method: "POST", body: formData })
      const data = await res.json()
      if (data.url) {
        setUploadedUrl(data.url)
        setRecordedUrl(URL.createObjectURL(file))
        if (audioRef.current) {
          audioRef.current.src = URL.createObjectURL(file)
          audioRef.current.load()
        }
      }
    } catch {}
    setUploading(false)
  }

  function handleSave() {
    if (uploadedUrl && onSave) {
      onSave(uploadedUrl)
    }
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Mic size={20} className="text-amber-500" />
        <h3 className="text-sm font-semibold text-zinc-200">Voice Recorder</h3>
      </div>

      <audio
        ref={audioRef}
        onTimeUpdate={() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime)
            setDuration(audioRef.current.duration || 0)
          }
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) setDuration(audioRef.current.duration || 0)
        }}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />

      {/* Record / Stop */}
      <div className="flex items-center gap-3 mb-4">
        {!recording ? (
          <button
            onClick={startRecording}
            disabled={!!recordedUrl}
            className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50 transition-colors"
          >
            <Mic size={16} />
            Start Recording
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="flex items-center gap-2 rounded-lg bg-zinc-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-600 transition-colors animate-pulse"
          >
            <Square size={16} />
            Stop Recording
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleFileUpload}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 rounded-lg border border-zinc-700 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 disabled:opacity-50 transition-colors"
        >
          <Upload size={16} />
          {uploading ? "Uploading..." : "Upload Audio"}
        </button>
      </div>

      {recording && (
        <div className="flex items-center gap-2 mb-4">
          <span className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
          <span className="text-sm text-red-400">Recording...</span>
        </div>
      )}

      {/* Playback controls */}
      {recordedUrl && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlayback}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500 text-black hover:bg-amber-400 transition-colors"
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-zinc-400">{formatTime(currentTime)}</span>
                <span className="text-xs text-zinc-500">{formatTime(duration)}</span>
              </div>
              <input
                type="range"
                min={0}
                max={duration || 0}
                value={currentTime}
                onChange={(e) => {
                  const t = parseFloat(e.target.value)
                  setCurrentTime(t)
                  if (audioRef.current) audioRef.current.currentTime = t
                }}
                className="w-full h-1.5 rounded-full appearance-none bg-zinc-700 cursor-pointer accent-amber-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={clearRecording}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-red-400 hover:bg-red-900/20 transition-colors"
            >
              <Trash2 size={14} />
              Clear
            </button>

            {uploadedUrl && (
              <div className="flex items-center gap-2 ml-auto">
                <span className="flex items-center gap-1 text-xs text-green-400">
                  <Check size={12} />
                  Uploaded
                </span>
                <button
                  onClick={handleSave}
                  className="rounded-lg bg-amber-500 px-4 py-1.5 text-xs font-medium text-black hover:bg-amber-400 transition-colors"
                >
                  Use Voiceover
                </button>
              </div>
            )}

            {uploading && (
              <span className="text-xs text-zinc-500 ml-auto">Uploading...</span>
            )}
          </div>

          {uploadedUrl && (
            <div className="mt-2">
              <p className="text-[10px] text-zinc-500 mb-1">Audio URL:</p>
              <code className="block break-all rounded bg-zinc-800 px-2 py-1 text-[10px] text-zinc-400">{uploadedUrl}</code>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
