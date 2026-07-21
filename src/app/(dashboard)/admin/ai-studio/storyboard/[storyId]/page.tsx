"use client"

import { useActionState, useEffect, useState, use } from "react"
import { generateStoryboardScene, getStoryboardScenes, deleteStoryboardScene } from "@/app/actions/ai-studio"
import { getStoryById } from "@/app/actions/stories"
import { getChaptersForStory } from "@/app/actions/chapters"
import { Button } from "@/components/ui/Button"
import { BackButton } from "@/components/ui/BackButton"

interface Scene {
  id: string; title: string; description: string | null; sceneNumber: number
  imageUrl: string | null; chapterTitle: string | null; chapterNumber: number | null; createdAt: string
}
interface Chapter { id: string; title: string; number: number }

export default function StoryboardPage({ params }: { params: Promise<{ storyId: string }> }) {
  const { storyId } = use(params)
  const [story, setStory] = useState<{ title: string } | null>(null)
  const [scenes, setScenes] = useState<Scene[]>([])
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [state, formAction, pending] = useActionState(generateStoryboardScene.bind(null, storyId), undefined)
  const [chapterTitle, setChapterTitle] = useState("")
  const [chapterNumber, setChapterNumber] = useState("")

  useEffect(() => {
    getStoryById(storyId).then((s) => { if (s) setStory({ title: s.title }) })
    getStoryboardScenes(storyId).then((s) =>
      setScenes(s.map((x) => ({ ...x, createdAt: x.createdAt.toISOString() })))
    )
    getChaptersForStory(storyId).then((c) => setChapters(c))
  }, [storyId])

  useEffect(() => {
    if (state?.message && !state?.error) {
      getStoryboardScenes(storyId).then((s) =>
        setScenes(s.map((x) => ({ ...x, createdAt: x.createdAt.toISOString() })))
      )
    }
  }, [state, storyId])

  async function handleDelete(id: string) {
    if (!confirm("Delete this scene?")) return
    await deleteStoryboardScene(id)
    setScenes((prev) => prev.filter((s) => s.id !== id))
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <BackButton fallbackHref="/admin/ai-studio" className="mb-4 inline-block" />
      <h1 className="text-2xl font-bold text-blue-700 dark:text-zinc-100">Storyboard Creator</h1>
      {story && <p className="mt-1 text-zinc-500">{story.title}</p>}

      <div className="mt-6 rounded-xl border bg-white p-6">
        <h2 className="font-semibold mb-4">Add Scene</h2>
        <form action={formAction} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Scene Title *</label>
              <input name="title" required className="block w-full rounded-lg border px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Associated Chapter</label>
              <select
                value={chapterTitle}
                onChange={(e) => {
                  const idx = e.target.selectedIndex
                  const opt = e.target.options[idx]
                  setChapterTitle(e.target.value)
                  setChapterNumber(opt.getAttribute("data-number") || "")
                }}
                className="block w-full rounded-lg border px-3 py-2 text-sm"
              >
                <option value="">None</option>
                {chapters.map((ch) => (
                  <option key={ch.id} value={ch.title} data-number={ch.number}>
                    Ch.{ch.number} — {ch.title}
                  </option>
                ))}
              </select>
              <input type="hidden" name="chapterTitle" value={chapterTitle} />
              <input type="hidden" name="chapterNumber" value={chapterNumber} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Scene Description</label>
            <textarea name="description" rows={4} className="block w-full rounded-lg border px-3 py-2 text-sm" />
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? "Adding..." : "Add Scene"}
          </Button>
          {state?.message && !state?.error && <p className="text-sm text-green-600">{state.message}</p>}
        </form>
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Scenes ({scenes.length})</h2>
          {scenes.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => getStoryboardScenes(storyId).then((s) => setScenes(s.map((x) => ({ ...x, createdAt: x.createdAt.toISOString() }))))}>
              Refresh
            </Button>
          )}
        </div>
        {scenes.length === 0 ? (
          <p className="text-zinc-400">No scenes yet. Add your first scene above.</p>
        ) : (
          <div className="space-y-4">
            {scenes.map((scene) => (
              <div key={scene.id} className="rounded-xl border bg-white p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                      {scene.sceneNumber}
                    </span>
                    <div>
                      <h3 className="font-semibold text-zinc-800">{scene.title}</h3>
                      {scene.chapterTitle && (
                        <p className="text-xs text-zinc-400">Chapter {scene.chapterNumber}: {scene.chapterTitle}</p>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(scene.id)}>Delete</Button>
                </div>
                {scene.imageUrl && (
                  <img src={scene.imageUrl} alt={scene.title} className="mt-3 h-48 w-full rounded-lg object-cover" />
                )}
                {scene.description && (
                  <div className="mt-3 whitespace-pre-wrap text-sm text-zinc-600">{scene.description}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
