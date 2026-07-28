"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import { PenLine, Save, Trash2, Image, BookUp, Clock, FileText, ChevronDown } from "lucide-react"
import { ChapterEditor, type Chapter } from "@/components/junior/ChapterEditor"

interface SavedDraft {
  id: string
  title: string
  wordCount: number
  fontSize: number
  updatedAt: string
  createdAt: string
  coverImage: string | null
}

const WORDS_OF_ENCOURAGEMENT = [
  "Keep going, you're doing great! ✨",
  "Every great story starts with a single word! 🌟",
  "Your imagination is amazing! 💫",
  "Wow, you're on fire! 🔥",
  "You're a real storyteller! 📖",
]

export default function JuniorWritePage() {
  const params = useParams()
  const id = params.id as string
  const [title, setTitle] = useState("")
  const [text, setText] = useState("")
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [useChapters, setUseChapters] = useState(false)
  const [fontSize, setFontSize] = useState(24)
  const [draftId, setDraftId] = useState<string | null>(null)
  const [coverImage, setCoverImage] = useState<string | null>(null)
  const [illustrations, setIllustrations] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [drafts, setDrafts] = useState<SavedDraft[]>([])
  const [showDrafts, setShowDrafts] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const autosaveRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [encouragement] = useState(() => WORDS_OF_ENCOURAGEMENT[Math.floor(Math.random() * WORDS_OF_ENCOURAGEMENT.length)])

  const wordCount = (() => {
    if (useChapters && chapters.length > 0) {
      return chapters.reduce((sum, ch) => sum + ch.content.split(/\s+/).filter(Boolean).length, 0)
    }
    return text.split(/\s+/).filter(Boolean).length
  })()

  const loadDrafts = useCallback(async () => {
    try {
      const res = await fetch(`/api/junior/writing/drafts?juniorId=${id}`)
      const data = await res.json()
      setDrafts(Array.isArray(data) ? data : [])
    } catch {}
  }, [id])

  const saveDraft = useCallback(async (auto = false) => {
    if (saving) return
    setSaving(true)
    try {
      const content = useChapters ? undefined : text
      const chaptersData = useChapters ? chapters : undefined
      const res = await fetch("/api/junior/writing/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          juniorId: id,
          id: draftId,
          title: title || "Untitled",
          content,
          chapters: chaptersData,
          coverImage,
          fontSize,
        }),
      })
      const data = await res.json()
      if (!draftId || !auto) setDraftId(data.id)
      if (!auto) { setSaved(true); setTimeout(() => setSaved(false), 2000) }
      loadDrafts()
    } catch {} finally {
      setSaving(false)
    }
  }, [saving, id, draftId, title, text, chapters, useChapters, coverImage, fontSize, loadDrafts])

  useEffect(() => {
    autosaveRef.current = setInterval(() => {
      if (title || text || chapters.length > 0) saveDraft(true)
    }, 30000)
    return () => { if (autosaveRef.current) clearInterval(autosaveRef.current) }
  }, [title, text, chapters, saveDraft])

  useEffect(() => { loadDrafts() }, [loadDrafts])

  const loadDraft = async (draft: SavedDraft) => {
    try {
      const res = await fetch(`/api/junior/writing/drafts/${draft.id}?juniorId=${id}`)
      const data = await res.json()
      setDraftId(data.id)
      setTitle(data.title)
      setFontSize(data.fontSize || 24)
      setCoverImage(data.coverImage || null)
      if (data.chapters && Array.isArray(data.chapters)) {
        setChapters(data.chapters)
        setUseChapters(true)
        setText("")
      } else {
        setText(data.content || "")
        setUseChapters(false)
        setChapters([])
      }
      setShowDrafts(false)
    } catch {}
  }

  const deleteDraft = async (draftId: string) => {
    try {
      await fetch(`/api/junior/writing/drafts/${draftId}?juniorId=${id}`, { method: "DELETE" })
      loadDrafts()
    } catch {}
  }

  const handleIllustrationUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append("file", file)
    try {
      const res = await fetch("/api/junior/uploads", { method: "POST", body: formData })
      const data = await res.json()
      if (data.url) setIllustrations((prev) => [...prev, data.url])
    } catch {} finally {
      e.target.value = ""
    }
  }

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append("file", file)
    try {
      const res = await fetch("/api/junior/uploads", { method: "POST", body: formData })
      const data = await res.json()
      if (data.url) setCoverImage(data.url)
    } catch {} finally {
      e.target.value = ""
    }
  }

  const handlePublish = async () => {
    if (!title.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/junior/writing/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          juniorId: id,
          draftId,
          title: title.trim(),
          content: useChapters ? undefined : text,
          chapters: useChapters ? chapters : undefined,
          coverImage,
        }),
      })
      if (res.ok) setSubmitted(true)
    } catch {} finally {
      setSubmitting(false)
    }
  }

  const newDraft = () => {
    setDraftId(null)
    setTitle("")
    setText("")
    setChapters([])
    setUseChapters(false)
    setCoverImage(null)
    setIllustrations([])
    setSubmitted(false)
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-3xl p-4 md:p-8">
        <div className="rounded-2xl border border-purple-200/60 bg-white/80 p-10 text-center backdrop-blur-sm dark:border-zinc-700/60 dark:bg-zinc-800/80">
          <p className="text-6xl mb-4">🎉</p>
          <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 mb-2">Submitted for Review!</h2>
          <p className="text-sm text-zinc-500 mb-6">Your parent will review it soon. Keep writing!</p>
          <div className="flex justify-center gap-3">
            <button onClick={newDraft}
              className="rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-purple-500">
              Write Another
            </button>
            <button onClick={() => setSubmitted(false)}
              className="rounded-xl border border-purple-200/60 px-5 py-2.5 text-sm font-medium text-zinc-600 hover:bg-white dark:border-zinc-700/60 dark:text-zinc-400">
              View Submission
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl p-4 md:p-8">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <PenLine size={24} className="text-pink-500" />
          <h1 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">Write a Story</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowDrafts(!showDrafts)}
            className="flex items-center gap-1 rounded-xl border border-purple-200/60 bg-white/70 px-3 py-1.5 text-xs font-medium text-zinc-600 backdrop-blur-sm hover:bg-white dark:border-zinc-700/60 dark:bg-zinc-800/70 dark:text-zinc-400">
            <FileText size={14} />
            Drafts ({drafts.length})
          </button>
          <select value={fontSize.toString()} onChange={(e) => setFontSize(parseInt(e.target.value))}
            className="rounded-xl border border-purple-200/60 bg-white/70 px-2 py-1.5 text-xs text-zinc-600 dark:border-zinc-700/60 dark:bg-zinc-800/70 dark:text-zinc-400">
            <option value="18">S</option>
            <option value="24">M</option>
            <option value="32">L</option>
            <option value="40">XL</option>
          </select>
        </div>
      </div>

      <p className="mb-4 text-xs text-purple-500 italic">{encouragement}</p>

      {showDrafts && (
        <div className="mb-4 rounded-2xl border border-purple-200/60 bg-white/80 p-4 backdrop-blur-sm dark:border-zinc-700/60 dark:bg-zinc-800/80">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100">Saved Drafts</h3>
            <button onClick={() => setShowDrafts(false)} className="text-xs text-zinc-400 hover:text-zinc-600">Close</button>
          </div>
          {drafts.length === 0 ? (
            <p className="text-xs text-zinc-400 text-center py-4">No drafts yet</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {drafts.map((d) => (
                <div key={d.id} className="flex items-center gap-3 rounded-xl border border-purple-200/60 bg-purple-50/50 p-3 dark:border-zinc-700/60 dark:bg-zinc-800/50">
                  <Clock size={14} className="text-zinc-400 shrink-0" />
                  <div className="flex-1 min-w-0" onClick={() => loadDraft(d)}>
                    <p className="text-xs font-medium text-zinc-800 dark:text-zinc-100 truncate cursor-pointer hover:text-purple-600">{d.title}</p>
                    <p className="text-[10px] text-zinc-500">{d.wordCount} words · {new Date(d.updatedAt).toLocaleDateString()}</p>
                  </div>
                  <button onClick={() => deleteDraft(d.id)} className="text-zinc-400 hover:text-red-500 p-1">
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <input
        type="text"
        placeholder="Give your story a title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ fontSize: `${Math.min(fontSize + 8, 48)}px` }}
        className="w-full rounded-xl border border-purple-200/60 bg-white/70 px-4 py-3 font-bold text-zinc-800 placeholder:text-zinc-300 focus:border-purple-400 focus:outline-none dark:border-zinc-700/60 dark:bg-zinc-800/70 dark:text-zinc-100 mb-4"
      />

      <div className="mb-4 flex items-center gap-2">
        <button
          onClick={() => { setUseChapters(!useChapters); if (!useChapters && text) { setChapters([{ title: "Chapter 1", content: text }]); setText("") } }}
          className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition-all ${
            useChapters
              ? "border-purple-400 bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300"
              : "border-purple-200/60 bg-white/70 text-zinc-600 dark:border-zinc-700/60 dark:bg-zinc-800/70 dark:text-zinc-400"
          }`}
        >
          Chapters
        </button>
        <label className="flex cursor-pointer items-center gap-1 rounded-xl border border-purple-200/60 bg-white/70 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-white dark:border-zinc-700/60 dark:bg-zinc-800/70 dark:text-zinc-400">
          <Image size={12} />
          {coverImage ? "Change Cover" : "Add Cover"}
          <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
        </label>
        <label className="flex cursor-pointer items-center gap-1 rounded-xl border border-purple-200/60 bg-white/70 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-white dark:border-zinc-700/60 dark:bg-zinc-800/70 dark:text-zinc-400">
          <Image size={12} />
          Add Illustration
          <input type="file" accept="image/*" onChange={handleIllustrationUpload} className="hidden" />
        </label>
      </div>

      {coverImage && (
        <div className="mb-4 flex justify-center">
          <div className="relative">
            <img src={coverImage} alt="Cover" className="h-40 w-32 rounded-xl object-cover shadow-md" />
            <button onClick={() => setCoverImage(null)}
              className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white">
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      )}

      {useChapters ? (
        <ChapterEditor chapters={chapters} onChange={setChapters} fontSize={fontSize} />
      ) : (
        <textarea
          placeholder="Once upon a time..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={16}
          style={{ fontSize: `${fontSize}px` }}
          className="w-full rounded-xl border border-purple-200/60 bg-white/70 p-4 text-zinc-700 placeholder:text-zinc-300 focus:border-purple-400 focus:outline-none dark:border-zinc-700/60 dark:bg-zinc-800/70 dark:text-zinc-300 leading-relaxed resize-y"
        />
      )}

      {illustrations.length > 0 && (
        <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
          {illustrations.map((url, i) => (
            <div key={i} className="relative shrink-0">
              <img src={url} alt={`Illustration ${i + 1}`} className="h-24 w-24 rounded-xl object-cover" />
              <button onClick={() => setIllustrations((prev) => prev.filter((_, j) => j !== i))}
                className="absolute -top-1.5 -right-1.5 rounded-full bg-red-500 p-0.5 text-white">
                <Trash2 size={10} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-zinc-400">{wordCount} words</span>
        <div className="flex items-center gap-2">
          <button onClick={() => saveDraft()} disabled={(!title && !text && chapters.length === 0) || saving}
            className="flex items-center gap-1.5 rounded-xl border border-purple-200/60 bg-white/70 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-white disabled:opacity-50 dark:border-zinc-700/60 dark:bg-zinc-800/70 dark:text-zinc-400">
            <Save size={14} />
            {saving ? "Saving..." : saved ? "Saved!" : "Save"}
          </button>
          <button onClick={handlePublish} disabled={!title.trim() || submitting}
            className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-purple-500 disabled:opacity-50">
            <BookUp size={14} />
            {submitting ? "Submitting..." : "Submit for Review"}
          </button>
        </div>
      </div>
    </div>
  )
}
