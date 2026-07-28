"use client"

import { useState, useCallback } from "react"
import { Shuffle, RotateCcw, Sparkles, ChevronDown, ChevronRight } from "lucide-react"

const ROLE_CATEGORIES = [
  {
    name: "Everyday Kids",
    roles: ["Just Me", "Student", "Artist", "Explorer", "Storyteller", "Camper", "Builder"],
  },
  {
    name: "Community Helpers",
    roles: ["Teacher", "Doctor", "Chef", "Farmer", "Firefighter", "Librarian", "Musician", "Detective", "Pilot", "Train Driver", "Gardener", "Photographer"],
  },
  {
    name: "Animals",
    roles: ["Cat", "Dog", "Dragon"],
  },
  {
    name: "Fantasy",
    roles: ["Dragon", "Superhero", "Astronaut", "Wizard", "Fairy", "Knight", "Princess", "Pirate"],
  },
  {
    name: "Science Fiction",
    roles: ["Robot", "Alien", "Astronaut", "Inventor", "Time Traveler"],
  },
  {
    name: "Sports",
    roles: ["Athlete", "Swimmer", "Soccer Player", "Basketball Star", "Gymnast", "Skateboarder"],
  },
  {
    name: "Creative",
    roles: ["Artist", "Musician", "Photographer", "Storyteller", "Dancer", "Singer", "Actor"],
  },
  {
    name: "Adventure",
    roles: ["Explorer", "Treasure Hunter", "Detective", "Camper", "Pilot", "Train Driver"],
  },
  {
    name: "Historical",
    roles: ["Knight", "Viking", "Egyptian Pharaoh", "Samurai", "Cowboy", "Medieval King"],
  },
  {
    name: "Heroes",
    roles: ["Superhero", "Firefighter", "Detective", "Doctor", "Lifeguard", "Police Officer"],
  },
  {
    name: "Funny",
    roles: ["Clown", "Jester", "Trickster", "Joker", "Giggler", "Silly Monster"],
  },
]

const LOCATIONS = [
  "Home", "School", "Forest", "Beach", "Castle", "Moon", "Space",
  "Grandma's House", "Treehouse", "Farm", "Candy Land", "Cloud Kingdom",
  "Toy Factory", "Mountain", "Ocean", "Jungle", "Village", "Cave",
  "Library", "Park", "Playground", "Amusement Park", "Museum", "Zoo",
  "Desert Island", "Snowy Mountain", "Underground City", "Rainbow Meadow",
]

const SCENARIOS = [
  "Found Treasure", "Made a Friend", "Lost Something", "Helped Someone",
  "Built Something", "Found Secret Door", "Went Camping", "Won Contest",
  "Solved Mystery", "Learned Something", "Started School", "Visited Another Planet",
  "Saved an Animal", "Cooked a Meal", "Discovered a Hidden World",
  "Fixed Something Broken", "Found a Magic Lamp", "Raced to the Finish",
  "Explored a New Place", "Celebrated a Holiday",
]

interface ImaginationPromptsProps {
  onSelect: (prompts: { role: string; location: string; scenario: string }) => void
  selected: { role: string; location: string; scenario: string }
}

