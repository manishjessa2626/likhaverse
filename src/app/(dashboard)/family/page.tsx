"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/Button"

interface JuniorReadingProgress {
  id: string
  booksRead: number
  readingTimeMinutes: number
  storiesWritten: number
  currentBookTitle: string | null
  currentBookProgress: number | null
}

interface JuniorProfile {
  id: string
  name: string
  avatar: string | null
  age: number
  readingLevel: string
  favoriteGenres: string | null
  readingProgress: JuniorReadingProgress[]
}

const AVATARS = ["😊", "🦁", "🐯", "🐸", "🐼", "🐨", "🦊", "🐰", "🐭", "🐱", "🐶", "🦄"]
const READING_LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED"]
const GENRE_OPTIONS = ["Adventure", "Fantasy", "Animals", "Friendship", "Fairy Tales", "Educational", "Bedtime", "Science"]

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
    <div className="mx-auto max-w-md">
      <div className="glass-card rounded-xl p-6">
        <h2 className="text-xl font-bold text-purple-900">Set Parent PIN</h2>
        <p className="mt-1 text-sm text-zinc-500">Create a 4-6 digit PIN to protect parent settings</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700">PIN</label>
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              className="mt-1 block w-full rounded-lg border border-purple-200/60 bg-white/70 px-3 py-2 text-center text-2xl tracking-widest text-purple-900 outline-none focus:border-purple-400"
              placeholder="••••"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700">Confirm PIN</label>
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
              className="mt-1 block w-full rounded-lg border border-purple-200/60 bg-white/70 px-3 py-2 text-center text-2xl tracking-widest text-purple-900 outline-none focus:border-purple-400"
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
  const [name, setName] = useState("")
  const [age, setAge] = useState("")
  const [readingLevel, setReadingLevel] = useState("BEGINNER")
  const [favoriteGenres, setFavoriteGenres] = useState<string[]>([])
  const [avatar, setAvatar] = useState("😊")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const toggleGenre = (genre: string) => {
    setFavoriteGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre],
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    const ageNum = parseInt(age)
    if (!name || !age || ageNum < 4 || ageNum > 12) {
      setError("Name required, age must be 4-12")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/family/junior", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          age: ageNum,
          readingLevel,
          favoriteGenres: favoriteGenres.join(","),
          avatar,
        }),
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
      <div className="animate-slideUp w-full max-w-lg rounded-2xl bg-white/95 backdrop-blur-md p-6 shadow-elevated">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-purple-900">New Junior Profile</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 text-xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-600">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-purple-200/60 bg-white/70 px-3 py-2 text-sm outline-none focus:border-purple-400"
                placeholder="Child's name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-600">Age (4-12)</label>
              <input
                type="number"
                min={4}
                max={12}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-purple-200/60 bg-white/70 px-3 py-2 text-sm outline-none focus:border-purple-400"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-600">Reading Level</label>
            <select
              value={readingLevel}
              onChange={(e) => setReadingLevel(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-purple-200/60 bg-white/70 px-3 py-2 text-sm outline-none focus:border-purple-400"
            >
              {READING_LEVELS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-600">Avatar</label>
            <div className="mt-1 flex flex-wrap gap-2">
              {AVATARS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAvatar(a)}
                  className={`h-9 w-9 rounded-lg text-lg flex items-center justify-center transition-all ${avatar === a ? "bg-purple-200 ring-2 ring-purple-500 scale-110" : "bg-purple-50 hover:bg-purple-100"}`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-600">Favorite Genres</label>
            <div className="mt-1 flex flex-wrap gap-2">
              {GENRE_OPTIONS.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => toggleGenre(g)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${favoriteGenres.includes(g) ? "bg-purple-600 text-white" : "bg-purple-100 text-purple-700 hover:bg-purple-200"}`}
                >
                  {g}
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
        fetch("/api/family/pin/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pin: "skip" }) }),
      ])
      if (juniorRes.ok) {
        const data = await juniorRes.json()
        setJuniors(data)
      }
      setHasPin(pinRes.status !== 404)
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
    return (
      <div className="mx-auto max-w-5xl px-4 py-12">
        <h1 className="mb-8 text-2xl font-bold text-purple-900">Family</h1>
        <PinSetupForm onComplete={() => { setHasPin(true); fetchData() }} />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-purple-900">Family</h1>
        <Button onClick={() => setShowCreate(true)}>+ Add Junior Profile</Button>
      </div>

      {juniors.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center">
          <p className="text-5xl mb-3">👶</p>
          <p className="text-zinc-500 mb-4">No junior profiles yet. Add one to get started!</p>
          <Button onClick={() => setShowCreate(true)}>Add Junior Profile</Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {juniors.map((junior) => (
            <div key={junior.id} className="glass-card rounded-xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{junior.avatar || "😊"}</span>
                <div>
                  <p className="font-bold text-purple-900">{junior.name}</p>
                  <p className="text-xs text-zinc-500">{junior.age} years old &middot; {junior.readingLevel}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                <div className="rounded-lg bg-purple-50 p-2 text-center">
                  <p className="font-bold text-purple-800">{junior.readingProgress[0]?.booksRead || 0}</p>
                  <p className="text-xs text-zinc-500">Books</p>
                </div>
                <div className="rounded-lg bg-purple-50 p-2 text-center">
                  <p className="font-bold text-purple-800">{junior.readingProgress[0]?.readingTimeMinutes || 0}m</p>
                  <p className="text-xs text-zinc-500">Reading</p>
                </div>
                <div className="rounded-lg bg-purple-50 p-2 text-center">
                  <p className="font-bold text-purple-800">{junior.readingProgress[0]?.storiesWritten || 0}</p>
                  <p className="text-xs text-zinc-500">Written</p>
                </div>
                <div className="rounded-lg bg-purple-50 p-2 text-center">
                  <p className="font-bold text-purple-800">-</p>
                  <p className="text-xs text-zinc-500">Badges</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Link href={`/family/junior/${junior.id}`} className="flex-1">
                  <Button variant="secondary" size="sm" className="w-full">View Dashboard</Button>
                </Link>
                <Link href={`/family/junior/${junior.id}/home`} className="flex-1">
                  <Button size="sm" className="w-full">Junior Home</Button>
                </Link>
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
