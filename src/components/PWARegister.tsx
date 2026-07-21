"use client"

import { useEffect, useState } from "react"
import { Download } from "lucide-react"

export function PWARegister() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstall, setShowInstall] = useState(false)

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => {})
        .catch(() => {})
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstall(true)
    }

    window.addEventListener("beforeinstallprompt", handler)
    window.addEventListener("appinstalled", () => {
      setShowInstall(false)
      setDeferredPrompt(null)
    })

    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  async function handleInstall() {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const result = await deferredPrompt.userChoice
    if (result.outcome === "accepted") setShowInstall(false)
    setDeferredPrompt(null)
  }

  if (!showInstall) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md">
      <div className="flex items-center gap-3 rounded-xl border border-amber-500/30 bg-zinc-900 p-4 shadow-2xl">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
          <Download size={20} className="text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-zinc-100">Install LikhaVerse</p>
          <p className="text-xs text-zinc-500">Add to your home screen for the best experience</p>
        </div>
        <button
          onClick={handleInstall}
          className="shrink-0 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-black hover:bg-amber-400 transition-colors"
        >
          Install
        </button>
        <button
          onClick={() => setShowInstall(false)}
          className="shrink-0 text-xs text-zinc-500 hover:text-zinc-300"
        >
          Dismiss
        </button>
      </div>
    </div>
  )
}
