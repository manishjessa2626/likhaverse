"use client"

import { useState } from "react"
import { Library, ExternalLink, Trash2, Plus } from "lucide-react"
import { addClassicBook, removeClassicBook, getClassicBooks } from "@/app/actions/admin"

const CATEGORIES = [
  { value: "BEDTIME", label: "Bedtime Stories" },
  { value: "FAIRY_TALE", label: "Fairy Tales" },
  { value: "ANIMAL", label: "Animal Stories" },
  { value: "CLASSIC_ADVENTURE", label: "Classic Adventures" },
  { value: "EDUCATIONAL", label: "Educational Stories" },
]

const SOURCES = [
  { value: "PROJECT_GUTENBERG", label: "Project Gutenberg" },
  { value: "PROJECT_GUTENBERG_AU", label: "Project Gutenberg Australia" },
  { value: "MANUAL", label: "Manual Entry" },
]

interface ClassicBook {
  id: string
  title: string
  author: string
  description: string | null
  coverImage: string | null
  category: string
  source: string
  sourceUrl: string | null
  contentUrl: string | null
  language: string
  addedAt: string
  addedBy: { id: string; name: string | null }
}

export function ClassicLibraryClient({ initialData }: { initialData: any }) {
  const [data, setData] = useState(initialData)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    title: "", author: "", description: "", coverImage: "",
    category: "BEDTIME", source: "PROJECT_GUTENBERG",
    sourceUrl: "", contentUrl: "", language: "en",
  })
  const [submitting, setSubmitting] = useState(false)

  const refresh = async () => {
    const d = await getClassicBooks(1)
    setData(d)
  }

  const handleAdd = async () => {
    if (!form.title || !form.author) return
    setSubmitting(true)
    try {
      await addClassicBook({
        ...form,
        description: form.description || undefined,
        coverImage: form.coverImage || undefined,
        sourceUrl: form.sourceUrl || undefined,
        contentUrl: form.contentUrl || undefined,
      })
      setShowForm(false)
      setForm({ title: "", author: "", description: "", coverImage: "", category: "BEDTIME", source: "PROJECT_GUTENBERG", sourceUrl: "", contentUrl: "", language: "en" })
      await refresh()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to add book")
    } finally {
      setSubmitting(false)
    }
  }

  const handleRemove = async (id: string) => {
    if (!confirm("Remove this classic book from the library?")) return
    try {
      await removeClassicBook(id)
      await refresh()
    } catch {
      alert("Failed to remove book")
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2"><Library size={20} /> Classic Library</h1>
          <p className="mt-1 text-sm text-zinc-500">{data.total} public-domain books</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-500">
          <Plus size={14} /> Add Book
        </button>
      </div>

      {showForm && (
        <div className="mb-6 rounded-2xl border border-emerald-200/60 bg-white/80 p-6 backdrop-blur-sm dark:border-zinc-700/60 dark:bg-zinc-800/80">
          <h2 className="mb-4 font-bold text-zinc-800 dark:text-zinc-100">Add a Public-Domain Book</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Title *</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-xl border border-purple-200/60 bg-white/70 px-3 py-2 text-sm dark:border-zinc-700/60 dark:bg-zinc-800/70 dark:text-zinc-100" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Author *</label>
              <input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })}
                className="w-full rounded-xl border border-purple-200/60 bg-white/70 px-3 py-2 text-sm dark:border-zinc-700/60 dark:bg-zinc-800/70 dark:text-zinc-100" />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-xl border border-purple-200/60 bg-white/70 px-3 py-2 text-sm dark:border-zinc-700/60 dark:bg-zinc-800/70 dark:text-zinc-100" rows={2} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Category *</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-xl border border-purple-200/60 bg-white/70 px-3 py-2 text-sm dark:border-zinc-700/60 dark:bg-zinc-800/70 dark:text-zinc-100">
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Source *</label>
              <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}
                className="w-full rounded-xl border border-purple-200/60 bg-white/70 px-3 py-2 text-sm dark:border-zinc-700/60 dark:bg-zinc-800/70 dark:text-zinc-100">
                {SOURCES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Source URL</label>
              <input value={form.sourceUrl} onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })}
                placeholder="https://www.gutenberg.org/ebooks/..."
                className="w-full rounded-xl border border-purple-200/60 bg-white/70 px-3 py-2 text-sm dark:border-zinc-700/60 dark:bg-zinc-800/70 dark:text-zinc-100" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Read Online URL</label>
              <input value={form.contentUrl} onChange={(e) => setForm({ ...form, contentUrl: e.target.value })}
                placeholder="Direct read URL"
                className="w-full rounded-xl border border-purple-200/60 bg-white/70 px-3 py-2 text-sm dark:border-zinc-700/60 dark:bg-zinc-800/70 dark:text-zinc-100" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Cover Image URL</label>
              <input value={form.coverImage} onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                className="w-full rounded-xl border border-purple-200/60 bg-white/70 px-3 py-2 text-sm dark:border-zinc-700/60 dark:bg-zinc-800/70 dark:text-zinc-100" />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={handleAdd} disabled={submitting || !form.title || !form.author}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-500 disabled:opacity-50">
              {submitting ? "Adding..." : "Add to Library"}
            </button>
            <button onClick={() => setShowForm(false)}
              className="rounded-xl border border-purple-200/60 bg-white/70 px-4 py-2 text-xs font-medium text-zinc-600 dark:border-zinc-700/60 dark:bg-zinc-800/70 dark:text-zinc-400">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {data.books.map((book: ClassicBook) => (
          <div key={book.id} className="flex items-center justify-between rounded-xl border border-purple-200/60 bg-white/70 p-3 backdrop-blur-sm dark:border-zinc-700/60 dark:bg-zinc-800/70">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-8 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-amber-200 to-emerald-200 dark:from-amber-800 dark:to-emerald-800">
                {book.coverImage ? <img src={book.coverImage} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-xs">📖</div>}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100 truncate">{book.title}</p>
                <p className="text-[10px] text-zinc-500">{book.author} · {CATEGORIES.find((c) => c.value === book.category)?.label || book.category}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {book.contentUrl && (
                <a href={book.contentUrl} target="_blank" rel="noopener noreferrer" className="rounded p-1 text-zinc-400 hover:text-emerald-500" title="Read Online">
                  <ExternalLink size={13} />
                </a>
              )}
              <button onClick={() => handleRemove(book.id)} className="rounded p-1 text-zinc-300 hover:text-red-500 transition-colors" title="Remove"><Trash2 size={13} /></button>
            </div>
          </div>
        ))}
        {(!data.books || data.books.length === 0) && (
          <div className="rounded-2xl border border-purple-200/60 bg-white/70 p-12 text-center backdrop-blur-sm dark:border-zinc-700/60 dark:bg-zinc-800/70">
            <p className="text-5xl mb-3">📚</p>
            <p className="text-zinc-500">No classic books yet. Add some!</p>
          </div>
        )}
      </div>
    </div>
  )
}
