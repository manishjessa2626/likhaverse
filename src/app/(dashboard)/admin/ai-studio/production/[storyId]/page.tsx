"use client"

import { useState, useEffect, use } from "react"
import { generateProductionDocument, getStoryAnalyses, deleteStoryAnalysis } from "@/app/actions/ai-studio"
import { getStoryById } from "@/app/actions/stories"
import { Button } from "@/components/ui/Button"
import { BackButton } from "@/components/ui/BackButton"

const PRODUCTION_TOOLS = [
  { id: "PRODUCTION_BREAKDOWN" as const, label: "Production Breakdown", desc: "Break story into departments, cast, locations, VFX", color: "text-red-700 bg-red-100" },
  { id: "SHOT_LIST" as const, label: "Shot List", desc: "Detailed shot-by-shot breakdown with camera notes", color: "text-orange-700 bg-orange-100" },
  { id: "BUDGET_ESTIMATE" as const, label: "Budget Estimate", desc: "Cost breakdown by department and phase", color: "text-yellow-700 bg-yellow-100" },
]

export default function ProductionPipelinePage({ params }: { params: Promise<{ storyId: string }> }) {
  const { storyId } = use(params)
  const [story, setStory] = useState<{ title: string } | null>(null)
  const [items, setItems] = useState<{ id: string; type: string; content: string; createdAt: string }[]>([])
  const [selectedTool, setSelectedTool] = useState("PRODUCTION_BREAKDOWN")
  const [prompt, setPrompt] = useState("")
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    getStoryById(storyId).then((s) => { if (s) setStory({ title: s.title }) })
    loadItems()
  }, [storyId])

  async function loadItems() {
    const data = await getStoryAnalyses(storyId)
    setItems(
      data
        .filter((x) => ["PRODUCTION_BREAKDOWN", "SHOT_LIST", "BUDGET_ESTIMATE"].includes(x.type))
        .map((x) => ({ id: x.id, type: x.type, content: x.content, createdAt: x.createdAt.toISOString() }))
    )
  }

  async function handleGenerate() {
    if (!prompt.trim()) return
    setGenerating(true)
    const res = await generateProductionDocument(storyId, selectedTool as any, prompt)
    if (res?.message && !res.error) {
      await loadItems()
    }
    setGenerating(false)
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this document?")) return
    await deleteStoryAnalysis(id)
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  const currentTool = PRODUCTION_TOOLS.find((t) => t.id === selectedTool)

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <BackButton fallbackHref="/admin/ai-studio" className="mb-4 inline-block" />
      <h1 className="text-2xl font-bold text-red-700 dark:text-zinc-100">Film Production Pipeline</h1>
      {story && <p className="mt-1 text-zinc-500">{story.title}</p>}

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {PRODUCTION_TOOLS.map((tool) => (
          <button
            key={tool.id}
            type="button"
            onClick={() => setSelectedTool(tool.id)}
            className={`rounded-xl border p-4 text-left transition-all ${
              selectedTool === tool.id ? "border-red-300 bg-red-50 shadow-sm" : "bg-white hover:shadow-sm"
            }`}
          >
            <span className={`rounded px-2 py-0.5 text-xs font-medium ${tool.color}`}>{tool.label}</span>
            <p className="mt-2 text-xs text-zinc-500">{tool.desc}</p>
          </button>
        ))}
      </div>

      <div className="mt-6 rounded-xl border bg-white p-6">
        <h2 className="font-semibold mb-4">Generate {currentTool?.label}</h2>
        <div>
          <label className="block text-sm font-medium mb-1">Details *</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            placeholder={`Describe what you want for ${currentTool?.label?.toLowerCase()}...`}
            className="block w-full rounded-lg border px-3 py-2 text-sm"
          />
        </div>
        <Button className="mt-4" onClick={handleGenerate} disabled={generating || !prompt.trim()}>
          {generating ? "Generating..." : `Generate ${currentTool?.label}`}
        </Button>
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-semibold mb-4">Production Documents ({items.length})</h2>
        {items.length === 0 ? (
          <p className="text-zinc-400">No production documents generated yet.</p>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="rounded-xl border bg-white p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                    {PRODUCTION_TOOLS.find((t) => t.id === item.type)?.label ?? item.type}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-400">{new Date(item.createdAt).toLocaleDateString()}</span>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}>Delete</Button>
                  </div>
                </div>
                <div className="prose prose-sm max-w-none whitespace-pre-wrap text-sm text-zinc-700">{item.content}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
