"use client"

import { useActionState, useEffect, useState, useCallback } from "react"
import {
  generateCover,
  generateCoverVariations,
  setStoryCover,
  deleteGeneration,
  getStoryCovers,
} from "@/app/actions/ai"

const COVER_STYLES = [
  { id: "fantasy", label: "Fantasy" },
  { id: "romance", label: "Romance" },
  { id: "dark", label: "Dark / Horror" },
  { id: "scifi", label: "Sci-Fi" },
  { id: "anime", label: "Anime / Manga" },
  { id: "watercolor", label: "Watercolor" },
  { id: "minimalist", label: "Minimalist" },
  { id: "vintage", label: "Vintage / Retro" },
]
import { getAuthorStories } from "@/app/actions/stories"
import { Button } from "@/components/ui/Button"
import { BackButton } from "@/components/ui/BackButton"

const STYLE_NAMES: Record<string, string> = {
  FANTASY: "Fantasy", ROMANCE: "Romance", DARK_HORROR: "Dark/Horror",
  SCI_FI: "Sci-Fi", ANIME_MANGA: "Anime/Manga", WATERCOLOR: "Watercolor",
  MINIMALIST: "Minimalist", VINTAGE_RETRO: "Vintage/Retro", AUTO: "Auto",
}

const STATUS_MESSAGES = [
  "Creating your world...",
  "Painting your cover...",
  "Adding cinematic lighting...",
  "Applying artistic touches...",
  "Finalizing your masterpiece...",
]

interface Story { id: string; title: string; cover: string | null }
interface CoverGen {
  id: string; prompt: string; imageUrl: string | null; thumbnailUrl?: string | null
  createdAt: string; style?: string | null; provider?: string | null
}

