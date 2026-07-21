"use client"

import { useActionState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createChapter } from "@/app/actions/chapters"
import { Button } from "@/components/ui/Button"
import { BackButton } from "@/components/ui/BackButton"
import { use } from "react"

export default function NewChapterPage({ params }: { params: Promise<{ storyId: string }> }) {
  const { storyId } = use(params)
  const router = useRouter()
  const [state, formAction, pending] = useActionState(
    createChapter.bind(null, storyId),
    undefined
  )

  useEffect(() => {
    if (state?.message && !state?.error && state.message.length === 36) {
      router.push("/author/stories/" + storyId + "/edit")
    }
  }, [state, router, storyId])

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-bold mb-6">Add Chapter</h1>

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
            className="block w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {state?.error?.title && (
            <p className="mt-1 text-xs text-red-500">{state.error.title}</p>
          )}
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
            className="block w-full rounded-lg border px-3 py-2 text-sm font-mono leading-relaxed focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {state?.error?.content && (
            <p className="mt-1 text-xs text-red-500">{state.error.content}</p>
          )}
        </div>

        {state?.message && state?.message.length !== 36 && (
          <p className="text-sm text-green-600">{state.message}</p>
        )}

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={pending}>
            {pending ? "Publishing..." : "Publish Chapter"}
          </Button>
          <BackButton fallbackHref="/author/stories">
            Cancel
          </BackButton>
        </div>
      </form>
    </div>
  )
}
