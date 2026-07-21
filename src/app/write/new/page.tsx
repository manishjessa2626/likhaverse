"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { BackButton } from "@/components/ui/BackButton"

export default function NewStoryPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [tags, setTags] = useState("")
  const [accessType, setAccessType] = useState("FREEMIUM")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError("Title is required")
      return
    }
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), description, tags, accessType }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Failed to create story")
        return
      }
      router.push(`/write/${data.id}`)
    } catch {
      setError("Failed to create story")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100">
      <div className="mx-auto max-w-2xl px-4 py-12">
        <BackButton
          href="/write"
          className="mb-6 inline-flex items-center text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          &larr; Back to Write
        </BackButton>
        <h1 className="mb-8 text-3xl font-bold text-white">Create New Story</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="mb-2 block text-sm font-medium text-zinc-400">
              Story Title *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-white placeholder-zinc-600 focus:border-amber-500 focus:outline-none"
              placeholder="Enter your story title"
              maxLength={200}
            />
          </div>

          <div>
            <label htmlFor="description" className="mb-2 block text-sm font-medium text-zinc-400">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-white placeholder-zinc-600 focus:border-amber-500 focus:outline-none resize-none"
              placeholder="Tell readers what your story is about"
            />
          </div>

          <div>
            <label htmlFor="tags" className="mb-2 block text-sm font-medium text-zinc-400">
              Tags
            </label>
            <input
              id="tags"
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-white placeholder-zinc-600 focus:border-amber-500 focus:outline-none"
              placeholder="fantasy, romance, adventure (comma separated)"
            />
          </div>

          <div>
            <label htmlFor="accessType" className="mb-2 block text-sm font-medium text-zinc-400">
              Access Type
            </label>
            <select
              id="accessType"
              value={accessType}
              onChange={(e) => setAccessType(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-white focus:border-amber-500 focus:outline-none"
            >
              <option value="FREE">Free</option>
              <option value="FREEMIUM">Freemium (first N chapters free)</option>
              <option value="PREMIUM">Premium only</option>
            </select>
          </div>

          {error && (
            <div className="rounded-lg bg-red-900/50 px-4 py-2 text-sm text-red-400">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-amber-500 px-4 py-2.5 font-medium text-black hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                Creating...
              </span>
            ) : "Create Story"}
          </button>
        </form>
      </div>
    </div>
  )
}
