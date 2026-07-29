"use client"

import { Sparkles } from "lucide-react"

export interface Category {
  id: string
  label: string
  emoji: string
  keywords: string[]
}

export const CATEGORIES: Category[] = [
  { id: "all", label: "All", emoji: "📚", keywords: [] },
  { id: "adventure", label: "Adventure", emoji: "🗺️", keywords: ["adventure", "quest", "journey", "explor"] },
  { id: "animals", label: "Animals", emoji: "🐾", keywords: ["animal", "dog", "cat", "dragon", "unicorn", "horse", "bird", "pet"] },
  { id: "nature", label: "Nature", emoji: "🌿", keywords: ["nature", "forest", "ocean", "garden", "tree", "flower", "rainbow"] },
  { id: "fantasy", label: "Fantasy", emoji: "✨", keywords: ["fantasy", "magic", "fairy", "wizard", "witch", "spell", "enchanted"] },
  { id: "science", label: "Science", emoji: "🔬", keywords: ["science", "space", "robot", "invent", "experiment", "discover"] },
  { id: "educational", label: "Educational", emoji: "📖", keywords: ["educational", "learn", "school", "lesson", "teach"] },
  { id: "family", label: "Family", emoji: "👨‍👩‍👧‍👦", keywords: ["family", "parent", "sibling", "home", "friend"] },
  { id: "bedtime", label: "Bedtime", emoji: "🌙", keywords: ["bedtime", "sleep", "dream", "night", "moon", "star"] },
  { id: "history", label: "History", emoji: "🏛️", keywords: ["history", "ancient", "king", "queen", "castle", "knight"] },
  { id: "fairytale", label: "Fairy Tale", emoji: "👑", keywords: ["fairy tale", "fairy", "princess", "prince", "castle", "queen", "king", "magic", "enchanted", "cinderella", "snow white", "sleeping beauty", "rapunzel", "beauty and the beast"] },
  { id: "comics", label: "Comics", emoji: "💬", keywords: ["comic", "funny", "joke", "laugh", "humor"] },
]

interface CategoryFilterProps {
  selected: string
  onSelect: (id: string) => void
}

export function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none -mx-1 px-1">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={`flex shrink-0 items-center gap-1 rounded-xl border px-3 py-1.5 text-xs font-medium transition-all whitespace-nowrap ${
            selected === cat.id
              ? "border-purple-400 bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300"
              : "border-purple-200/60 bg-white/70 text-zinc-600 hover:border-purple-300 dark:border-zinc-700/60 dark:bg-zinc-800/70 dark:text-zinc-400"
          }`}
        >
          <span>{cat.emoji}</span>
          <span>{cat.label}</span>
        </button>
      ))}
    </div>
  )
}

export function matchCategory(story: { tags?: string | null; description?: string | null; blurb?: string | null; title?: string }, category: Category): boolean {
  if (category.id === "all") return true
  const searchText = [story.tags, story.description, story.blurb, story.title].filter(Boolean).join(" ").toLowerCase()
  return category.keywords.some((kw) => searchText.includes(kw))
}
