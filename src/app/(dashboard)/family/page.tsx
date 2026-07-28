"use client"

import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/Button"

interface JuniorProfile {
  id: string
  displayName: string
  avatar: string | null
  age: number
  readingLevel: string
  booksRead: number
  readingMinutes: number
  storiesWritten: number
  streak: number
}

const AVATARS = ["😊", "🦁", "🐯", "🐸", "🐼", "🐨", "🦊", "🐰", "🐭", "🐱", "🐶", "🦄"]
const READING_LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED"]

export default function FamilyPage() {
  const [juniors, setJuniors] = useState<JuniorProfile[]>([])
  const [hasPin, setHasPin] = useState<boolean | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [juniorRes, pinRes] = await Promise.all([
        fetch("/api/family/junior"),
        fetch("/api/family/pin"),
      ])
      if (juniorRes.ok) {
        const data = await juniorRes.json()
        setJuniors(data)
      }
      const pinData = await pinRes.json()
      setHasPin(pinData.exists)
    } catch {
      setJuniors([])
      setHasPin(false)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-400 border-t-purple-600" />
      </div>
    )
  }

  if (hasPin === false) {
    return <PinSetupForm onComplete={() => { setHasPin(true); fetchData() }} />
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-purple-900 dark:text-purple-300">LikhaVerse Junior</h1>
        <Button onClick={() => setShowCreate(true)}>+ Add Junior Profile</Button>
      </div>

      {juniors.length === 0 ? (
        <div className="rounded-2xl border border-purple-200/60 bg-white/70 p-12 text-center backdrop-blur-sm dark:border-zinc-700/60 dark:bg-zinc-800/70">
          <p className="text-5xl mb-3">👶</p>
          <p className="text-zinc-500 dark:text-zinc-400 mb-4">No junior profiles yet.</p>
          <Button onClick={() => setShowCreate(true)}>Create Junior Profile</Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {juniors.map((junior) => (
            <div key={junior.id} className="rounded-2xl border border-purple-200/60 bg-white/70 p-5 backdrop-blur-sm dark:border-zinc-700/60 dark:bg-zinc-800/70">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">{junior.avatar || "😊"}</span>
                <div>
                  <p className="font-bold text-purple-900 dark:text-purple-300">{junior.displayName}</p>
                  <p className="text-xs text-zinc-500">{junior.age} years old &middot; {junior.readingLevel.charAt(0) + junior.readingLevel.slice(1).toLowerCase()}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm mb-4">
                <div className="rounded-xl bg-purple-50 p-2 text-center dark:bg-purple-900/20">
                  <p className="font-bold text-purple-800 dark:text-purple-300">{junior.booksRead}</p>
                  <p className="text-[10px] text-zinc-500">Books</p>
                </div>
                <div className="rounded-xl bg-purple-50 p-2 text-center dark:bg-purple-900/20">
                  <p className="font-bold text-purple-800 dark:text-purple-300">{junior.readingMinutes}m</p>
                  <p className="text-[10px] text-zinc-500">Read</p>
                </div>
                <div className="rounded-xl bg-purple-50 p-2 text-center dark:bg-purple-900/20">
                  <p className="font-bold text-purple-800 dark:text-purple-300">{junior.storiesWritten}</p>
                  <p className="text-[10px] text-zinc-500">Written</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <CreateJuniorModal
          onClose={() => setShowCreate(false)}
          onCreated={() => fetchData()}
        />
      )}
    </div>
  )
}

function PinSetupForm({ onComplete }: { onComplete: () => void }) {
  const [pin, setPin] = useState("")
  const [confirmPin, setConfirmPin] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (pin !== confirmPin) {
      setError("PINs do not match")
      return
    }
    if (pin.length < 4 || pin.length > 6) {
      setError("PIN must be 4-6 digits")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/family/pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to set PIN")
      }
      onComplete()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to set PIN")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="rounded-2xl border border-purple-200/60 bg-white/70 p-6 backdrop-blur-sm dark:border-zinc-700/60 dark:bg-zinc-800/70">
        <h2 className="text-xl font-bold text-purple-900 dark:text-purple-300">Set Parent PIN</h2>
        <p className="mt-1 text-sm text-zinc-500">Create a 4-6 digit PIN to manage junior profiles</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">PIN</label>
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              className="mt-1 block w-full rounded-xl border border-purple-200/60 bg-white/70 px-3 py-2.5 text-center text-2xl tracking-widest outline-none focus:border-purple-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              placeholder="••••"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Confirm PIN</label>
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
              className="mt-1 block w-full rounded-xl border border-purple-200/60 bg-white/70 px-3 py-2.5 text-center text-2xl tracking-widest outline-none focus:border-purple-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              placeholder="••••"
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Setting PIN..." : "Set PIN"}
          </Button>
        </form>
      </div>
    </div>
  )
}

function CreateJuniorModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [displayName, setDisplayName] = useState("")
  const [age, setAge] = useState("")
  const [readingLevel, setReadingLevel] = useState("BEGINNER")
  const [avatar, setAvatar] = useState("😊")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    const ageNum = parseInt(age)
    if (!displayName || !age || ageNum < 3 || ageNum > 17) {
      setError("Name required, age must be 3-17")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/family/junior", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, age: ageNum, readingLevel, avatar }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to create profile")
      }
      onCreated()
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create profile")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white/95 p-6 shadow-elevated backdrop-blur-md dark:bg-zinc-900/95">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-purple-900 dark:text-purple-300">New Junior Profile</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 text-xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400">Name</label>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-purple-200/60 bg-white/70 px-3 py-2 text-sm outline-none focus:border-purple-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                placeholder="Child's name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400">Age (3-17)</label>
              <input
                type="number"
                min={3}
                max={17}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-purple-200/60 bg-white/70 px-3 py-2 text-sm outline-none focus:border-purple-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400">Reading Level</label>
            <select
              value={readingLevel}
              onChange={(e) => setReadingLevel(e.target.value)}
              className="mt-1 block w-full rounded-xl border border-purple-200/60 bg-white/70 px-3 py-2 text-sm outline-none focus:border-purple-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            >
              {READING_LEVELS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400">Avatar</label>
            <div className="mt-1 flex flex-wrap gap-2">
              {AVATARS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAvatar(a)}
                  className={`h-9 w-9 rounded-xl text-lg flex items-center justify-center transition-all ${avatar === a ? "bg-purple-200 ring-2 ring-purple-500 scale-110 dark:bg-purple-900/50" : "bg-purple-50 hover:bg-purple-100 dark:bg-zinc-800 dark:hover:bg-zinc-700"}`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Creating..." : "Create Profile"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
