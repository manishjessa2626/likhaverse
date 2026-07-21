"use client"

import { useActionState, useEffect, useState } from "react"
import { submitStudioApplication, getAuthorApplications } from "@/app/actions/studio"
import { getAuthorStories } from "@/app/actions/stories"
import { Button } from "@/components/ui/Button"
import { BackButton } from "@/components/ui/BackButton"

interface Story { id: string; title: string; status: string; wordCount: number; completedAt: Date | null; _count: { chapters: number } }
interface Application {
  id: string; genre: string; totalChapters: number; wordCount: number
  reason: string; visualStyle: string; status: string; createdAt: string
  reviewNotes: string | null; story: { id: string; title: string }
}

const statusStyles: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  ACCEPTED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  REVISION_REQUESTED: "bg-blue-100 text-blue-700",
}

export default function StudioPage() {
  const [stories, setStories] = useState<Story[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [selectedStoryId, setSelectedStoryId] = useState("")
  const [totalChapters, setTotalChapters] = useState(1)
  const [wordCount, setWordCount] = useState(0)
  const [state, formAction, pending] = useActionState(
    submitStudioApplication,
    undefined
  )

  useEffect(() => {
    getAuthorStories().then((s) => {
      const eligible = s.filter((st) => st.status === "COMPLETED" && st.completedAt && st._count.chapters > 0)
      setStories(eligible)
      if (eligible.length > 0) {
        setSelectedStoryId(eligible[0].id)
        setTotalChapters(eligible[0]._count.chapters)
        setWordCount(eligible[0].wordCount)
      }
    })
    getAuthorApplications().then((a) =>
      setApplications(a.map((app) => ({ ...app, createdAt: app.createdAt.toISOString() })))
    )
  }, [])

  const statusBadge = (status: string) =>
    `rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[status] || "bg-zinc-100 text-zinc-600"}`

  const selectedStory = stories.find((s) => s.id === selectedStoryId)

  const handleStoryChange = (id: string) => {
    setSelectedStoryId(id)
    const story = stories.find((s) => s.id === id)
    if (story) {
      setTotalChapters(story._count.chapters)
      setWordCount(story.wordCount)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <BackButton fallbackHref="/author" className="mb-4 inline-block" />
      <h1 className="text-2xl font-bold text-amber-700 dark:text-zinc-100">LikhaVerse Studios</h1>
      <p className="mt-1 text-zinc-500">
        Premium Creators can submit completed stories for cinematic adaptation consideration.
      </p>

      <div className="mt-8 rounded-xl border bg-white p-6">
        <h2 className="text-lg font-semibold mb-2">Submit Application</h2>
        <p className="mb-4 text-xs text-zinc-400">
          Story must be <strong>Completed</strong>, have a <strong>completed ending</strong>, and contain at least <strong>one chapter</strong>.
        </p>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Select Story *</label>
          <select
            value={selectedStoryId}
            onChange={(e) => handleStoryChange(e.target.value)}
            className="block w-full rounded-lg border px-3 py-2 text-sm"
          >
            {stories.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title} ({s._count.chapters} chapters, {s.wordCount.toLocaleString()} words)
              </option>
            ))}
          </select>
          {stories.length === 0 && (
            <p className="mt-1 text-xs text-zinc-400">
              No eligible stories. Complete and publish a story first to apply.
            </p>
          )}
          {selectedStory && !selectedStory.completedAt && (
            <p className="mt-1 text-xs text-amber-600">
              This story needs a completed ending before it can be submitted.
            </p>
          )}
        </div>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="storyId" value={selectedStoryId} />
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Genre *</label>
              <input name="genre" required className="block w-full rounded-lg border px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Total Chapters</label>
              <input name="totalChapters" type="number" value={totalChapters} readOnly className="block w-full rounded-lg border bg-zinc-50 px-3 py-2 text-sm text-zinc-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Word Count</label>
              <input name="wordCount" type="number" value={wordCount} readOnly className="block w-full rounded-lg border bg-zinc-50 px-3 py-2 text-sm text-zinc-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Visual Style *</label>
            <input
              name="visualStyle"
              required
              placeholder="e.g., Anime, Live-action, CGI, 2D Animation, Stop Motion"
              className="block w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Why should this story be adapted? * <span className="text-xs text-zinc-400">(min 50 chars)</span>
            </label>
            <textarea name="reason" required rows={5} className="block w-full rounded-lg border px-3 py-2 text-sm" />
          </div>

          <Button type="submit" disabled={pending || stories.length === 0}>
            {pending ? "Submitting..." : "Submit Application"}
          </Button>

          {state?.error && (
            <div className="text-sm text-red-500">
              {Object.values(state.error).flat().join(", ")}
            </div>
          )}
          {state?.message && !state?.error && (
            <p className="text-sm text-green-600">{state.message}</p>
          )}
        </form>
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-semibold mb-4">Your Applications</h2>
        {applications.length === 0 ? (
          <p className="text-zinc-400">No applications yet.</p>
        ) : (
          <div className="space-y-3">
            {applications.map((app) => (
              <div key={app.id} className="rounded-lg border bg-white p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-zinc-800">{app.story.title}</p>
                    <p className="text-xs text-zinc-400">
                      {app.genre} &middot; {app.totalChapters} chapters &middot; {app.wordCount.toLocaleString()} words &middot; {app.visualStyle}
                    </p>
                  </div>
                  <span className={statusBadge(app.status)}>
                    {app.status.replace("_", " ")}
                  </span>
                </div>
                {app.reviewNotes && (
                  <div className="mt-2 rounded-lg bg-zinc-50 p-3 text-sm text-zinc-600">
                    <span className="font-medium">Review notes:</span> {app.reviewNotes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
