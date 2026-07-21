"use client"

import { useActionState, useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { updateStory, deleteStory, getStoryById } from "@/app/actions/stories"
import { getChaptersForStory } from "@/app/actions/chapters"
import { Button } from "@/components/ui/Button"
import Link from "next/link"
import { BackButton } from "@/components/ui/BackButton"
import { formatDate } from "@/lib/utils"

interface Story {
  id: string
  title: string
  cover: string | null
  description: string | null
  tags: string | null
  status: string
  accessType: string
  freePreviewChapters: number
  wordCount: number
  viewCount: number
  createdAt: string
  updatedAt: string
}

interface Chapter {
  id: string
  title: string
  number: number
  wordCount: number
  createdAt: string
}

export default function EditStoryPage({ params }: { params: Promise<{ storyId: string }> }) {
  const { storyId } = use(params)
  const router = useRouter()
  const [story, setStory] = useState<Story | null>(null)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [state, setState] = useState<{ message: string; error: unknown } | undefined>(undefined)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    Promise.all([
      getStoryById(storyId).then((s) => {
        if (!s) { router.push("/author"); return }
        setStory({
          id: s.id,
          title: s.title,
          cover: s.cover,
          description: s.description,
          tags: s.tags,
          status: s.status,
          accessType: s.accessType || "FREEMIUM",
          freePreviewChapters: s.freePreviewChapters,
          wordCount: s.wordCount,
          viewCount: s.viewCount,
          createdAt: s.createdAt.toISOString(),
          updatedAt: s.updatedAt.toISOString(),
        })
      }),
      getChaptersForStory(storyId).then((c) =>
        setChapters(
          c.map((ch) => ({
            ...ch,
            createdAt: ch.createdAt.toISOString(),
          }))
        )
      ),
    ]).then(() => setLoading(false))
  }, [storyId, router])

  async function handleCoverSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)

    let coverUrl = ""
    if (coverFile) {
      setUploading(true)
      const uploadData = new FormData()
      uploadData.append("file", coverFile)
      const res = await fetch("/api/upload", { method: "POST", body: uploadData })
      const data = await res.json()
      if (data.url) coverUrl = data.url
      setUploading(false)
    }

    const formData = new FormData(e.currentTarget)
    if (coverUrl) formData.set("cover", coverUrl)
    if (!coverUrl && !coverFile) formData.delete("cover")

    const result = await updateStory(storyId, undefined, formData)
    setState(result)
    setPending(false)
  }

  async function handleDelete() {
    if (!confirm("Delete this story and all its chapters?")) return
    setDeleting(true)
    await deleteStory(storyId)
    router.push("/author")
  }

  if (loading) {
    return <div className="mx-auto max-w-2xl px-4 py-12 text-zinc-400">Loading...</div>
  }

  if (!story) return null

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-4">
        <BackButton href="/author/stories" className="text-sm text-blue-600 hover:underline">
          &larr; Back to Stories
        </BackButton>
      </div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Edit Story</h1>
        <Button variant="danger" size="sm" onClick={handleDelete} disabled={deleting}>
          {deleting ? "Deleting..." : "Delete Story"}
        </Button>
      </div>

      {state?.message && (
        <p className="mb-4 text-sm text-green-600">{state.message}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Cover */}
        <div>
          <label className="block text-sm font-medium mb-1">Cover Image</label>
          <div className="flex items-start gap-4">
            <div className="aspect-[3/4] w-32 rounded-lg border-2 border-dashed border-zinc-300 dark:border-zinc-600 flex items-center justify-center overflow-hidden bg-zinc-50 dark:bg-zinc-800">
              {coverPreview ? (
                <img src={coverPreview} alt="Cover" className="h-full w-full object-cover" />
              ) : story.cover ? (
                <img src={story.cover} alt="Cover" className="h-full w-full object-cover" />
              ) : (
                <svg className="h-8 w-8 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverSelect}
                className="block w-full text-sm text-zinc-500 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-600 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-blue-700"
              />
              <p className="mt-1 text-xs text-zinc-400">
                Leave empty to keep current cover. 600x800px recommended.
              </p>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Title *
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            defaultValue={story.title}
            className="block w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            defaultValue={story.description ?? ""}
            className="block w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-medium mb-1">
            Tags
          </label>
          <input
            id="tags"
            name="tags"
            type="text"
            defaultValue={story.tags ?? ""}
            className="block w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="accessType" className="block text-sm font-medium mb-1">
                Access Type
              </label>
              <select
                id="accessType"
                name="accessType"
                defaultValue={(story as { accessType?: string }).accessType || "FREEMIUM"}
                className="block w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="FREE">Free — All chapters accessible</option>
                <option value="FREEMIUM">Freemium — Free preview + Premium locked chapters</option>
                <option value="PREMIUM">Premium — Entire story locked</option>
              </select>
            </div>

            <div>
              <label htmlFor="freePreviewChapters" className="block text-sm font-medium mb-1">
                Free Preview Chapters
              </label>
              <input
                id="freePreviewChapters"
                name="freePreviewChapters"
                type="number"
                min={0}
                max={100}
                defaultValue={story.freePreviewChapters}
                className="block w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium mb-1">
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={story.status}
              className="block w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={pending || uploading}>
            {uploading ? "Uploading..." : pending ? "Saving..." : "Save Changes"}
          </Button>
          <Link href="/author">
            <Button type="button" variant="secondary">
              Back
            </Button>
          </Link>
        </div>
      </form>

      <div className="mt-12 border-t pt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Chapters ({chapters.length})</h2>
          <div className="flex gap-2">
            <Link href={"/author/seasons/" + storyId}>
              <Button size="sm" variant="secondary">Seasons</Button>
            </Link>
            <Link href={"/author/stories/" + storyId + "/chapters/new"}>
              <Button size="sm">Add Chapter</Button>
            </Link>
          </div>
        </div>

        {chapters.length === 0 ? (
          <p className="text-sm text-zinc-400">No chapters yet.</p>
        ) : (
          <div className="space-y-1">
            {chapters.map((ch) => (
              <div
                key={ch.id}
                className="flex items-center justify-between rounded-lg border bg-white px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-700">
                    {ch.number}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-zinc-800">{ch.title}</p>
                    <p className="text-xs text-zinc-400">
                      {ch.wordCount.toLocaleString()} words &middot; {formatDate(new Date(ch.createdAt))}
                    </p>
                  </div>
                </div>
                <Link
                  href={"/author/stories/" + storyId + "/chapters/" + ch.id + "/edit"}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Edit
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
