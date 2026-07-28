"use client"

import { useParams, useRouter } from "next/navigation"
import { Settings, LogOut, Shield, User } from "lucide-react"
import { PinGate } from "@/components/junior/PinGate"
import { useState } from "react"

export default function JuniorSettingsPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [showExit, setShowExit] = useState(false)

  const handleExit = async () => {
    setShowExit(false)
    try {
      const res = await fetch("/api/junior/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "exit" }),
      })
      const data = await res.json()
      router.push(data.redirect || "/")
    } catch {
      router.push("/")
    }
  }

  return (
    <div className="mx-auto max-w-3xl p-4 md:p-8">
      <div className="mb-6 flex items-center gap-3">
        <Settings size={24} className="text-zinc-500" />
        <h1 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">Settings</h1>
      </div>

      <div className="space-y-3">
        <div className="rounded-2xl border border-purple-200/60 bg-white/70 p-5 backdrop-blur-sm dark:border-zinc-700/60 dark:bg-zinc-800/70">
          <div className="flex items-center gap-3">
            <User size={18} className="text-purple-500" />
            <div>
              <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">Profile Settings</p>
              <p className="text-xs text-zinc-500">Managed by parent</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-purple-200/60 bg-white/70 p-5 backdrop-blur-sm dark:border-zinc-700/60 dark:bg-zinc-800/70">
          <div className="flex items-center gap-3">
            <Shield size={18} className="text-green-500" />
            <div>
              <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">Safe Mode</p>
              <p className="text-xs text-zinc-500">Content filtering is active</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowExit(true)}
          className="w-full rounded-2xl border border-red-200/60 bg-red-50/70 p-5 text-left backdrop-blur-sm transition-all hover:bg-red-100/70 dark:border-red-900/60 dark:bg-red-900/20 dark:hover:bg-red-900/30"
        >
          <div className="flex items-center gap-3">
            <LogOut size={18} className="text-red-500" />
            <div>
              <p className="text-sm font-medium text-red-700 dark:text-red-400">Exit Junior Mode</p>
              <p className="text-xs text-red-500/70">Return to the adult site (requires Parent PIN)</p>
            </div>
          </div>
        </button>
      </div>

      {showExit && (
        <PinGate
          title="Exit Junior Mode"
          message="Enter Parent PIN to return to the main site"
          onSuccess={handleExit}
          onCancel={() => setShowExit(false)}
        />
      )}
    </div>
  )
}
