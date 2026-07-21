"use client"

import { useState, useRef, useEffect } from "react"
import { Users, Globe, X, Bot, ChevronRight, Heart, BookOpen, TrendingUp, MessageSquare, User, Search, Map as MapIcon, Calendar, CloudSun, Link2, Clock, Image, Sparkles } from "lucide-react"

interface Character {
  id: string
  name: string
  age: string | null
  gender: string | null
  personality: string | null
  appearance: string | null
  species: string | null
  background: string | null
  imageUrl: string | null
}

interface WorldEntry {
  id: string
  type: string
  title: string
  content: string
  metadata: string | null
  imageUrl: string | null
}

function CharacterCard({ character }: { character: Character }) {
  const [expanded, setExpanded] = useState(false)

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="flex w-full items-center gap-3 rounded-xl border border-purple-200/60 bg-white/70 p-3 text-left hover:bg-purple-50 transition-colors dark:border-zinc-700 dark:bg-zinc-800/70 dark:hover:bg-zinc-800"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-sm font-bold text-white">
          {character.imageUrl ? <img src={character.imageUrl} alt="" className="h-full w-full rounded-xl object-cover" /> : character.name[0]}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{character.name}</p>
          {character.age && <p className="text-[10px] text-zinc-400">{character.age} yrs old</p>}
        </div>
        <ChevronRight size={14} className="shrink-0 text-zinc-300" />
      </button>
    )
  }

  return (
    <div className="rounded-xl border border-purple-200/60 bg-white/70 p-4 dark:border-zinc-700 dark:bg-zinc-800/70">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-xl font-bold text-white">
            {character.imageUrl ? <img src={character.imageUrl} alt="" className="h-full w-full rounded-xl object-cover" /> : character.name[0]}
          </div>
          <div>
            <h3 className="font-bold text-zinc-800 dark:text-zinc-100">{character.name}</h3>
            <div className="flex gap-2 text-[10px] text-zinc-400">
              {character.age && <span>Age {character.age}</span>}
              {character.species && <span>{character.species}</span>}
            </div>
          </div>
        </div>
        <button onClick={() => setExpanded(false)} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200">
          <X size={14} />
        </button>
      </div>

      <div className="space-y-2 text-xs">
        {character.background && (
          <div>
            <span className="font-medium text-zinc-500 dark:text-zinc-400">Background:</span>
            <p className="mt-0.5 text-zinc-700 dark:text-zinc-300">{character.background}</p>
          </div>
        )}
        {character.personality && (
          <div>
            <span className="font-medium text-zinc-500 dark:text-zinc-400">Personality:</span>
            <p className="mt-0.5 text-zinc-700 dark:text-zinc-300">{character.personality}</p>
          </div>
        )}
        {character.appearance && (
          <div>
            <span className="font-medium text-zinc-500 dark:text-zinc-400">Appearance:</span>
            <p className="mt-0.5 text-zinc-700 dark:text-zinc-300">{character.appearance}</p>
          </div>
        )}
      </div>
    </div>
  )
}

function LocationCard({ entry }: { entry: WorldEntry }) {
  const parseMeta = (raw?: string | null) => {
    if (!raw) return {}
    try { return JSON.parse(raw) } catch { return {} }
  }
  const meta = parseMeta(entry.metadata)

  return (
    <div className="rounded-xl border border-emerald-200/60 bg-emerald-50/30 p-3 dark:border-zinc-700 dark:bg-zinc-800/50">
      <div className="mb-2 flex items-center gap-2">
        <MapIcon size={14} className="text-emerald-600" />
        <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{entry.title}</h4>
        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-medium capitalize text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">{entry.type}</span>
      </div>
      <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">{entry.content}</p>
      {meta.weather && (
        <div className="mt-2 flex items-center gap-1.5 text-[10px] text-amber-600 dark:text-amber-400">
          <CloudSun size={10} />
          <span>{meta.weather}</span>
        </div>
      )}
    </div>
  )
}

