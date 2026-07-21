"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

interface Props {
  open: boolean
  onClose: () => void
  nextUnlockTime: Date | null
}

export function WaitUnlockModal({ open, onClose, nextUnlockTime }: Props) {
  const [countdown, setCountdown] = useState("")

  useEffect(() => {
    if (!open || !nextUnlockTime) {
      setCountdown("")
      return
    }

    function tick() {
      const now = Date.now()
      const target = nextUnlockTime instanceof Date ? nextUnlockTime.getTime() : 0
      const diff = Math.max(0, target - now)

      if (diff <= 0) {
        setCountdown("Available now!")
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      setCountdown(
        `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      )
    }

    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [open, nextUnlockTime])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-zinc-900 border border-zinc-800 p-6 text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-5xl mb-4">⏳</div>
        <h2 className="text-xl font-bold text-white mb-2">
          To Be Continued...
        </h2>
        <p className="text-zinc-400 text-sm mb-2 leading-relaxed">
          Next episode unlocks in
        </p>
        <p className="text-2xl font-mono font-bold text-amber-400 mb-6">
          {countdown || "--:--:--"}
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-zinc-800 py-3 text-sm font-medium text-zinc-300 hover:bg-zinc-700 transition-colors"
          >
            Wait
          </button>
          <Link
            href="/premium"
            onClick={onClose}
            className="w-full rounded-xl bg-amber-500 py-3 text-sm font-bold text-black hover:bg-amber-400 transition-colors"
          >
            Go VIP
          </Link>
        </div>
      </div>
    </div>
  )
}
