"use client"

import { useState, useEffect, use } from "react"
import { generateEnvironment, getEnvironments, deleteEnvironment } from "@/app/actions/ai-studio"
import { getStoryById } from "@/app/actions/stories"
import { Button } from "@/components/ui/Button"
import { BackButton } from "@/components/ui/BackButton"

interface EnvItem { id: string; name: string; description: string; imageUrl: string | null; mood: string | null; metadata: string | null; createdAt: Date }

export default function EnvironmentPage({ params }: { params: Promise<{ storyId: string }> }) {
  const { storyId } = use(params)
  const [story, setStory] = useState<{ title: string } | null>(null)
  const [environments, setEnvironments] = useState<{ id: string; name: string; description: string; imageUrl: string | null; createdAt: string }[]>([])
  const [prompt, setPrompt] = useState("")
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    getStoryById(storyId).then((s) => { if (s) setStory({ title: s.title }) })
    getEnvironments(storyId).then((e: EnvItem[]) =>
      setEnvironments(e.map((x) => ({ ...x, createdAt: x.createdAt.toISOString() })))
    )
  }, [storyId])

  async function handleGenerate() {
    if (!prompt.trim()) return
    setGenerating(true)
    const res = await generateEnvironment(storyId, prompt)
    if (res?.message && !res.error) {
      const data: EnvItem[] = await getEnvironments(storyId)
      setEnvironments(data.map((x) => ({ ...x, createdAt: x.createdAt.toISOString() })))
    }
    setGenerating(false)
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this environment?")) return
    await deleteEnvironment(id)
    setEnvironments((prev) => prev.filter((e) => e.id !== id))
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <BackButton fallbackHref="/admin/ai-studio" className="mb-4 inline-block" />
      <h1 className="text-2xl font-bold text-green-700 dark:text-zinc-100">Environment Generator</h1>
      {story && <p className="mt-1 text-zinc-500">{story.title}</p>}

      <div className="mt-6 rounded-xl border bg-white p-6">
        <h2 className="font-semibold mb-4">Design Environment</h2>
        <div>
          <label className="block text-sm font-medium mb-1">Environment Description *</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            placeholder="Describe the environment: location type, mood, architecture, lighting, key features..."
            className="block w-full rounded-lg border px-3 py-2 text-sm"
          />
        </div>
        <Button className="mt-4" onClick={handleGenerate} disabled={generating || !prompt.trim()}>
          {generating ? "Generating..." : "Generate Environment"}
        </Button>
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-semibold mb-4">Generated Environments ({environments.length})</h2>
        {environments.length === 0 ? (
          <p className="text-zinc-400">No environments generated yet.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {environments.map((env) => (
              <div key={env.id} className="rounded-xl border bg-white p-5">
                {env.imageUrl && (
                  <img src={env.imageUrl} alt={env.name} className="mb-3 h-48 w-full rounded-lg object-cover" />
                )}
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-zinc-800">{env.name}</h3>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(env.id)}>Delete</Button>
                </div>
                <div className="prose prose-sm max-w-none whitespace-pre-wrap text-xs text-zinc-600">{env.description}</div>
                <p className="mt-2 text-xs text-zinc-400">{new Date(env.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
