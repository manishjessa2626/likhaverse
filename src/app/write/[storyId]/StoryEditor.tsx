"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { BackButton } from "@/components/ui/BackButton"
import { BookOpen, Plus, Trash2 } from "lucide-react"
import { useAmbience } from "@/hooks/useAmbience"
import { AmbienceOverlay } from "@/components/studio/AmbienceOverlay"
import { AmbienceControls } from "@/components/studio/AmbienceControls"

function Spinner({ className = "h-4 w-4" }: { className?: string }) {
  return <span className={`inline-block animate-spin rounded-full border-2 border-current border-t-transparent ${className}`} />
}

interface Chapter {
  id: string
  title: string
  content: string
  number: number
  wordCount: number
  coinCost: number
  updatedAt: Date
}

interface Season {
  id: string
  title: string
  number: number
}

interface Character {
  id: string
  name: string
  imageUrl: string | null
}

interface StoryData {
  id: string
  title: string
  description: string | null
  cover: string | null
  tags: string | null
  status: string
  accessType: string
  freePreviewChapters: number
  wordCount: number
  viewCount: number
  studioBadge: boolean
  completedBadge: boolean
  original: boolean
  chapters: Chapter[]
  seasons: Season[]
  characters: Character[]
  _count: { saves: number; comments: number }
}