export function ReaderCompanion({
  characters,
  worldEntries,
  storyTitle,
}: {
  characters: Character[]
  worldEntries: WorldEntry[]
  storyTitle?: string
}) {
  const [tab, setTab] = useState<"characters" | "world" | null>(null)
  const [search, setSearch] = useState("")
  const panelRef = useRef<HTMLDivElement>(null)

  const filteredChars = search
    ? characters.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    : characters

  const filteredWorld = search
    ? worldEntries.filter((e) => e.title.toLowerCase().includes(search.toLowerCase()) || e.type.toLowerCase().includes(search.toLowerCase()))
    : worldEntries

  // Close on click outside
  useEffect(() => {
    if (!tab) return
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node) && !(e.target as Element)?.closest?.("[data-companion-trigger]")) {
        setTab(null)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [tab])

  return (
    <>
      {/* Floating triggers */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-2">
        {characters.length > 0 && (
          <button
            data-companion-trigger
            onClick={() => setTab(tab === "characters" ? null : "characters")}
            className={`flex h-10 w-10 items-center justify-center rounded-full shadow-lg transition-all ${
              tab === "characters"
                ? "bg-purple-600 text-white"
                : "bg-white text-purple-600 hover:bg-purple-50 dark:bg-zinc-800 dark:text-purple-400 dark:hover:bg-zinc-700"
            }`}
            title="Characters"
          >
            <Users size={16} />
          </button>
        )}
        {worldEntries.length > 0 && (
          <button
            data-companion-trigger
            onClick={() => setTab(tab === "world" ? null : "world")}
            className={`flex h-10 w-10 items-center justify-center rounded-full shadow-lg transition-all ${
              tab === "world"
                ? "bg-emerald-600 text-white"
                : "bg-white text-emerald-600 hover:bg-emerald-50 dark:bg-zinc-800 dark:text-emerald-400 dark:hover:bg-zinc-700"
            }`}
            title="World"
          >
            <Globe size={16} />
          </button>
        )}
      </div>

      {/* Slide-out panel */}
      {tab && (
        <div
          ref={panelRef}
          className="fixed bottom-20 right-6 z-40 w-80 rounded-2xl border border-purple-200/60 bg-white/95 shadow-2xl backdrop-blur-lg transition-all dark:border-zinc-700 dark:bg-zinc-900/95"
          style={{ maxHeight: "calc(100vh - 160px)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-purple-200/60 px-4 py-3 dark:border-zinc-700">
            <div className="flex items-center gap-2">
              {tab === "characters" ? <Users size={14} className="text-purple-600" /> : <Globe size={14} className="text-emerald-600" />}
              <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                {tab === "characters" ? "Characters" : "World"}
              </span>
              {storyTitle && <span className="text-[10px] text-zinc-400">— {storyTitle}</span>}
            </div>
            <button onClick={() => setTab(null)} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200">
              <X size={14} />
            </button>
          </div>

          {/* Search */}
          <div className="border-b border-purple-200/60 px-4 py-2 dark:border-zinc-700">
            <div className="relative">
              <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search ${tab === "characters" ? "characters" : "locations"}...`}
                className="w-full rounded-lg border border-purple-200 bg-white/80 py-1.5 pl-7 pr-3 text-xs text-zinc-700 outline-none focus:border-purple-400 dark:border-zinc-600 dark:bg-zinc-800/80 dark:text-zinc-200"
              />
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto p-4 space-y-3" style={{ maxHeight: "calc(100vh - 280px)" }}>
            {tab === "characters" && (
              filteredChars.length > 0 ? (
                filteredChars.map((ch) => <CharacterCard key={ch.id} character={ch} />)
              ) : (
                <p className="text-center text-xs text-zinc-400 py-8">No characters found</p>
              )
            )}
            {tab === "world" && (
              filteredWorld.length > 0 ? (
                filteredWorld.map((entry) => <LocationCard key={entry.id} entry={entry} />)
              ) : (
                <p className="text-center text-xs text-zinc-400 py-8">No locations found</p>
              )
            )}
          </div>
        </div>
      )}
    </>
  )
}
