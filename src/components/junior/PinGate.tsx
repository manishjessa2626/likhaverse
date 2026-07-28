"use client"

import { useState } from "react"
import { Shield } from "lucide-react"

interface PinGateProps {
  onSuccess: () => void
  onCancel: () => void
  title?: string
  message?: string
}

export function PinGate({ onSuccess, onCancel, title, message }: PinGateProps) {
  const [pin, setPin] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (pin.length < 4) { setError("Enter your 4-6 digit PIN"); return }
    setLoading(true)
    try {
      const res = await fetch("/api/family/pin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      })
      const data = await res.json()
      if (data.verified) {
        onSuccess()
      } else {
        setError("Incorrect PIN")
      }
    } catch {
      setError("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-sm rounded-2xl border border-purple-200/60 bg-white p-6 shadow-2xl dark:border-zinc-700/60 dark:bg-zinc-900">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/50">
            <Shield size={20} className="text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">{title || "Enter Parent PIN"}</h3>
            <p className="text-sm text-zinc-500">{message || "Enter your 4-6 digit PIN"}</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={pin}
            onChange={(e) => { setPin(e.target.value.replace(/\D/g, "")); setError("") }}
            placeholder="Enter PIN"
            autoFocus
            className="w-full rounded-xl border border-purple-200 bg-purple-50/50 px-4 py-3 text-center text-2xl tracking-[0.5em] text-zinc-800 placeholder:text-zinc-300 focus:border-purple-400 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-600"
          />
          {error && <p className="text-center text-sm text-red-500">{error}</p>}
          <div className="flex gap-3">
            <button type="button" onClick={onCancel} className="flex-1 rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800">
              Cancel
            </button>
            <button type="submit" disabled={pin.length < 4 || loading} className="flex-1 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-purple-500 disabled:opacity-50">
              {loading ? "Verifying..." : "Verify"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
