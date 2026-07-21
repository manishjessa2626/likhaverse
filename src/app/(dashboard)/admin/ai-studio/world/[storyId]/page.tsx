"use client"

import { useState, useEffect, use } from "react"
import { generateWorldBuilding, getWorldBuildingEntries, deleteWorldBuildingEntry } from "@/app/actions/ai-studio"
import { getStoryById } from "@/app/actions/stories"
import { Button } from "@/components/ui/Button"
import { BackButton } from "@/components/ui/BackButton"

const TOPICS = [
  { id: "Magic System", label: "Magic System", color: "purple" },
  { id: "Culture & Society", label: "Culture & Society", color: "pink" },
  { id: "Geography", label: "Geography", color: "green" },
  { id: "History & Lore", label: "History & Lore", color: "amber" },
  { id: "Economics & Trade", label: "Economics & Trade", color: "blue" },
]

export default function WorldBuilderPage({ params }: { params: Promise<{ storyId: string }> }) {
  const { storyId } = use(params)
  const [story, setStory] = useState<{ title: string } | null>(null)
  const [entries, setEntries] = useState<{ id: string; type: string; title: string; content: string; createdAt: string }[]>([])
  const [topic, setTopic] = useState("Magic System")
  const [prompt, setPrompt] = useState("")
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    getStoryById(storyId).then((s) => { if (s) setStory({ title: s.title }) })
    getWorldBuildingEntries(storyId).then((e) =>
      setEntries(e.map((x) => ({ ...x, createdAt: x.createdAt.toISOString() })))
    )
  }, [storyId])

  async function handleGenerate() {
    if (!prompt.trim()) return
    setGenerating(true)
    const res = await generateWorldBuilding(storyId, topic, prompt)
    if (res?.message && !res.error) {
      const data = await getWorldBuildingEntries(storyId)
      setEntries(data.map((x) => ({ ...x, createdAt: x.createdAt.toISOString() })))
    }
    setGenerating(false)
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this entry?")) return
    await deleteWorldBuildingEntry(id)
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }

  const colorMap: Record<string, string> = { purple: "text-purple-700 bg-purple-100", pink: "text-pink-700 bg-pink-100", green: "text-green-700 bg-green-100", amber: "text-amber-700 bg-amber-100", blue: "text-blue-700 bg-blue-100" }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <BackButton fallbackHref="/admin/ai-studio" className="mb-4 inline-block" />
      <h1 className="text-2xl font-bold text-cyan-700 dark:text-zinc-100">World Builder</h1>
      {story && <p className="mt-1 text-zinc-500">{story.title}</p>}

      <div className="mt-6 rounded-xl border bg-white p-6">
        <h2 className="font-semibold mb-4">Generate World Building</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {TOPICS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTopic(t.id)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                topic === t.id
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-zinc-300 text-zinc-600 hover:border-zinc-400"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Details *</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            placeholder={`Describe what you want for ${topic.toLowerCase()}...`}
            className="block w-full rounded-lg border px-3 py-2 text-sm"
          />
        </div>
        <Button className="mt-4" onClick={handleGenerate} disabled={generating || !prompt.trim()}>
          {generating ? "Generating..." : `Generate ${topic}`}
        </Button>
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-semibold mb-4">World Building Entries ({entries.length})</h2>
        {entries.length === 0 ? (
          <p className="text-zinc-400">No entries yet.</p>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <div key={entry.id} className="rounded-xl border bg-white p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className={`rounded px-2 py-0.5 text-xs font-medium ${colorMap[TOPICS.find((t) => t.id === entry.type)?.color || "blue"] || "bg-zinc-100 text-zinc-600"}`}>
                    {entry.type}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-400">{new Date(entry.createdAt).toLocaleDateString()}</span>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(entry.id)}>Delete</Button>
                  </div>
                </div>
                <div className="prose prose-sm max-w-none whitespace-pre-wrap text-sm text-zinc-700">{entry.content}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
