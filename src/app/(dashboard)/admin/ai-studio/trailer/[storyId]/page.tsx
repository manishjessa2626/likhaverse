"use client"

import { useState, useEffect, use } from "react"
import { generateTrailerScript, getStoryAnalyses, deleteStoryAnalysis } from "@/app/actions/ai-studio"
import { getStoryById } from "@/app/actions/stories"
import { Button } from "@/components/ui/Button"
import { BackButton } from "@/components/ui/BackButton"

export default function TrailerPage({ params }: { params: Promise<{ storyId: string }> }) {
  const { storyId } = use(params)
  const [story, setStory] = useState<{ title: string } | null>(null)
  const [items, setItems] = useState<{ id: string; type: string; content: string; imageUrl: string | null; createdAt: string }[]>([])
  const [prompt, setPrompt] = useState("")
  const [mode, setMode] = useState<"TRAILER_SCRIPT" | "TRAILER_STORYBOARD">("TRAILER_SCRIPT")
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    getStoryById(storyId).then((s) => { if (s) setStory({ title: s.title }) })
    loadItems()
  }, [storyId])

  async function loadItems() {
    const data = await getStoryAnalyses(storyId)
    setItems(
      data
        .filter((x) => x.type === "TRAILER_SCRIPT" || x.type === "TRAILER_STORYBOARD")
        .map((x) => ({ id: x.id, type: x.type, content: x.content, imageUrl: x.metadata || null, createdAt: x.createdAt.toISOString() }))
    )
  }

  async function handleGenerate() {
    if (!prompt.trim()) return
    setGenerating(true)
    const res = await generateTrailerScript(storyId, prompt, mode)
    if (res?.message && !res.error) {
      await loadItems()
    }
    setGenerating(false)
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this item?")) return
    await deleteStoryAnalysis(id)
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <BackButton fallbackHref="/admin/ai-studio" className="mb-4 inline-block" />
      <h1 className="text-2xl font-bold text-amber-700 dark:text-zinc-100">Trailer Generator</h1>
      {story && <p className="mt-1 text-zinc-500">{story.title}</p>}

      <div className="mt-6 rounded-xl border bg-white p-6">
        <h2 className="font-semibold mb-4">Generate Trailer Content</h2>
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => setMode("TRAILER_SCRIPT")}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${mode === "TRAILER_SCRIPT" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-zinc-300 text-zinc-600"}`}
          >
            Trailer Script
          </button>
          <button
            type="button"
            onClick={() => setMode("TRAILER_STORYBOARD")}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${mode === "TRAILER_STORYBOARD" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-zinc-300 text-zinc-600"}`}
          >
            Trailer Storyboard
          </button>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description *</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            placeholder="Describe the trailer tone, key scenes to include, target audience..."
            className="block w-full rounded-lg border px-3 py-2 text-sm"
          />
        </div>
        <Button className="mt-4" onClick={handleGenerate} disabled={generating || !prompt.trim()}>
          {generating ? "Generating..." : `Generate ${mode === "TRAILER_SCRIPT" ? "Script" : "Storyboard"}`}
        </Button>
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-semibold mb-4">Generated Content ({items.length})</h2>
        {items.length === 0 ? (
          <p className="text-zinc-400">No trailer content generated yet.</p>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="rounded-xl border bg-white p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                    {item.type === "TRAILER_SCRIPT" ? "Trailer Script" : "Trailer Storyboard"}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-400">{new Date(item.createdAt).toLocaleDateString()}</span>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}>Delete</Button>
                  </div>
                </div>
                {item.imageUrl && (
                  <img src={item.imageUrl} alt="" className="mb-3 h-48 w-full rounded-lg object-cover" />
                )}
                <div className="prose prose-sm max-w-none whitespace-pre-wrap text-sm text-zinc-700">{item.content}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