export function ImaginationPrompts({ onSelect, selected }: ImaginationPromptsProps) {
  const [tab, setTab] = useState<"role" | "location" | "scenario">("role")
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)

  const surpriseMe = useCallback(() => {
    const allRoles = ROLE_CATEGORIES.flatMap((c) => c.roles)
    const role = allRoles[Math.floor(Math.random() * allRoles.length)]
    const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)]
    const scenario = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)]
    onSelect({ role, location, scenario })
  }, [onSelect])

  const clearAll = useCallback(() => {
    onSelect({ role: "", location: "", scenario: "" })
  }, [onSelect])

  const allSelected = selected.role && selected.location && selected.scenario

  return (
    <div className="rounded-2xl border border-purple-200/60 bg-white/80 backdrop-blur-sm dark:border-zinc-700/60 dark:bg-zinc-800/80 overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-purple-200/60 dark:border-zinc-700/60">
        {[
          { id: "role" as const, label: "Who Are You?", emoji: "🕵️" },
          { id: "location" as const, label: "Where Are You?", emoji: "📍" },
          { id: "scenario" as const, label: "What Happens?", emoji: "❓" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-3 text-xs font-medium transition-all ${
              tab === t.id
                ? "border-b-2 border-purple-500 text-purple-700 bg-purple-50/50 dark:text-purple-300 dark:bg-purple-900/20"
                : "text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800/50"
            }`}
          >
            <span className="text-sm">{t.emoji}</span>
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Currently selected */}
      <div className="px-4 pt-3">
        <div className="flex flex-wrap items-center gap-1.5 min-h-[28px]">
          {selected.role && (
            <span className="flex items-center gap-1 rounded-lg bg-purple-100 px-2 py-1 text-[10px] font-medium text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
              🕵️ {selected.role}
            </span>
          )}
          {selected.location && (
            <span className="flex items-center gap-1 rounded-lg bg-pink-100 px-2 py-1 text-[10px] font-medium text-pink-700 dark:bg-pink-900/40 dark:text-pink-300">
              📍 {selected.location}
            </span>
          )}
          {selected.scenario && (
            <span className="flex items-center gap-1 rounded-lg bg-orange-100 px-2 py-1 text-[10px] font-medium text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">
              ❓ {selected.scenario}
            </span>
          )}
          {!allSelected && (
            <span className="text-[10px] text-zinc-400 italic">Select from below or Surprise Me!</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 px-4 py-2">
        <button onClick={surpriseMe}
          className="flex items-center gap-1.5 rounded-xl border border-orange-200/60 bg-gradient-to-r from-orange-50/80 to-yellow-50/80 px-3.5 py-2 text-xs font-bold text-orange-600 hover:from-orange-100/80 hover:to-yellow-100/80 dark:border-orange-800/60 dark:from-orange-900/30 dark:to-yellow-900/30 dark:text-orange-400">
          <Sparkles size={14} />
          Surprise Me
        </button>
        {allSelected && (
          <button onClick={clearAll}
            className="flex items-center gap-1 rounded-xl border border-zinc-200/60 bg-white/50 px-2.5 py-2 text-[10px] font-medium text-zinc-500 hover:bg-zinc-100/50 dark:border-zinc-700/60 dark:bg-zinc-800/50 dark:text-zinc-400">
            <RotateCcw size={12} />
            Clear
          </button>
        )}
      </div>

      {/* Content */}
      <div className="px-4 pb-4 max-h-64 overflow-y-auto">
        {tab === "role" && (
          <div className="space-y-2">
            {ROLE_CATEGORIES.map((cat) => {
              const isExpanded = expandedCategory === cat.name
              return (
                <div key={cat.name}>
                  <button
                    onClick={() => setExpandedCategory(isExpanded ? null : cat.name)}
                    className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-600 hover:bg-purple-50/50 dark:text-zinc-400 dark:hover:bg-zinc-700/50"
                  >
                    {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                    {cat.name}
                  </button>
                  {isExpanded && (
                    <div className="flex flex-wrap gap-1.5 px-3 pb-2">
                      {cat.roles.map((role) => (
                        <button
                          key={role}
                          onClick={() => onSelect({ ...selected, role })}
                          className={`rounded-lg border px-2.5 py-1 text-[10px] font-medium transition-all ${
                            selected.role === role
                              ? "border-purple-400 bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300"
                              : "border-purple-200/60 bg-white/60 text-zinc-600 hover:border-purple-300 dark:border-zinc-700/60 dark:bg-zinc-800/60 dark:text-zinc-400"
                          }`}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {tab === "location" && (
          <div className="flex flex-wrap gap-1.5">
            {LOCATIONS.map((loc) => (
              <button
                key={loc}
                onClick={() => onSelect({ ...selected, location: loc })}
                className={`rounded-lg border px-2.5 py-1 text-[10px] font-medium transition-all ${
                  selected.location === loc
                    ? "border-pink-400 bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300"
                    : "border-purple-200/60 bg-white/60 text-zinc-600 hover:border-pink-300 dark:border-zinc-700/60 dark:bg-zinc-800/60 dark:text-zinc-400"
                }`}
              >
                {loc}
              </button>
            ))}
          </div>
        )}

        {tab === "scenario" && (
          <div className="flex flex-wrap gap-1.5">
            {SCENARIOS.map((sc) => (
              <button
                key={sc}
                onClick={() => onSelect({ ...selected, scenario: sc })}
                className={`rounded-lg border px-2.5 py-1 text-[10px] font-medium transition-all ${
                  selected.scenario === sc
                    ? "border-orange-400 bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300"
                    : "border-purple-200/60 bg-white/60 text-zinc-600 hover:border-orange-300 dark:border-zinc-700/60 dark:bg-zinc-800/60 dark:text-zinc-400"
                }`}
              >
                {sc}
              </button>
            ))}
          </div>
        )}
      </div>

      {allSelected && (
        <div className="border-t border-purple-200/60 px-4 py-3 text-center dark:border-zinc-700/60">
          <p className="text-[11px] text-purple-600 dark:text-purple-400 font-medium">
            ✨ Now write your own story about a {selected.role.toLowerCase()} in {selected.location} who {selected.scenario.toLowerCase()}!
          </p>
        </div>
      )}
    </div>
  )
}
