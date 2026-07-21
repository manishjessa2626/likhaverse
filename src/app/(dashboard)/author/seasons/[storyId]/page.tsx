"use client"

import { useActionState, useEffect, useState, use } from "react"
import { createSeason, getSeasons, deleteSeason, moveChapterToSeason, removeChapterFromSeason } from "@/app/actions/seasons"
import { getChaptersForStory } from "@/app/actions/chapters"
import { Button } from "@/components/ui/Button"
import { BackButton } from "@/components/ui/BackButton"

interface Season {
  id: string; title: string; number: number
  chapters: { id: string; title: string; number: number }[]
}

interface ChapterItem {
  id: string; title: string; number: number
}

export default function SeasonsPage({ params }: { params: Promise<{ storyId: string }> }) {
  const { storyId } = use(params)
  const [seasons, setSeasons] = useState<Season[]>([])
  const [ungroupedChapters, setUngroupedChapters] = useState<ChapterItem[]>([])
  const [state, formAction, pending] = useActionState(createSeason.bind(null, storyId), undefined)

  useEffect(() => {
    Promise.all([
      getSeasons(storyId).then(setSeasons),
      getChaptersForStory(storyId).then((chapters) => {
        setUngroupedChapters(chapters.map((c) => ({ id: c.id, title: c.title, number: c.number })))
      }),
    ])
  }, [storyId])

  const seasonChapterIds = seasons.flatMap((s) => s.chapters.map((c) => c.id))
  const ungrouped = ungroupedChapters.filter((c) => !seasonChapterIds.includes(c.id))

  async function handleMoveToSeason(chapterId: string, seasonId: string) {
    await moveChapterToSeason(chapterId, seasonId)
    const s = await getSeasons(storyId)
    setSeasons(s)
  }

  async function handleRemoveFromSeason(chapterId: string) {
    await removeChapterFromSeason(chapterId)
    const s = await getSeasons(storyId)
    setSeasons(s)
  }

  async function handleDeleteSeason(seasonId: string) {
    if (!confirm("Delete this season? Chapters will be ungrouped.")) return
    await deleteSeason(seasonId)
    const s = await getSeasons(storyId)
    setSeasons(s)
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <BackButton fallbackHref="/author" className="mb-4 inline-block" />
      <h1 className="text-2xl font-bold text-amber-700 dark:text-zinc-100">Seasons</h1>
      <p className="mt-1 text-zinc-500">Organize your chapters into seasons.</p>

      <form action={formAction} className="mt-6 flex gap-3">
        <input
          name="title"
          placeholder="Season title..."
          required
          className="flex-1 rounded-lg border px-3 py-2 text-sm"
        />
        <Button type="submit" disabled={pending}>
          {pending ? "Creating..." : "Add Season"}
        </Button>
      </form>
      {state?.message && !state?.error && (
        <p className="mt-2 text-sm text-green-600">{state.message}</p>
      )}

      <div className="mt-8 space-y-6">
        {seasons.map((season) => (
          <div key={season.id} className="rounded-xl border bg-white">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div>
                <h2 className="font-semibold text-zinc-800">
                  Season {season.number}: {season.title}
                </h2>
                <p className="text-xs text-zinc-400">{season.chapters.length} chapters</p>
              </div>
              <Button variant="danger" size="sm" onClick={() => handleDeleteSeason(season.id)}>
                Delete
              </Button>
            </div>
            <div className="p-4 space-y-2">
              {season.chapters.map((ch) => (
                <div key={ch.id} className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2">
                  <span className="text-sm">
                    <span className="font-medium text-zinc-500">#{ch.number}</span> {ch.title}
                  </span>
                  <button
                    onClick={() => handleRemoveFromSeason(ch.id)}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {ungrouped.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-3">Ungrouped Chapters</h2>
          <div className="space-y-2">
            {ungrouped.map((ch) => (
              <div key={ch.id} className="flex items-center justify-between rounded-lg border bg-white px-4 py-3">
                <span className="text-sm">
                  <span className="font-medium text-zinc-500">#{ch.number}</span> {ch.title}
                </span>
                <div className="flex gap-2">
                  {seasons.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleMoveToSeason(ch.id, s.id)}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Move to {s.title}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {seasons.length === 0 && ungrouped.length === 0 && (
        <p className="mt-8 text-center text-zinc-400">No seasons or chapters yet.</p>
      )}
    </div>
  )
}
