"use client"

import { useCallback, useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { BackButton } from "@/components/ui/BackButton"
import { Button } from "@/components/ui/Button"
import { ChevronDown, ChevronRight, Check, X, BookOpen, Trophy, HeartHandshake } from "lucide-react"

interface JuniorProfile {
  id: string
  displayName: string
  avatar: string | null
  age: number
  readingLevel: string
  theme: string
  booksRead: number
  readingMinutes: number
  storiesWritten: number
  streak: number
  archivedAt: string | null
}

interface Submission {
  id: string
  title: string
  content: string | null
  coverImage: string | null
  status: string
  parentFeedback: string | null
  submittedAt: string
  reviewedAt: string | null
}

interface ReadingProgress {
  storyId: string
  currentPage: number
  totalPages: number
  completed: boolean
  lastReadAt: string
}

const AVATARS = ["😊", "🦁", "🐯", "🐸", "🐼", "🐨", "🦊", "🐰", "🐭", "🐱", "🐶", "🦄", "🐙", "🦋", "🌈", "⭐"]
const READING_LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const

const levelLabels: Record<string, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
}

function JuniorForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: { displayName: string; age: number; readingLevel: string; avatar: string | null }
  onSave: (data: { displayName: string; age: number; readingLevel: string; avatar: string | null }) => Promise<void>
  onCancel: () => void
}) {
  const [displayName, setDisplayName] = useState(initial?.displayName ?? "")
  const [age, setAge] = useState(initial?.age.toString() ?? "")
  const [readingLevel, setReadingLevel] = useState(initial?.readingLevel ?? "BEGINNER")
  const [avatar, setAvatar] = useState(initial?.avatar ?? "😊")
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    const ageNum = parseInt(age)
    if (!displayName.trim()) { setError("Name is required"); return }
    if (!age || ageNum < 3 || ageNum > 17) { setError("Age must be 3–17"); return }
    setSaving(true)
    try {
      await onSave({ displayName: displayName.trim(), age: ageNum, readingLevel, avatar })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save")
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Avatar</label>
        <div className="flex flex-wrap gap-2">
          {AVATARS.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setAvatar(a)}
              className={`h-10 w-10 rounded-xl text-lg flex items-center justify-center transition-all ${
                avatar === a
                  ? "bg-purple-200 ring-2 ring-purple-500 scale-110 dark:bg-purple-900/50"
                  : "bg-purple-50 hover:bg-purple-100 dark:bg-zinc-800 dark:hover:bg-zinc-700"
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Name</label>
          <input value={displayName} onChange={(e) => setDisplayName(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-purple-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            placeholder="Child's name" autoFocus />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Age (3–17)</label>
          <input type="number" min={3} max={17} value={age} onChange={(e) => setAge(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-purple-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Reading Level</label>
        <div className="grid grid-cols-3 gap-2">
          {READING_LEVELS.map((l) => (
            <button key={l} type="button" onClick={() => setReadingLevel(l)}
              className={`rounded-xl border-2 px-3 py-2.5 text-sm text-left transition-all ${
                readingLevel === l
                  ? "border-purple-500 bg-purple-50 dark:bg-purple-900/30"
                  : "border-zinc-200 hover:border-purple-200 dark:border-zinc-700"
              }`}>
              <p className="font-medium text-zinc-800 dark:text-zinc-100">{levelLabels[l]}</p>
              <p className="text-[10px] text-zinc-500 mt-0.5">
                {l === "BEGINNER" ? "Simple words, short sentences" :
                 l === "INTERMEDIATE" ? "Growing vocabulary" : "Complex sentences"}
              </p>
            </button>
          ))}
        </div>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">Cancel</Button>
        <Button type="submit" className="flex-1" disabled={saving}>
          {saving ? "Saving..." : initial ? "Save Changes" : "Create Profile"}
        </Button>
      </div>
    </form>
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
    if (pin !== confirmPin) { setError("PINs do not match"); return }
    if (pin.length < 4 || pin.length > 6) { setError("PIN must be 4–6 digits"); return }
    setLoading(true)
    try {
      const res = await fetch("/api/family/pin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pin }) })
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || "Failed to set PIN") }
      onComplete()
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Failed to set PIN") }
    finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-zinc-500">Create a 4–6 digit PIN to protect junior profiles.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">PIN</label>
          <input type="password" inputMode="numeric" pattern="[0-9]*" maxLength={6} value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-center text-2xl tracking-[0.4em] outline-none focus:border-purple-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            placeholder="••••" autoFocus />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Confirm PIN</label>
          <input type="password" inputMode="numeric" pattern="[0-9]*" maxLength={6} value={confirmPin}
            onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-center text-2xl tracking-[0.4em] outline-none focus:border-purple-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            placeholder="••••" />
        </div>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" className="w-full" disabled={loading}>{loading ? "Setting PIN..." : "Set PIN"}</Button>
    </form>
  )
}

function PinVerifyDialog({ title, message, onSuccess, onCancel }: {
  title: string; message: string; onSuccess: () => void; onCancel: () => void
}) {
  const [pin, setPin] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (pin.length < 4) { setError("Enter your 4–6 digit PIN"); return }
    setLoading(true)
    try {
      const res = await fetch("/api/family/pin/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pin }) })
      const data = await res.json()
      if (data.verified) onSuccess()
      else setError("Incorrect PIN")
    } catch { setError("Something went wrong") }
    finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900">
        <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-100">{title}</h3>
        <p className="mt-1 text-sm text-zinc-500 mb-4">{message}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="password" inputMode="numeric" pattern="[0-9]*" maxLength={6} value={pin}
            onChange={(e) => { setPin(e.target.value.replace(/\D/g, "")); setError("") }}
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-center text-2xl tracking-[0.5em] outline-none focus:border-purple-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            placeholder="••••" autoFocus />
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}
          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">Cancel</Button>
            <Button type="submit" className="flex-1" disabled={loading}>{loading ? "Verifying..." : "Confirm"}</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function SubmissionsSection({ juniorId }: { juniorId: string }) {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState("")

  const fetchSubmissions = useCallback(async () => {
    try {
      const res = await fetch(`/api/junior/writing/submissions?juniorId=${juniorId}`)
      const data = await res.json()
      setSubmissions(Array.isArray(data) ? data : [])
    } catch {} finally { setLoading(false) }
  }, [juniorId])

  useEffect(() => { fetchSubmissions() }, [fetchSubmissions])

  const handleReview = async (id: string, status: string) => {
    await fetch(`/api/junior/writing/submissions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, parentFeedback: feedback || undefined }),
    })
    setFeedback("")
    fetchSubmissions()
  }

  const pending = submissions.filter((s) => s.status === "PENDING")

  if (loading) return <p className="text-xs text-zinc-400 py-2">Loading...</p>
  if (submissions.length === 0) return null

  return (
    <div className="mt-3 border-t border-zinc-100 pt-3 dark:border-zinc-800">
      <p className="text-[11px] font-semibold text-zinc-500 mb-2 flex items-center gap-1">
        <BookOpen size={12} />
        Submissions ({pending.length} pending / {submissions.length} total)
      </p>
      <div className="space-y-2">
        {submissions.slice(0, 10).map((s) => (
          <div key={s.id} className="rounded-lg border border-zinc-100 bg-zinc-50/50 p-3 dark:border-zinc-800 dark:bg-zinc-800/30">
            <div className="flex items-start gap-3">
              {s.coverImage && <img src={s.coverImage} alt="" className="h-10 w-8 rounded object-cover shrink-0" />}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-zinc-800 dark:text-zinc-100 truncate">{s.title}</p>
                <p className="text-[10px] text-zinc-500">
                  {new Date(s.submittedAt).toLocaleDateString()} · {s.content ? `${s.content.split(/\s+/).filter(Boolean).length} words` : ""}
                </p>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                s.status === "APPROVED" ? "bg-green-100 text-green-700" :
                s.status === "REJECTED" ? "bg-red-100 text-red-700" :
                "bg-yellow-100 text-yellow-700"
              }`}>{s.status}</span>
            </div>
            {s.status === "PENDING" && (
              <div className="mt-2 flex items-center gap-2">
                <input value={feedback} onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Feedback (optional)"
                  className="flex-1 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-[10px] outline-none focus:border-purple-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
                <button onClick={() => handleReview(s.id, "APPROVED")}
                  className="flex items-center gap-0.5 rounded-lg bg-green-500 px-2.5 py-1.5 text-[10px] font-medium text-white hover:bg-green-600">
                  <Check size={10} />Approve
                </button>
                <button onClick={() => handleReview(s.id, "REJECTED")}
                  className="flex items-center gap-0.5 rounded-lg bg-red-500 px-2.5 py-1.5 text-[10px] font-medium text-white hover:bg-red-600">
                  <X size={10} />Reject
                </button>
              </div>
            )}
            {s.parentFeedback && (
              <p className="mt-1.5 text-[10px] text-zinc-500 italic">Feedback: {s.parentFeedback}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function ProgressSection({ juniorId }: { juniorId: string }) {
  const [progress, setProgress] = useState<ReadingProgress[]>([])
  const [stories, setStories] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch(`/api/junior/reading/progress?juniorId=${juniorId}`).then((r) => r.json()),
      fetch("/api/stories").then((r) => r.json()),
    ]).then(([progressData, storiesData]) => {
      setProgress(Array.isArray(progressData) ? progressData : [])
      const list: { id: string; title: string }[] = storiesData.stories || storiesData || []
      const map: Record<string, string> = {}
      list.forEach((s) => { map[s.id] = s.title })
      setStories(map)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [juniorId])

  if (loading) return <p className="text-xs text-zinc-400 py-2">Loading...</p>
  if (progress.length === 0) return null

  const completed = progress.filter((p) => p.completed).length
  const totalPages = progress.reduce((s, p) => s + p.currentPage, 0)

  return (
    <div className="mt-3 border-t border-zinc-100 pt-3 dark:border-zinc-800">
      <p className="text-[11px] font-semibold text-zinc-500 mb-2 flex items-center gap-1">
        <Trophy size={12} />
        Reading Progress ({completed} completed · {totalPages} pages)
      </p>
      <div className="space-y-1.5">
        {progress.slice(0, 5).map((p) => (
          <div key={p.storyId} className="flex items-center gap-2 text-[11px]">
            <span className={`${p.completed ? "text-green-500" : "text-zinc-400"}`}>
              {p.completed ? "✅" : "📖"}
            </span>
            <span className="flex-1 text-zinc-700 dark:text-zinc-300 truncate">{stories[p.storyId] || "Unknown"}</span>
            <span className="text-zinc-400">
              {p.currentPage}/{p.totalPages} pages
            </span>
            <span className="text-[10px] text-zinc-400">{new Date(p.lastReadAt).toLocaleDateString()}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ShareStorySection({ juniorId, onShared }: { juniorId: string; onShared: () => void }) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [authorName, setAuthorName] = useState("")
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)

  const handleShare = async () => {
    if (!title.trim() || !authorName.trim()) return
    setSending(true)
    try {
      const res = await fetch("/api/junior/bookshelf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ juniorId, title: title.trim(), content, authorName: authorName.trim(), message: message.trim() || undefined }),
      })
      if (res.ok) { setDone(true); setTitle(""); setContent(""); setAuthorName(""); setMessage(""); onShared() }
    } catch {} finally { setSending(false) }
  }

  if (done) {
    return <p className="text-[11px] text-green-600 mt-2">✅ Story shared to bookshelf!</p>
  }

  return (
    <div className="mt-3 border-t border-zinc-100 pt-3 dark:border-zinc-800">
      <p className="text-[11px] font-semibold text-zinc-500 mb-2 flex items-center gap-1">
        <HeartHandshake size={12} />
        Share a Story to Bookshelf
      </p>
      <div className="space-y-2">
        <div className="flex gap-2">
          <input value={authorName} onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Who? (e.g. Mom, Grandpa, Ate)"
            className="w-2/5 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-[10px] outline-none focus:border-purple-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
          <input value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="Story title"
            className="flex-1 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-[10px] outline-none focus:border-purple-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
        </div>
        <textarea value={content} onChange={(e) => setContent(e.target.value)}
          placeholder="Write the story here..."
          rows={3}
          className="w-full rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-[10px] outline-none focus:border-purple-400 resize-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
        <input value={message} onChange={(e) => setMessage(e.target.value)}
          placeholder="A personal message (optional)"
          className="w-full rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-[10px] outline-none focus:border-purple-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
        <button onClick={handleShare} disabled={!title.trim() || !authorName.trim() || sending}
          className="rounded-lg bg-pink-500 px-3 py-1.5 text-[10px] font-medium text-white hover:bg-pink-600 disabled:opacity-50">
          {sending ? "Sharing..." : "Share to Bookshelf 💝"}
        </button>
      </div>
    </div>
  )
}

export default function JuniorSettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profiles, setProfiles] = useState<JuniorProfile[]>([])
  const [hasPin, setHasPin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [expandedProfile, setExpandedProfile] = useState<string | null>(null)

  const [showCreate, setShowCreate] = useState(false)
  const [editTarget, setEditTarget] = useState<JuniorProfile | null>(null)
  const [pinSetupOpen, setPinSetupOpen] = useState(false)
  const [archiveTarget, setArchiveTarget] = useState<JuniorProfile | null>(null)
  const [pinVerifyFor, setPinVerifyFor] = useState<"archive" | null>(null)
  const [resetPinOpen, setResetPinOpen] = useState(false)

  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const fetchData = useCallback(async () => {
    try {
      const [profileRes, pinRes] = await Promise.all([
        fetch("/api/family/junior"),
        fetch("/api/family/pin"),
      ])
      if (profileRes.ok) setProfiles(await profileRes.json())
      const pinData = await pinRes.json()
      setHasPin(pinData.exists)
    } catch { setProfiles([]) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return }
    if (status === "authenticated") fetchData()
  }, [status, router, fetchData])

  const handleCreate = async (data: { displayName: string; age: number; readingLevel: string; avatar: string | null }) => {
    const res = await fetch("/api/family/junior", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
    if (!res.ok) { const err = await res.json(); throw new Error(err.error || "Failed to create") }
    setMessage("Junior profile created!")
    setShowCreate(false)
    fetchData()
  }

  const handleUpdate = async (id: string, data: { displayName: string; age: number; readingLevel: string; avatar: string | null }) => {
    const res = await fetch(`/api/family/junior/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
    if (!res.ok) { const err = await res.json(); throw new Error(err.error || "Failed to update") }
    setMessage("Profile updated!")
    setEditTarget(null)
    fetchData()
  }

  const handleArchive = async (id: string) => {
    await fetch(`/api/family/junior/${id}`, { method: "DELETE" })
    setMessage("Profile archived")
    setArchiveTarget(null)
    setPinVerifyFor(null)
    fetchData()
  }

  const handleResetPin = async (pin: string) => {
    const res = await fetch("/api/family/pin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pin }) })
    if (!res.ok) { const err = await res.json(); throw new Error(err.error || "Failed to reset PIN") }
    setMessage("PIN updated!")
    setResetPinOpen(false)
  }

  if (status === "loading" || loading) {
    return <div className="mx-auto max-w-2xl px-4 py-24 text-center"><div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-zinc-400 border-t-purple-600" /></div>
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <BackButton fallbackHref="/settings/accounts" className="mb-4 inline-block" />
      <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">Parent Dashboard</h1>
      <p className="mt-1 text-sm text-zinc-500">Manage child profiles, review submissions, and track progress</p>

      {message && <p className="mt-4 rounded-xl bg-green-50 px-4 py-2.5 text-sm text-green-700 dark:bg-green-900/30 dark:text-green-400">{message}</p>}
      {error && <p className="mt-4 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">{error}</p>}

      {/* PIN Status */}
      <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-900">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-zinc-800 dark:text-zinc-100">Parent PIN {hasPin ? "✅ Set" : "❌ Not set"}</p>
            <p className="text-xs text-zinc-500 mt-0.5">{hasPin ? "Required to archive profiles and exit junior mode" : "Set a PIN to protect junior profiles"}</p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => hasPin ? setResetPinOpen(true) : setPinSetupOpen(true)}>
            {hasPin ? "Reset PIN" : "Set PIN"}
          </Button>
        </div>
        {pinSetupOpen && (
          <div className="mt-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
            <PinSetupForm onComplete={() => { setHasPin(true); setPinSetupOpen(false); setMessage("PIN set!") }} />
          </div>
        )}
        {resetPinOpen && (
          <div className="mt-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
            <p className="text-sm text-zinc-500 mb-3">Enter current PIN to reset it.</p>
            <PinVerifyDialog title="Verify Current PIN" message="Enter your current PIN to set a new one"
              onSuccess={() => { setPinVerifyFor(null); setResetPinOpen(false); setPinSetupOpen(true) }}
              onCancel={() => setResetPinOpen(false)} />
          </div>
        )}
      </div>

      {/* Profile List with Submissions & Progress */}
      {profiles.length > 0 && (
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">
              {profiles.length} {profiles.length === 1 ? "profile" : "profiles"}
            </h2>
          </div>
          {profiles.map((p) => (
            <div key={p.id} className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
              <div className="flex items-start gap-4">
                <span className="text-3xl shrink-0">{p.avatar || "😊"}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-zinc-800 dark:text-zinc-100">{p.displayName}</p>
                  <p className="text-xs text-zinc-500">{p.age} years old · {levelLabels[p.readingLevel] || p.readingLevel}</p>
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-500">
                    <span>📚 {p.booksRead} books</span>
                    <span>⏱️ {p.readingMinutes}m</span>
                    <span>✍️ {p.storiesWritten} stories</span>
                    <span>🔥 {p.streak} day streak</span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button variant="secondary" size="sm" onClick={() => setEditTarget(p)}>Edit</Button>
                  <Button variant="danger" size="sm" onClick={() => { setArchiveTarget(p); setPinVerifyFor("archive") }}>Archive</Button>
                </div>
              </div>

              {/* Expand button */}
              <button onClick={() => setExpandedProfile(expandedProfile === p.id ? null : p.id)}
                className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg border border-zinc-100 py-1.5 text-[10px] font-medium text-zinc-500 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50">
                {expandedProfile === p.id ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                {expandedProfile === p.id ? "Hide Details" : "View Submissions & Progress"}
              </button>

              {expandedProfile === p.id && (
                <>
                  <ShareStorySection juniorId={p.id} onShared={() => {}} />
                  <SubmissionsSection juniorId={p.id} />
                  <ProgressSection juniorId={p.id} />
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {profiles.length === 0 && !loading && (
        <div className="mt-8 rounded-xl border border-dashed border-zinc-300 bg-white/50 p-12 text-center dark:border-zinc-700 dark:bg-zinc-900/30">
          <p className="text-4xl mb-3">👶</p>
          <p className="text-zinc-500 dark:text-zinc-400 mb-1">No junior profiles yet</p>
          <p className="text-xs text-zinc-400 mb-4">Create a profile to get started</p>
        </div>
      )}

      <div className="mt-6">
        <Button onClick={() => setShowCreate(true)} className="w-full">+ Add Junior Profile</Button>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-100">New Junior Profile</h2>
              <button onClick={() => setShowCreate(false)} className="text-zinc-400 hover:text-zinc-600 text-xl leading-none">&times;</button>
            </div>
            <JuniorForm onSave={handleCreate} onCancel={() => setShowCreate(false)} />
          </div>
        </div>
      )}

      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-100">Edit Profile</h2>
              <button onClick={() => setEditTarget(null)} className="text-zinc-400 hover:text-zinc-600 text-xl leading-none">&times;</button>
            </div>
            <JuniorForm initial={{ displayName: editTarget.displayName, age: editTarget.age, readingLevel: editTarget.readingLevel, avatar: editTarget.avatar }}
              onSave={(data) => handleUpdate(editTarget.id, data)} onCancel={() => setEditTarget(null)} />
          </div>
        </div>
      )}

      {pinVerifyFor === "archive" && archiveTarget && (
        <PinVerifyDialog title="Archive Profile" message={`Enter your PIN to archive ${archiveTarget.displayName}'s profile`}
          onSuccess={() => handleArchive(archiveTarget.id)}
          onCancel={() => { setArchiveTarget(null); setPinVerifyFor(null) }} />
      )}
    </div>
  )
}
