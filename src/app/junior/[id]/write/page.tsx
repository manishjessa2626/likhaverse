"use client"

import { useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { PenLine, Shuffle, Save, Trash2 } from "lucide-react"

const ROLES = [
  "Brave Knight 🗡️", "Clever Detective 🔍", "Space Explorer 🚀",
  "Friendly Dragon 🐉", "Ocean Mermaid 🧜‍♀️", "Time Traveler ⏰",
  "Superhero 🦸", "Magical Unicorn 🦄", "Pirate Captain ⚓",
  "Wizard 🧙", "Animal Scientist 🔬", "Chef 🧑‍🍳",
]

const LOCATIONS = [
  "Enchanted Forest 🌲", "Deep Ocean 🌊", "Outer Space 🌌",
  "Ancient Castle 🏰", "Mysterious Island 🏝️", "Magical School 🏫",
  "Dinosaur World 🦕", "Candy Kingdom 🍭", "Flying City ☁️",
  "Underground Cave 🕯️", "Robot Factory 🤖", "Rainbow Mountain 🌈",
]

const ADVENTURES = [
  "finding a hidden treasure",
  "making a new friend",
  "saving the day",
  "solving a big mystery",
  "learning a secret power",
  "going on a magical journey",
  "building something amazing",
  "discovering a lost world",
  "helping someone in need",
  "competing in a fun contest",
]

const OPENINGS = [
  "Once upon a time, in a land far, far away,",
  "On a sunny morning, just like today,",
  "Deep in the heart of the forest,",
  "It was a dark and stormy night when",
  "In a world not so different from ours,",
  "The adventure began when",
]

export default function JuniorWritePage() {
  const params = useParams()
  const id = params.id as string
  const [role, setRole] = useState("")
  const [location, setLocation] = useState("")
  const [adventure, setAdventure] = useState("")
  const [text, setText] = useState("")
  const [title, setTitle] = useState("")
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  const surpriseMe = useCallback(() => {
    setRole(ROLES[Math.floor(Math.random() * ROLES.length)])
    setLocation(LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)])
    setAdventure(ADVENTURES[Math.floor(Math.random() * ADVENTURES.length)])
    setText("")
    setTitle("")
    setSaved(false)
  }, [])

  const generateOpening = useCallback(() => {
    if (!text) {
      const opening = OPENINGS[Math.floor(Math.random() * OPENINGS.length)]
      const prompt = `${opening} a ${role || "brave hero"} in ${location || "a magical place"} who is ${adventure || "on a quest"}...`
      setText(prompt)
    }
  }, [text, role, location, adventure])

  const handleSave = async () => {
    if (!title.trim() || !text.trim()) return
    setSaving(true)
    try {
      await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content: text,
          blurb: `A story by a young author who was ${role || "a storyteller"} in ${location || "their imagination"}.`,
          ageRating: "everyone",
          tags: "junior,children",
          status: "draft",
        }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
    } finally {
      setSaving(false)
    }
  }

  const clearAll = () => {
    setRole("")
    setLocation("")
    setAdventure("")
    setText("")
    setTitle("")
    setSaved(false)
  }

  const wordCount = text ? text.split(/\s+/).filter(Boolean).length : 0

  return (
    <div className="mx-auto max-w-3xl p-4 md:p-8">
      <div className="mb-6 flex items-center gap-3">
        <PenLine size={24} className="text-pink-500" />
        <h1 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">Write a Story</h1>
      </div>

      {!role && !location && !adventure && !text ? (
        <div className="space-y-4">
          <p className="text-sm text-zinc-500">Choose your story ingredients to begin:</p>

          <div>
            <p className="mb-2 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Who are you?</p>
            <div className="flex flex-wrap gap-2">
              {ROLES.map((r) => (
                <button key={r} onClick={() => setRole(r)}
                  className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition-all ${
                    role === r
                      ? "border-purple-400 bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300"
                      : "border-purple-200/60 bg-white/70 text-zinc-600 hover:border-purple-300 dark:border-zinc-700/60 dark:bg-zinc-800/70 dark:text-zinc-400"
                  }`}>{r}</button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Where are you?</p>
            <div className="flex flex-wrap gap-2">
              {LOCATIONS.map((l) => (
                <button key={l} onClick={() => setLocation(l)}
                  className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition-all ${
                    location === l
                      ? "border-purple-400 bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300"
                      : "border-purple-200/60 bg-white/70 text-zinc-600 hover:border-purple-300 dark:border-zinc-700/60 dark:bg-zinc-800/70 dark:text-zinc-400"
                  }`}>{l}</button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold text-zinc-500 uppercase tracking-wide">What happens?</p>
            <div className="flex flex-wrap gap-2">
              {ADVENTURES.map((a) => (
                <button key={a} onClick={() => setAdventure(a)}
                  className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition-all ${
                    adventure === a
                      ? "border-purple-400 bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300"
                      : "border-purple-200/60 bg-white/70 text-zinc-600 hover:border-purple-300 dark:border-zinc-700/60 dark:bg-zinc-800/70 dark:text-zinc-400"
                  }`}>{a}</button>
              ))}
            </div>
          </div>

          <button onClick={surpriseMe}
            className="flex items-center gap-2 rounded-xl border border-orange-200/60 bg-orange-50/70 px-4 py-2.5 text-sm font-medium text-orange-600 hover:bg-orange-100/70 dark:border-orange-800/60 dark:bg-orange-900/30 dark:text-orange-400">
            <Shuffle size={16} />
            Surprise Me!
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
            {role && <span className="rounded-lg bg-purple-100 px-2 py-1 dark:bg-purple-900/40">{role}</span>}
            {location && <span className="rounded-lg bg-pink-100 px-2 py-1 dark:bg-pink-900/40">{location}</span>}
            {adventure && <span className="rounded-lg bg-orange-100 px-2 py-1 dark:bg-orange-900/40">{adventure}</span>}
            <button onClick={clearAll} className="ml-auto text-zinc-400 hover:text-red-500">
              <Trash2 size={14} />
            </button>
          </div>

          <input
            type="text"
            placeholder="Give your story a title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-purple-200/60 bg-white/70 px-4 py-3 text-lg font-bold text-zinc-800 placeholder:text-zinc-300 focus:border-purple-400 focus:outline-none dark:border-zinc-700/60 dark:bg-zinc-800/70 dark:text-zinc-100"
          />

          <div className="relative">
            <textarea
              placeholder="Once upon a time..."
              value={text}
              onChange={(e) => { setText(e.target.value); setSaved(false) }}
              rows={14}
              className="w-full rounded-xl border border-purple-200/60 bg-white/70 p-4 text-sm text-zinc-700 placeholder:text-zinc-300 focus:border-purple-400 focus:outline-none dark:border-zinc-700/60 dark:bg-zinc-800/70 dark:text-zinc-300"
            />
            {!text && (
              <button
                onClick={generateOpening}
                className="absolute left-4 top-4 rounded-lg border border-purple-200/60 bg-purple-50/70 px-3 py-1 text-xs text-purple-600 hover:bg-purple-100/70 dark:border-zinc-700/60 dark:bg-zinc-800 dark:text-purple-400"
              >
                ✨ Give me a start
              </button>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400">{wordCount} words</span>
            <div className="flex items-center gap-2">
              <button onClick={surpriseMe}
                className="rounded-xl border border-orange-200/60 bg-orange-50/70 px-3 py-1.5 text-xs font-medium text-orange-600 hover:bg-orange-100/70 dark:border-orange-800/60 dark:bg-orange-900/30 dark:text-orange-400">
                <Shuffle size={12} className="inline mr-1" />
                Surprise Me
              </button>
              <button onClick={handleSave} disabled={!title.trim() || !text.trim() || saving}
                className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-purple-500 disabled:opacity-50">
                <Save size={14} />
                {saving ? "Saving..." : saved ? "Saved!" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
