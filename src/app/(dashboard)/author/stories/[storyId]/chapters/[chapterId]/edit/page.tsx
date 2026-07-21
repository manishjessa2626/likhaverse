"use client"

import { useActionState, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { updateChapter, deleteChapter, getChapterById } from "@/app/actions/chapters"
import { Button } from "@/components/ui/Button"
import { BackButton } from "@/components/ui/BackButton"
import { use } from "react"

export default function EditChapterPage({ params }: { params: Promise<{ storyId: string; chapterId: string }> }) {
  const { storyId, chapterId } = use(params)
  const router = useRouter()
  const [chapter, setChapter] = useState<{ title: string; content: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [state, formAction, pending] = useActionState(
    updateChapter.bind(null, storyId, chapterId),
    undefined
  )

  useEffect(() => {
    getChapterById(chapterId).then((c) => {
      if (!c) { router.push("/author"); return }
      setChapter({ title: c.title, content: c.content })
      setLoading(false)
    })
  }, [chapterId, router])

  async function handleDelete() {
    if (!confirm("Delete this chapter?")) return
    setDeleting(true)
    await deleteChapter(storyId, chapterId)
    router.push("/author/stories/" + storyId + "/edit")
  }

  if (loading) {
    return <div className="mx-auto max-w-3xl px-4 py-12 text-zinc-400">Loading...</div>
  }

  if (!chapter) return null

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Edit Chapter</h1>
        <Button variant="danger" size="sm" onClick={handleDelete} disabled={deleting}>
          {deleting ? "Deleting..." : "Delete"}
        </Button>
      </div>

      {state?.message && (
        <p className="mb-4 text-sm text-green-600">{state.message}</p>
      )}

      <form action={formAction} className="space-y-5">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Chapter Title *
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            defaultValue={chapter.title}
            className="block w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium mb-1">
            Content *
          </label>
          <textarea
            id="content"
            name="content"
            rows={20}
            required
            defaultValue={chapter.content}
            className="block w-full rounded-lg border px-3 py-2 text-sm font-mono leading-relaxed focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={pending}>
            {pending ? "Saving..." : "Save Changes"}
          </Button>
          <BackButton fallbackHref="/author/stories">
            Cancel
          </BackButton>
        </div>
      </form>
    </div>
  )
}