function ChapterEditor({
  chapter,
  onSave,
  onDelete,
}: {
  chapter: Chapter
  onSave: (id: string, title: string, content: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  const [title, setTitle] = useState(chapter.title)
  const [content, setContent] = useState(chapter.content)
  const [coinCost, setCoinCost] = useState(chapter.coinCost)
  const [saving, setSaving] = useState(false)
  const [savingPrice, setSavingPrice] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    await onSave(chapter.id, title, content)
    setSaving(false)
  }

  const handlePriceChange = async () => {
    setSavingPrice(true)
    try {
      const res = await fetch("/api/chapters", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chapterId: chapter.id, coinCost }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
    } catch (e) {
      console.error(e)
    }
    setSavingPrice(false)
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
      <div className="mb-3 flex items-center gap-3">
        <span className="text-sm text-zinc-500">Ch. {chapter.number}</span>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-sm text-white placeholder-zinc-600 focus:border-amber-500 focus:outline-none"
          placeholder="Chapter title"
        />
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-medium text-black hover:bg-amber-400 disabled:opacity-50 transition-colors"
          >
            {saving ? (
              <span className="flex items-center gap-1"><Spinner className="h-3 w-3" /> Save</span>
            ) : "Save"}
          </button>
          <button
            onClick={async () => {
              if (confirm("Delete this chapter?")) {
                setDeleting(true)
                await onDelete(chapter.id)
              }
            }}
            disabled={deleting}
            className="rounded-lg bg-red-900/50 p-1.5 text-red-400 hover:bg-red-900/80 disabled:opacity-50 transition-colors"
          >
            {deleting ? <Spinner className="h-4 w-4" /> : <Trash2 size={16} />}
          </button>
        </div>
      </div>
      {/* Coin Cost Row */}
      <div className="mb-3 flex items-center gap-2">
        <label className="text-xs text-zinc-500">Unlock cost:</label>
        <input
          type="number"
          value={coinCost}
          onChange={(e) => setCoinCost(parseInt(e.target.value) || 0)}
          min={0}
          max={50}
          className="w-16 rounded-lg border border-zinc-800 bg-zinc-950 px-2 py-1 text-xs text-white text-center focus:border-amber-500 focus:outline-none"
        />
        <span className="text-[10px] text-zinc-600">coins</span>
        <button
          onClick={handlePriceChange}
          disabled={savingPrice}
          className="rounded bg-zinc-800 px-2 py-1 text-[10px] text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
        >
          {savingPrice ? "..." : "Set"}
        </button>
        {chapter.coinCost > 0 && (
          <span className="ml-auto text-[10px] text-amber-500/80">
            💎 {chapter.coinCost} coins to unlock
          </span>
        )}
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={15}
        className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 focus:border-amber-500 focus:outline-none resize-none font-mono leading-relaxed"
        placeholder="Write your chapter here..."
      />
      <p className="mt-1 text-right text-xs text-zinc-600">
        {content.trim().split(/\s+/).filter(Boolean).length} words
      </p>
    </div>
  )
}

export function StoryEditor({ story }: { story: StoryData }) {
  const router = useRouter()
  const [chapters, setChapters] = useState(story.chapters)
  const [status, setStatus] = useState(story.status)
  const [title, setTitle] = useState(story.title)
  const [description, setDescription] = useState(story.description ?? "")
  const [tags, setTags] = useState(story.tags ?? "")
  const [accessType, setAccessType] = useState(story.accessType)
  const [freePreviewChapters, setFreePreviewChapters] = useState(story.freePreviewChapters)
  const [savingMeta, setSavingMeta] = useState(false)
  const [addingChapter, setAddingChapter] = useState(false)
  const [error, setError] = useState("")
  const ambience = useAmbience()

  const storyTags = (story.tags ?? "").toLowerCase().split(",").map((t) => t.trim()).filter(Boolean)
  useEffect(() => {
    const genreMap: Record<string, string> = {
      fantasy: "fantasy", romance: "romance", horror: "horror",
      scifi: "scifi", "sci-fi": "scifi", mystery: "mystery",
      adventure: "adventure", comedy: "comedy", drama: "drama",
    }
    const matched = storyTags.map((t) => genreMap[t]).filter(Boolean) as string[]
    if (matched.length > 0 && ambience.state.genres.length === 0) {
      ambience.setGenres(matched as any)
    }
  }, [])

  const saveChapter = async (chapterId: string, chapterTitle: string, content: string) => {
    const res = await fetch("/api/chapters", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chapterId, title: chapterTitle, content }),
    })
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || "Failed to save chapter")
    }
    router.refresh()
  }

  const deleteChapter = async (chapterId: string) => {
    const res = await fetch(`/api/chapters`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chapterId }),
    })
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || "Failed to delete chapter")
    }
    setChapters((prev) => prev.filter((c) => c.id !== chapterId))
  }

  const addChapter = async () => {
    setAddingChapter(true)
    setError("")
    try {
      const res = await fetch("/api/chapters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storyId: story.id, title: "New Chapter", content: "" }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Failed to add chapter")
        return
      }
      const chapter = await res.json()
      setChapters((prev) => [...prev, { ...chapter, content: "", updatedAt: new Date() }])
      router.refresh()
    } catch {
      setError("Failed to add chapter")
    } finally {
      setAddingChapter(false)
    }
  }

  const saveMetadata = async () => {
    setSavingMeta(true)
    setError("")
    try {
      const res = await fetch(`/api/stories/${story.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description,
          tags,
          status,
          accessType,
          freePreviewChapters,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Failed to save")
      }
      router.refresh()
    } catch {
      setError("Failed to save")
    } finally {
      setSavingMeta(false)
    }
  }

  const publishStory = async () => {
    setSavingMeta(true)
    setError("")
    try {
      const newStatus = status === "PUBLISHED" || status === "COMPLETED" ? "DRAFT" : "PUBLISHED"
      const res = await fetch(`/api/stories/${story.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Failed to update status")
        return
      }
      setStatus(newStatus)
      router.refresh()
    } catch {
      setError("Failed to update status")
    } finally {
      setSavingMeta(false)
    }
  }

  return (
    <div
      className="min-h-screen text-zinc-100 transition-all duration-700"
      style={{ background: ambience.state.enabled && ambience.state.intensity > 0 ? undefined : "#000" }}
    >
      <AmbienceOverlay
        theme={ambience.activeTheme}
        enabled={ambience.state.enabled}
        intensity={ambience.state.intensity}
      />
      <AmbienceControls
        genres={ambience.state.genres}
        intensity={ambience.state.intensity}
        enabled={ambience.state.enabled}
        activeTheme={ambience.activeTheme}
        onToggle={ambience.toggle}
        onToggleGenre={ambience.toggleGenre}
        onSetIntensity={ambience.setIntensity}
      />
      <div className="relative z-10 mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <BackButton
            href="/write"
            className="inline-flex items-center text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            &larr; Back
          </BackButton>
          <div className="flex items-center gap-3">
            <button
              onClick={publishStory}
              disabled={savingMeta}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                status === "PUBLISHED" || status === "COMPLETED"
                  ? "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                  : "bg-green-600 text-white hover:bg-green-500"
              } disabled:opacity-50`}
            >
              {savingMeta ? (
                <span className="flex items-center gap-1.5"><Spinner /> Publishing...</span>
              ) : status === "PUBLISHED" || status === "COMPLETED" ? "Unpublish" : "Publish"}
            </button>
            <Link
              href={`/stories/${story.id}`}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-800 px-3 py-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <BookOpen size={16} />
              Preview
            </Link>
          </div>
        </div>

        <div className="mb-8">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-transparent text-3xl font-bold text-white placeholder-zinc-700 focus:outline-none"
            placeholder="Story Title"
          />
        </div>

        <div className="mb-8 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-500">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:border-amber-500 focus:outline-none resize-none"
                placeholder="Story description..."
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-500">Tags</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:border-amber-500 focus:outline-none"
                placeholder="fantasy, romance, adventure"
              />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-500">Access Type</label>
              <select
                value={accessType}
                onChange={(e) => setAccessType(e.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
              >
                <option value="FREE">Free</option>
                <option value="FREEMIUM">Freemium</option>
                <option value="PREMIUM">Premium</option>
              </select>
            </div>
            {accessType === "FREEMIUM" && (
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-500">Free Preview Chapters</label>
                <input
                  type="number"
                  value={freePreviewChapters}
                  onChange={(e) => setFreePreviewChapters(parseInt(e.target.value) || 1)}
                  min={1}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
            )}
            <div className="rounded-lg bg-zinc-900/50 p-4 text-sm">
              <div className="mb-2 flex justify-between text-zinc-500">
                <span>Chapters</span>
                <span className="text-white">{chapters.length}</span>
              </div>
              <div className="mb-2 flex justify-between text-zinc-500">
                <span>Total Words</span>
                <span className="text-white">{story.wordCount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Views</span>
                <span className="text-white">{story.viewCount.toLocaleString()}</span>
              </div>
            </div>
            <button
              onClick={saveMetadata}
              disabled={savingMeta}
              className="w-full rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-700 disabled:opacity-50 transition-colors"
            >
              {savingMeta ? (
                <span className="flex items-center justify-center gap-1.5"><Spinner /> Saving...</span>
              ) : "Save Metadata"}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-900/50 px-4 py-2 text-sm text-red-400">{error}</div>
        )}

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-200">Chapters</h2>
          <button
            onClick={addChapter}
            disabled={addingChapter}
            className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-sm font-medium text-black hover:bg-amber-400 disabled:opacity-50 transition-colors"
          >
            {addingChapter ? <Spinner /> : <Plus size={16} />}
            Add Chapter
          </button>
        </div>

        <div className="space-y-4">
          {chapters.map((chapter, i) => (
            <ChapterEditor
              key={chapter.id}
              chapter={chapter}
              onSave={saveChapter}
              onDelete={deleteChapter}
            />
          ))}
        </div>

        {chapters.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-zinc-600">
            <BookOpen size={48} className="mb-4" />
            <p className="mb-2 text-lg font-medium text-zinc-400">No chapters yet</p>
            <p className="mb-6 text-sm">Start writing your first chapter</p>
            <button
              onClick={addChapter}
              disabled={addingChapter}
              className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-black hover:bg-amber-400 disabled:opacity-50 transition-colors"
            >
              {addingChapter ? <Spinner /> : <Plus size={18} />}
              Add First Chapter
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
