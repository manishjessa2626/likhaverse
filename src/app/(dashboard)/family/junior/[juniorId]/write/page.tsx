"use client"

import { use, useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"

const HEROES = [
  { emoji: "🐶", label: "Dog", value: "DOG" },
  { emoji: "🐱", label: "Cat", value: "CAT" },
  { emoji: "🦊", label: "Fox", value: "FOX" },
  { emoji: "🧙", label: "Wizard", value: "WIZARD" },
  { emoji: "👧", label: "Princess", value: "PRINCESS" },
  { emoji: "🚀", label: "Astronaut", value: "ASTRONAUT" },
]

const SETTINGS = [
  { emoji: "🌳", label: "Forest", value: "FOREST" },
  { emoji: "🏰", label: "Castle", value: "CASTLE" },
  { emoji: "🌙", label: "Moon", value: "MOON" },
  { emoji: "🌊", label: "Ocean", value: "OCEAN" },
  { emoji: "🏫", label: "School", value: "SCHOOL" },
]

const PLOTS = [
  { emoji: "🗺️", label: "Treasure Hunt", value: "TREASURE_HUNT" },
  { emoji: "🐉", label: "Meet a Dragon", value: "MEET_DRAGON" },
  { emoji: "🤝", label: "Make a Friend", value: "MAKE_FRIEND" },
  { emoji: "🎂", label: "Birthday Adventure", value: "BIRTHDAY" },
  { emoji: "🚀", label: "Space Journey", value: "SPACE_JOURNEY" },
]

function generateStory(hero: string, setting: string, plot: string): string {
  const heroLabel = HEROES.find((h) => h.value === hero)?.label || hero
  const settingLabel = SETTINGS.find((s) => s.value === setting)?.label || setting

  const openings: Record<string, string> = {
    TREASURE_HUNT: `Once upon a time, a brave ${heroLabel} found a mysterious map hidden in the ${settingLabel}. The map showed the way to a secret treasure!`,
    MEET_DRAGON: `In a magical corner of the ${settingLabel}, a curious ${heroLabel} discovered a friendly dragon who needed help.`,
    MAKE_FRIEND: `A lonely ${heroLabel} was exploring the ${settingLabel} when they met someone very special.`,
    BIRTHDAY: `It was a special day in the ${settingLabel}! The ${heroLabel} was having a birthday party, but something unexpected happened.`,
    SPACE_JOURNEY: `The ${heroLabel} looked up at the stars and dreamed of flying to space. One day, a magical spaceship landed in the ${settingLabel}!`,
  }

  const middles: Record<string, string> = {
    TREASURE_HUNT: "Along the way, they solved riddles, crossed a rainbow bridge, and made new friends. The treasure turned out to be something even more wonderful than gold!",
    MEET_DRAGON: "The dragon was actually very kind and loved to tell stories. Together, they flew across the sky and helped other creatures in need.",
    MAKE_FRIEND: "They quickly became best friends and spent the day playing, laughing, and sharing secrets. Sometimes the best adventures are the ones you share with a friend.",
    BIRTHDAY: "A magical creature appeared with a special gift. Everyone cheered and the birthday became the most unforgettable celebration ever!",
    SPACE_JOURNEY: "They zoomed past planets, danced with stars, and discovered a new galaxy. Space was full of wonders and surprises at every turn!",
  }

  const endings = "And from that day on, every adventure reminded them that with courage and kindness, anything is possible. The End."

  return `${openings[plot] || "Once upon a time, there was a brave hero..."}\n\n${middles[plot] || "They went on an amazing adventure full of surprises."}\n\n${endings}`
}

export default function JuniorWritePage({ params }: { params: Promise<{ juniorId: string }> }) {
  const { juniorId } = use(params)
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [hero, setHero] = useState("")
  const [setting, setSetting] = useState("")
  const [plot, setPlot] = useState("")
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [autoSaveTimer, setAutoSaveTimer] = useState<ReturnType<typeof setTimeout> | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0

  const handleGenerate = () => {
    const story = generateStory(hero, setting, plot)
    const t = `My ${HEROES.find((h) => h.value === hero)?.label || "Hero"} Story`
    setTitle(t)
    setContent(story)
    setStep(3)
  }

  const handleSave = useCallback(async () => {
    if (!title || !content) return
    setSaving(true)
    try {
      const res = await fetch("/api/family/junior/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          juniorId,
          title,
          content,
          heroType: hero,
          setting,
          plotType: plot,
        }),
      })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => router.push(`/family/junior/${juniorId}/home`), 1500)
      }
    } catch {
    } finally {
      setSaving(false)
    }
  }, [title, content, hero, setting, plot, juniorId, router])

  useEffect(() => {
    if (autoSaveTimer) clearTimeout(autoSaveTimer)
    if (content && content.length > 20) {
      const timer = setTimeout(() => {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }, 5000)
      setAutoSaveTimer(timer)
    }
    return () => { if (autoSaveTimer) clearTimeout(autoSaveTimer) }
  }, [content])

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-purple-100 to-pink-100">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6 flex items-center gap-3">
          <button onClick={() => step > 0 ? setStep(step - 1) : router.back()} className="text-purple-600 hover:text-purple-800 text-lg">&larr;</button>
          <h1 className="text-2xl font-bold text-purple-900">✍️ Write My Story</h1>
        </div>

        <div className="mb-6 flex gap-2">
          {[0, 1, 2, 3].map((s) => (
            <div key={s} className={`h-2 flex-1 rounded-full transition-colors ${step >= s ? "bg-purple-500" : "bg-purple-200"}`} />
          ))}
        </div>

        {step === 0 && (
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-lg font-bold text-purple-900 mb-4">Who is your hero?</h2>
            <div className="grid grid-cols-3 gap-3">
              {HEROES.map((h) => (
                <button
                  key={h.value}
                  onClick={() => { setHero(h.value); setStep(1) }}
                  className="rounded-2xl bg-white/70 backdrop-blur-sm border-2 border-purple-200/60 p-4 flex flex-col items-center gap-2 hover:border-purple-400 hover:shadow-md transition-all"
                >
                  <span className="text-4xl">{h.emoji}</span>
                  <span className="text-sm font-medium text-purple-800">{h.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-lg font-bold text-purple-900 mb-4">Where does it happen?</h2>
            <div className="grid grid-cols-3 gap-3">
              {SETTINGS.map((s) => (
                <button
                  key={s.value}
                  onClick={() => { setSetting(s.value); setStep(2) }}
                  className="rounded-2xl bg-white/70 backdrop-blur-sm border-2 border-purple-200/60 p-4 flex flex-col items-center gap-2 hover:border-purple-400 hover:shadow-md transition-all"
                >
                  <span className="text-4xl">{s.emoji}</span>
                  <span className="text-sm font-medium text-purple-800">{s.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-lg font-bold text-purple-900 mb-4">What happens?</h2>
            <div className="grid grid-cols-3 gap-3">
              {PLOTS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => { setPlot(p.value); handleGenerate() }}
                  className="rounded-2xl bg-white/70 backdrop-blur-sm border-2 border-purple-200/60 p-4 flex flex-col items-center gap-2 hover:border-purple-400 hover:shadow-md transition-all"
                >
                  <span className="text-4xl">{p.emoji}</span>
                  <span className="text-sm font-medium text-purple-800">{p.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="glass-card rounded-2xl p-6">
              <label className="text-sm font-medium text-zinc-600">Story Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-purple-200/60 bg-white/70 px-4 py-3 text-lg font-bold text-purple-900 outline-none focus:border-purple-400"
                placeholder="My Story Title"
              />
            </div>

            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-zinc-600">Your Story</label>
                <div className="flex items-center gap-3 text-xs text-zinc-500">
                  {saved && <span className="text-emerald-600">Saved!</span>}
                  <span>{wordCount} words</span>
                </div>
              </div>
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[300px] w-full rounded-xl border border-purple-200/60 bg-white/70 p-4 text-base leading-relaxed text-purple-900 outline-none focus:border-purple-400 resize-y"
                placeholder="Once upon a time..."
              />
              <div className="mt-4 flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving || !content}
                  className="flex-1 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white py-3 font-bold text-sm transition-colors"
                >
                  {saving ? "Saving..." : "💾 Save Story"}
                </button>
                <button className="rounded-xl bg-amber-500 hover:bg-amber-400 text-white px-6 py-3 font-bold text-sm transition-colors">
                  🔊 Read Aloud
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
