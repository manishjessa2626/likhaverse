"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Sparkles } from "lucide-react"
import { PinGate } from "@/components/junior/PinGate"

interface JuniorProfile {
  id: string
  displayName: string
  avatar: string | null
  age: number
}

export default function JuniorEntryPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profiles, setProfiles] = useState<JuniorProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [entering, setEntering] = useState<JuniorProfile | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return }
    if (status !== "authenticated") return
    fetch("/api/family/junior")
      .then((r) => r.json())
      .then((data) => {
        setProfiles(Array.isArray(data) ? data : [])
        if (Array.isArray(data) && data.length === 1) {
          setEntering(data[0])
        }
      })
      .catch(() => setError("Failed to load profiles"))
      .finally(() => setLoading(false))
  }, [status, router])

  const handleEnter = async (profile: JuniorProfile) => {
    setEntering(null)
    try {
      const res = await fetch("/api/junior/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ juniorId: profile.id, action: "enter" }),
      })
      const data = await res.json()
      if (res.ok && data.redirect) {
        router.push(data.redirect)
      } else {
        setError("Failed to enter junior mode")
      }
    } catch {
      setError("Something went wrong")
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-purple-100 via-pink-50 to-orange-50">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-purple-400 border-t-purple-600" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-purple-100 via-pink-50 to-orange-50 p-4 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-900">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Sparkles size={40} className="mx-auto mb-3 text-purple-500" />
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400">
            LikhaVerse Junior
          </h1>
          <p className="mt-1 text-sm text-zinc-500">✨ Your imagination is your greatest superpower!</p>
        </div>

        {error && (
          <p className="mb-4 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600 text-center">{error}</p>
        )}

        {profiles.length === 0 ? (
          <div className="rounded-2xl border border-purple-200/60 bg-white/70 p-8 text-center backdrop-blur-sm dark:border-zinc-700/60 dark:bg-zinc-800/70">
            <p className="text-4xl mb-3">👶</p>
            <p className="text-zinc-500 dark:text-zinc-400 mb-1">No junior profiles</p>
            <p className="text-xs text-zinc-400">Create one in Settings → Junior Profiles</p>
          </div>
        ) : (
          <div className="space-y-3">
            {profiles.map((p) => (
              <button
                key={p.id}
                onClick={() => setEntering(p)}
                className="w-full rounded-2xl border border-purple-200/60 bg-white/70 p-4 text-left backdrop-blur-sm transition-all hover:border-purple-400 hover:shadow-lg dark:border-zinc-700/60 dark:bg-zinc-800/70"
              >
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{p.avatar || "😊"}</span>
                  <div>
                    <p className="text-lg font-bold text-zinc-800 dark:text-zinc-100">{p.displayName}</p>
                    <p className="text-sm text-zinc-500">{p.age} years old</p>
                  </div>
                  <span className="ml-auto text-purple-500 text-sm font-medium">Enter →</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {entering && (
        <PinGate
          title="Enter Junior Mode"
          message={`Enter Parent PIN to switch to ${entering.displayName}'s world`}
          onSuccess={() => handleEnter(entering)}
          onCancel={() => setEntering(null)}
        />
      )}
    </div>
  )
}
