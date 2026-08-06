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
  { id: "adventure", label: "Adventure", emoji: "🗺️", keywords: ["adventure", "quest", "journey", "explor", "treasure", "expedition", "voyage"] },
  { id: "animals", label: "Animals", emoji: "🐾", keywords: ["animal", "dog", "cat", "dragon", "unicorn", "horse", "bird", "pet", "rabbit", "bear", "elephant", "puppy", "kitten"] },
  { id: "bedtime", label: "Bedtime", emoji: "🌙", keywords: ["bedtime", "sleep", "dream", "night", "moon", "star", "lullaby", "sleepy"] },
  { id: "comedy", label: "Comedy", emoji: "😄", keywords: ["comedy", "funny", "joke", "laugh", "humor", "silly", "comic", "hilarious", "giggle"] },
  { id: "educational", label: "Educational", emoji: "📖", keywords: ["educational", "learn", "school", "lesson", "teach", "knowledge", "discover", "curious"] },
  { id: "fairytale", label: "Fairy Tale", emoji: "👑", keywords: ["fairy tale", "fairy", "princess", "prince", "castle", "queen", "king", "magic", "enchanted", "cinderella", "snow white", "sleeping beauty", "rapunzel", "beauty and the beast"] },
  { id: "family", label: "Family", emoji: "👨‍👩‍👧‍👦", keywords: ["family", "parent", "sibling", "home", "grandparent", "mother", "father", "brother", "sister"] },
  { id: "fantasy", label: "Fantasy", emoji: "✨", keywords: ["fantasy", "magic", "wizard", "witch", "spell", "enchanted", "fairy", "mythical", "kingdom", "dragon"] },
  { id: "friendship", label: "Friendship", emoji: "🤝", keywords: ["friendship", "friend", "together", "team", "best friend", "buddy", "kindness"] },
  { id: "history", label: "History", emoji: "🏛️", keywords: ["history", "ancient", "king", "queen", "castle", "knight", "medieval", "historic", "past"] },
  { id: "nature", label: "Nature", emoji: "🌿", keywords: ["nature", "forest", "ocean", "garden", "tree", "flower", "rainbow", "outdoor"] },
  { id: "schoollife", label: "School Life", emoji: "🎒", keywords: ["school", "classroom", "teacher", "student", "backpack", "class", "recess", "homework"] },
  { id: "science", label: "Science", emoji: "🔬", keywords: ["science", "robot", "invent", "experiment", "discover", "technology", "laboratory"] },
  { id: "space", label: "Space", emoji: "🚀", keywords: ["space", "planet", "star", "moon", "galaxy", "astronaut", "rocket", "alien"] },
  { id: "sports", label: "Sports", emoji: "⚽", keywords: ["sport", "game", "team", "champion", "soccer", "basketball", "baseball", "football", "swim", "race"] },
  { id: "values", label: "Values & Kindness", emoji: "💛", keywords: ["kindness", "honest", "brave", "courage", "sharing", "respect", "values", "helping", "good", "thankful", "gratitude"] },
]

const BLOCKED_KEYWORDS = [
  "horror", "psychological horror", "thriller", "crime", "dark fantasy",
  "gore", "slasher", "mature romance", "erotica", "nsfw",
  "heavy violence", "suicide", "self-harm", "self harm",
  "drug", "gambling", "explicit language", "explicit",
  "sexy", "sexual", "abuse",
]

export const JUNIOR_AGE_RATINGS = ["EARLY_READERS", "JUNIOR_6", "JUNIOR_9"]

export function isStorySafeForJuniors(story: {
  ageRating?: string | null
  tags?: string | null
  description?: string | null
  blurb?: string | null
  juniorApproved?: boolean | null
}): boolean {
  const rating = story.ageRating
  const isSafeRating = rating ? JUNIOR_AGE_RATINGS.includes(rating) : false
  if (!isSafeRating) return false
  const searchText = [story.tags, story.description, story.blurb].filter(Boolean).join(" ").toLowerCase()
  const hasBlockedContent = BLOCKED_KEYWORDS.some((kw) => searchText.includes(kw))
  if (hasBlockedContent) return false
  return true
}

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