export default function AICoverPage() {
  const [state, formAction, pending] = useActionState(generateCover, undefined)
  const [stories, setStories] = useState<Story[]>([])
  const [covers, setCovers] = useState<CoverGen[]>([])
  const [selectedStoryId, setSelectedStoryId] = useState("")
  const [basePrompt, setBasePrompt] = useState("")
  const [selectedStyle, setSelectedStyle] = useState("")
  const [variationsPending, setVariationsPending] = useState(false)
  const [coverMsg, setCoverMsg] = useState("")
  const [statusMessage, setStatusMessage] = useState("")
  const [statusIndex, setStatusIndex] = useState(0)

  useEffect(() => {
    if (pending || variationsPending) {
      setStatusMessage(STATUS_MESSAGES[0])
      setStatusIndex(0)
      const interval = setInterval(() => {
        setStatusIndex((i) => {
          const next = (i + 1) % STATUS_MESSAGES.length
          setStatusMessage(STATUS_MESSAGES[next])
          return next
        })
      }, 3000)
      return () => clearInterval(interval)
    } else {
      setStatusMessage("")
    }
  }, [pending, variationsPending])

  const loadCovers = useCallback(async (storyId: string) => {
    const data = await getStoryCovers(storyId)
    setCovers(data.map((g) => ({
      ...g,
      style: (g as any).style,
      thumbnailUrl: (g as any).thumbnailUrl,
      provider: (g as any).provider,
      createdAt: g.createdAt.toISOString(),
    })))
  }, [])

  useEffect(() => {
    getAuthorStories().then((s) => {
      setStories(s)
      if (s.length > 0) setSelectedStoryId(s[0].id)
    })
  }, [])

  useEffect(() => {
    if (selectedStoryId) loadCovers(selectedStoryId)
  }, [selectedStoryId, loadCovers])

  useEffect(() => {
    if (state?.message && !state?.error && selectedStoryId) {
      loadCovers(selectedStoryId)
    }
  }, [state, selectedStoryId, loadCovers])

  async function handleVariations() {
    if (!selectedStoryId || !basePrompt.trim()) return
    setVariationsPending(true)
    setCoverMsg("")
    const fd = new FormData()
    fd.set("storyId", selectedStoryId)
    fd.set("prompt", basePrompt)
    await generateCoverVariations(fd)
    setVariationsPending(false)
    loadCovers(selectedStoryId)
  }

  async function handleSetCover(imageUrl: string) {
    setCoverMsg("")
    const res = await setStoryCover(selectedStoryId, imageUrl)
    setCoverMsg(res.message)
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this generation?")) return
    await deleteGeneration(id)
    loadCovers(selectedStoryId)
  }

  const activeStory = stories.find((s) => s.id === selectedStoryId)

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <BackButton fallbackHref="/author/ai" className="mb-4 inline-block" />
      <h1 className="text-2xl font-bold text-amber-700 dark:text-zinc-100">Cover Art Generator</h1>
      <p className="mt-1 text-zinc-500">Generate, style, and set cover art for your stories.</p>

      <div className="mt-6">
        <label className="block text-sm font-medium mb-1">Select Story</label>
        <select
          value={selectedStoryId}
          onChange={(e) => setSelectedStoryId(e.target.value)}
          className="block w-full max-w-md rounded-lg border px-3 py-2 text-sm"
        >
          {stories.map((s) => (
            <option key={s.id} value={s.id}>{s.title}</option>
          ))}
        </select>
        {activeStory?.cover && (
          <p className="mt-1 text-xs text-green-600">
            Current cover set.{" "}
            <img src={activeStory.cover} alt="" className="mt-1 inline-block h-10 w-8 rounded object-cover" />
          </p>
        )}
      </div>

      <div className="mt-6 space-y-4 rounded-xl border p-6">
        <h2 className="font-semibold">Generate New Cover</h2>

        {(pending || variationsPending) && (
          <div className="flex items-center gap-3 rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-700">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            <span>{statusMessage}</span>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Prompt *</label>
          <textarea
            value={basePrompt}
            onChange={(e) => setBasePrompt(e.target.value)}
            required
            rows={3}
            placeholder="Describe the cover you want... e.g., A fantasy landscape with a glowing castle on a mountain, sunset sky"
            className="block w-full rounded-lg border px-3 py-2 text-sm"
            disabled={pending || variationsPending}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Art Style</label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedStyle("")}
              disabled={pending || variationsPending}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                !selectedStyle
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-zinc-300 text-zinc-600 hover:border-zinc-400"
              } disabled:opacity-50`}
            >
              Auto
            </button>
            {COVER_STYLES.map((style) => (
              <button
                key={style.id}
                type="button"
                onClick={() => setSelectedStyle(style.id)}
                disabled={pending || variationsPending}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                  selectedStyle === style.id
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-zinc-300 text-zinc-600 hover:border-zinc-400"
                } disabled:opacity-50`}
              >
                {style.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <form action={formAction}>
            <input type="hidden" name="storyId" value={selectedStoryId} />
            <input type="hidden" name="prompt" value={basePrompt} />
            <input type="hidden" name="style" value={selectedStyle} />
            <Button type="submit" disabled={pending || variationsPending || !basePrompt.trim()}>
              {pending ? "Generating..." : "Generate Cover"}
            </Button>
          </form>
          <Button
            variant="secondary"
            disabled={variationsPending || pending || !basePrompt.trim()}
            onClick={handleVariations}
          >
            {variationsPending ? "Generating All..." : "Generate All Styles"}
          </Button>
        </div>
      </div>

      {coverMsg && (
        <p className={`mt-3 text-sm ${coverMsg === "Cover set!" ? "text-green-600" : "text-red-500"}`}>
          {coverMsg}
        </p>
      )}

      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Generated Covers ({covers.length})</h2>
          {covers.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => loadCovers(selectedStoryId)}>
              Refresh
            </Button>
          )}
        </div>

        {covers.length === 0 ? (
          <p className="text-zinc-400">No covers generated yet for this story.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {covers.map((gen) => (
              <div key={gen.id} className="rounded-xl border bg-white p-4">
                {gen.imageUrl ? (
                  <img
                    src={gen.imageUrl}
                    alt={gen.prompt}
                    className="mb-3 aspect-[3/4] w-full rounded-lg object-cover"
                  />
                ) : (
                  <div className="mb-3 aspect-[3/4] w-full rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-400 text-sm">
                    Failed
                  </div>
                )}
                <p className="text-xs text-zinc-500 line-clamp-2">{gen.prompt}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                  {gen.style && STYLE_NAMES[gen.style] && (
                    <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs font-medium">
                      {STYLE_NAMES[gen.style]}
                    </span>
                  )}
                  {gen.provider && gen.provider !== "pending" && (
                    <span className="text-zinc-400">{gen.provider}</span>
                  )}
                  <span>{new Date(gen.createdAt).toLocaleDateString()}</span>
                </div>
                {gen.imageUrl && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => handleSetCover(gen.imageUrl!)}>
                      Set as Cover
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(gen.id)}>
                      Delete
                    </Button>
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
