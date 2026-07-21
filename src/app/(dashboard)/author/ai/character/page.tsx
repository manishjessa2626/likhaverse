"use client"

import { useActionState, useEffect, useState } from "react"
import { generateCharacter, getStoryCharacters, deleteCharacter } from "@/app/actions/ai"
import { getAuthorStories } from "@/app/actions/stories"
import { Button } from "@/components/ui/Button"
import { BackButton } from "@/components/ui/BackButton"

interface Story { id: string; title: string }
interface Character {
  id: string; name: string; age: string | null; gender: string | null
  personality: string | null; appearance: string | null; clothing: string | null
  species: string | null; background: string | null; artStyle: string | null
  imageUrl: string | null; createdAt: string
}

export default function AICharacterPage() {
  const [state, formAction, pending] = useActionState(generateCharacter, undefined)
  const [stories, setStories] = useState<Story[]>([])
  const [characters, setCharacters] = useState<Character[]>([])
  const [selectedStoryId, setSelectedStoryId] = useState("")
  const [loadingChars, setLoadingChars] = useState(false)

  useEffect(() => {
    getAuthorStories().then((s) => {
      setStories(s)
      if (s.length > 0) setSelectedStoryId(s[0].id)
    })
  }, [])

  useEffect(() => {
    if (selectedStoryId) {
      setLoadingChars(true)
      getStoryCharacters(selectedStoryId).then((c) => {
        setCharacters(c.map((ch) => ({ ...ch, createdAt: ch.createdAt.toISOString() })))
        setLoadingChars(false)
      })
    }
  }, [selectedStoryId])

  useEffect(() => {
    if (state?.message && !state?.error && selectedStoryId) {
      getStoryCharacters(selectedStoryId).then((c) => {
        setCharacters(c.map((ch) => ({ ...ch, createdAt: ch.createdAt.toISOString() })))
      })
    }
  }, [state, selectedStoryId])

  async function handleDelete(characterId: string) {
    if (!confirm("Delete this character?")) return
    await deleteCharacter(characterId)
    if (selectedStoryId) {
      const c = await getStoryCharacters(selectedStoryId)
      setCharacters(c.map((ch) => ({ ...ch, createdAt: ch.createdAt.toISOString() })))
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <BackButton fallbackHref="/author/ai" className="mb-4 inline-block" />
      <h1 className="text-2xl font-bold text-amber-700 dark:text-zinc-100">Character Generator</h1>
      <p className="mt-1 text-zinc-500">Create detailed profiles for your story characters.</p>

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
      </div>

      <form action={formAction} className="mt-6 space-y-4 rounded-xl border p-6">
        <input type="hidden" name="storyId" value={selectedStoryId} />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input name="name" required className="block w-full rounded-lg border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Age</label>
            <input name="age" className="block w-full rounded-lg border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Gender</label>
            <input name="gender" className="block w-full rounded-lg border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Species</label>
            <input name="species" placeholder="Human, Elf, etc." className="block w-full rounded-lg border px-3 py-2 text-sm" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Personality</label>
          <textarea name="personality" rows={3} className="block w-full rounded-lg border px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Appearance</label>
          <textarea name="appearance" rows={3} className="block w-full rounded-lg border px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Clothing</label>
          <textarea name="clothing" rows={2} className="block w-full rounded-lg border px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Background</label>
          <textarea name="background" rows={4} className="block w-full rounded-lg border px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Art Style</label>
          <input name="artStyle" placeholder="Anime, Realistic, Watercolor, etc." className="block w-full rounded-lg border px-3 py-2 text-sm" />
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? "Generating..." : "Create Character"}
        </Button>
        {state?.message && !state?.error && (
          <p className="text-sm text-green-600">Character created!</p>
        )}
      </form>

      <div className="mt-10">
        <h2 className="text-lg font-semibold mb-4">Characters ({characters.length})</h2>
        {loadingChars ? (
          <p className="text-zinc-400">Loading...</p>
        ) : characters.length === 0 ? (
          <p className="text-zinc-400">No characters yet for this story.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {characters.map((char) => (
              <div key={char.id} className="rounded-xl border bg-white p-4">
                {char.imageUrl && (
                  <img src={char.imageUrl} alt={char.name} className="mb-3 h-48 w-full rounded-lg object-cover" />
                )}
                <h3 className="font-semibold text-zinc-800">{char.name}</h3>
                <div className="mt-1 space-y-1 text-xs text-zinc-500">
                  {char.age && <p>Age: {char.age}</p>}
                  {char.gender && <p>Gender: {char.gender}</p>}
                  {char.species && <p>Species: {char.species}</p>}
                </div>
                {char.personality && <p className="mt-2 text-xs text-zinc-600 line-clamp-3">{char.personality}</p>}
                <div className="mt-3 flex gap-2">
                  <Button variant="danger" size="sm" onClick={() => handleDelete(char.id)}>Delete</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
