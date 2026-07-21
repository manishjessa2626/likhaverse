"use client"

import { startTransition, useActionState, useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createStory } from "@/app/actions/stories"
import { Button } from "@/components/ui/Button"
import { BackButton } from "@/components/ui/BackButton"

export default function NewStoryPage() {
  const router = useRouter()
  const [state, formAction, pending] = useActionState(createStory, undefined)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [coverUrl, setCoverUrl] = useState("")
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (state?.message && !state?.error && state.message.length === 36) {
      router.push("/author/stories/" + state.message + "/edit")
    }
  }, [state, router])

  async function handleCoverSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverPreview(URL.createObjectURL(file))
    setUploading(true)
    const uploadData = new FormData()
    uploadData.append("file", file)
    try {
      const res = await fetch("/api/upload", { method: "POST", body: uploadData })
      const data = await res.json()
      if (data.url) setCoverUrl(data.url)
    } catch {
      // upload failed silently — story creation still works without cover
    }
    setUploading(false)
  }

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      if (uploading || pending) return

      const formData = new FormData(e.currentTarget)
      if (coverUrl) formData.set("cover", coverUrl)

      startTransition(() => {
        formAction(formData)
      })
    },
    [coverUrl, uploading, pending, formAction],
  )

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-bold text-amber-700 dark:text-zinc-100 mb-6">Create New Story</h1>

      {state?.message && !state?.error && state.message.length !== 36 && (
        <p className="mb-4 text-sm text-green-600">{state.message}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1">Cover Image</label>
          <div className="flex items-start gap-4">
            <div className="aspect-[3/4] w-32 rounded-lg border-2 border-dashed border-zinc-300 dark:border-zinc-600 flex items-center justify-center overflow-hidden bg-zinc-50 dark:bg-zinc-800">
              {coverPreview ? (
                <img src={coverPreview} alt="Cover preview" className="h-full w-full object-cover" />
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
              {uploading && <p className="mt-1 text-xs text-blue-500">Uploading cover...</p>}
              <p className="mt-1 text-xs text-zinc-400">
                Recommended: 600x800px (3:4 ratio). JPEG or PNG.
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
            className="block w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {state?.error?.title && (
            <p className="mt-1 text-xs text-red-500">{state.error.title}</p>
          )}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            className="block w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-medium mb-1">
            Tags (comma-separated)
          </label>
          <input
            id="tags"
            name="tags"
            type="text"
            placeholder="fantasy, romance, adventure"
            className="block w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
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
            defaultValue={10}
            className="block w-32 rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <p className="mt-1 text-xs text-zinc-400">
            Number of chapters visible to non-logged-in readers
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={pending || uploading}>
            {uploading ? "Uploading..." : pending ? "Creating..." : "Create Story"}
          </Button>
          <BackButton fallbackHref="/author/stories">
            Cancel
          </BackButton>
        </div>
      </form>
    </div>
  )
}
