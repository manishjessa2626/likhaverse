"use client"

import { useState, useEffect, use } from "react"
import { generateCharacterSheet, getStoryAnalyses, deleteStoryAnalysis } from "@/app/actions/ai-studio"
import { getStoryById } from "@/app/actions/stories"
import { Button } from "@/components/ui/Button"
import { BackButton } from "@/components/ui/BackButton"

export default function CharacterSheetsPage({ params }: { params: Promise<{ storyId: string }> }) {
  const { storyId } = use(params)
  const [story, setStory] = useState<{ title: string } | null>(null)
  const [sheets, setSheets] = useState<{ id: string; content: string; createdAt: string }[]>([])
  const [prompt, setPrompt] = useState("")
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    getStoryById(storyId).then((s) => {
      if (s) setStory({ title: s.title })
    })
    getStoryAnalyses(storyId).then((a) =>
      setSheets(
        a
          .filter((x) => x.type === "CHARACTER_SHEET")
          .map((x) => ({ id: x.id, content: x.content, createdAt: x.createdAt.toISOString() }))
      )
    )
  }, [storyId])

  async function handleGenerate() {
    if (!prompt.trim()) return
    setGenerating(true)
    const res = await generateCharacterSheet(storyId, prompt)
    if (res?.message && !res.error) {
      const data = await getStoryAnalyses(storyId)
      setSheets(
        data
          .filter((x) => x.type === "CHARACTER_SHEET")
          .map((x) => ({ id: x.id, content: x.content, createdAt: x.createdAt.toISOString() }))
      )
    }
    setGenerating(false)
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this sheet?")) return
    await deleteStoryAnalysis(id)
    setSheets((prev) => prev.filter((s) => s.id !== id))
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <BackButton fallbackHref="/admin/ai-studio" className="mb-4 inline-block" />
      <h1 className="text-2xl font-bold text-pink-700 dark:text-zinc-100">Character Sheet Generator</h1>
      {story && <p className="mt-1 text-zinc-500">{story.title}</p>}

      <div className="mt-6 rounded-xl border bg-white p-6">
        <h2 className="font-semibold mb-4">Generate Character Sheet</h2>
        <div>
          <label className="block text-sm font-medium mb-1">Character Description *</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            placeholder="Describe the character: name, role, personality traits, appearance, backstory..."
            className="block w-full rounded-lg border px-3 py-2 text-sm"
          />
        </div>
        <Button className="mt-4" onClick={handleGenerate} disabled={generating || !prompt.trim()}>
          {generating ? "Generating..." : "Generate Character Sheet"}
        </Button>
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-semibold mb-4">Generated Sheets ({sheets.length})</h2>
        {sheets.length === 0 ? (
          <p className="text-zinc-400">No character sheets generated yet.</p>
        ) : (
          <div className="space-y-4">
            {sheets.map((sheet) => (
              <div key={sheet.id} className="rounded-xl border bg-white p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="rounded bg-pink-100 px-2 py-0.5 text-xs font-medium text-pink-700">Character Sheet</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-400">{new Date(sheet.createdAt).toLocaleDateString()}</span>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(sheet.id)}>Delete</Button>
                  </div>
                </div>
                <div className="prose prose-sm max-w-none whitespace-pre-wrap text-sm text-zinc-700">{sheet.content}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
