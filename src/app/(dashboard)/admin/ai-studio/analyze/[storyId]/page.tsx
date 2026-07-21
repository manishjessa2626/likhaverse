"use client"

import { useActionState, useEffect, useState, use } from "react"
import { saveStoryAnalysis, getStoryAnalyses, deleteStoryAnalysis, analyzeWithAI } from "@/app/actions/ai-studio"
import { getStoryById } from "@/app/actions/stories"
import { Button } from "@/components/ui/Button"
import { BackButton } from "@/components/ui/BackButton"

interface Analysis {
  id: string; type: string; content: string; metadata: string | null; createdAt: string
}

const ANALYSIS_TYPES = [
  { id: "CHARACTER_PROFILES", label: "Character Profiles", color: "purple" },
  { id: "TIMELINE", label: "Timeline", color: "blue" },
  { id: "WORLD_HISTORY", label: "World History", color: "cyan" },
  { id: "RELATIONSHIPS", label: "Relationships", color: "pink" },
  { id: "THEMES", label: "Themes & Analysis", color: "amber" },
] as const

export default function AnalyzePage({ params }: { params: Promise<{ storyId: string }> }) {
  const { storyId } = use(params)
  const [story, setStory] = useState<{ title: string; wordCount: number } | null>(null)
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [state, formAction, pending] = useActionState(saveStoryAnalysis.bind(null, storyId), undefined)
  const [analysisType, setAnalysisType] = useState("CHARACTER_PROFILES")
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    getStoryById(storyId).then((s) => {
      if (s) setStory({ title: s.title, wordCount: s.wordCount })
    })
    getStoryAnalyses(storyId).then((a) =>
      setAnalyses(a.map((x) => ({ ...x, createdAt: x.createdAt.toISOString() })))
    )
  }, [storyId])

  async function handleAI() {
    setGenerating(true)
    const res = await analyzeWithAI(storyId, analysisType)
    if (res?.message && !res.error) {
      const data = await getStoryAnalyses(storyId)
      setAnalyses(data.map((x) => ({ ...x, createdAt: x.createdAt.toISOString() })))
    }
    setGenerating(false)
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this analysis?")) return
    await deleteStoryAnalysis(id)
    setAnalyses((prev) => prev.filter((a) => a.id !== id))
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <BackButton fallbackHref="/admin/ai-studio" className="mb-4 inline-block" />
      <h1 className="text-2xl font-bold text-purple-700 dark:text-zinc-100">Story Analyzer</h1>
      {story && <p className="mt-1 text-zinc-500">{story.title} &middot; {story.wordCount.toLocaleString()} words</p>}

      <div className="mt-6 rounded-xl border bg-white p-6">
        <h2 className="font-semibold mb-4">AI-Powered Analysis</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {ANALYSIS_TYPES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setAnalysisType(t.id)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                analysisType === t.id
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-zinc-300 text-zinc-600 hover:border-zinc-400"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <Button onClick={handleAI} disabled={generating}>
          {generating ? "Analyzing..." : `Generate ${ANALYSIS_TYPES.find((t) => t.id === analysisType)?.label}`}
        </Button>
      </div>

      <div className="mt-6 rounded-xl border bg-white p-6">
        <h2 className="font-semibold mb-4">Manual Analysis</h2>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="type" value={analysisType} />
          <div>
            <label className="block text-sm font-medium mb-1">Content</label>
            <textarea name="content" required rows={6} className="block w-full rounded-lg border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Metadata (JSON, optional)</label>
            <input name="metadata" className="block w-full rounded-lg border px-3 py-2 text-sm" />
          </div>
          <Button type="submit" disabled={pending}>Save Analysis</Button>
          {state?.message && !state?.error && <p className="text-sm text-green-600">{state.message}</p>}
        </form>
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-semibold mb-4">Saved Analyses ({analyses.length})</h2>
        {analyses.length === 0 ? (
          <p className="text-zinc-400">No analyses saved yet.</p>
        ) : (
          <div className="space-y-4">
            {analyses.map((a) => (
              <div key={a.id} className="rounded-xl border bg-white p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="rounded bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                    {ANALYSIS_TYPES.find((t) => t.id === a.type)?.label ?? a.type}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-400">{new Date(a.createdAt).toLocaleDateString()}</span>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(a.id)}>Delete</Button>
                  </div>
                </div>
                <div className="prose prose-sm max-w-none whitespace-pre-wrap text-sm text-zinc-700">{a.content}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
