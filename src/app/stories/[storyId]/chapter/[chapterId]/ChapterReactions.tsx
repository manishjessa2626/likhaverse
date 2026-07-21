"use client"

import { useEffect, useState, useTransition } from "react"
import { toggleReaction, getChapterReactions } from "@/app/actions/reactions"

const REACTIONS = [
  { type: "LOVE", icon: "♥", label: "Love" },
  { type: "FUNNY", icon: "☺", label: "Funny" },
  { type: "SAD", icon: "⊙", label: "Sad" },
  { type: "SURPRISED", icon: "◎", label: "Surprised" },
  { type: "AMAZING", icon: "✦", label: "Amazing" },
]

export function ChapterReactions({ chapterId }: { chapterId: string }) {
  const [data, setData] = useState<{
    counts: Record<string, number>
    userReactions: string[]
  }>({ counts: {}, userReactions: [] })
  const [reacting, setReacting] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    getChapterReactions(chapterId).then(setData)
  }, [chapterId])

  function handleReact(type: string) {
    if (reacting || pending) return
    const active = data.userReactions.includes(type)
    const optimistic = {
      counts: {
        ...data.counts,
        [type]: (data.counts[type] ?? 0) + (active ? -1 : 1),
      },
      userReactions: active
        ? data.userReactions.filter((r) => r !== type)
        : [...data.userReactions, type],
    }
    setData(optimistic)
    setReacting(type)
    startTransition(async () => {
      try {
        await toggleReaction(type, chapterId)
        const updated = await getChapterReactions(chapterId)
        setData(updated)
      } catch {
        setData(data)
      } finally {
        setReacting(null)
      }
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-2 mt-12">
      {REACTIONS.map(({ type, icon, label }) => {
        const active = data.userReactions.includes(type)
        const count = data.counts[type] ?? 0
        return (
          <button
            key={type}
            onClick={() => handleReact(type)}
            disabled={!!reacting}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 disabled:opacity-50 ${
              active
                ? "bg-amber-100 text-amber-700 shadow-sm dark:bg-amber-900/30 dark:text-amber-400"
                : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-200"
            }`}
          >
            <span className="text-base leading-none">{icon}</span>
            <span>{label}</span>
            {count > 0 && (
              <span className={`ml-0.5 text-xs font-semibold ${active ? "text-amber-600 dark:text-amber-300" : "text-zinc-400"}`}>
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
