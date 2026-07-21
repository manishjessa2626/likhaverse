"use client"

import { useState, useCallback, type ReactNode } from "react"
import {
  Music,
  StickyNote,
  Database,
  Image,
  BookOpen,
  Users,
  Globe,
  Clock,
  Play,
  Plus,
  Sparkles,
  Search,
  Warehouse,
  Wand2,
  ScrollText,
  BrainCircuit,
  MessageSquare,
  Moon,
  Sun,
  Pen,
  List,
  Film,
  FileText,
  Camera,
} from "lucide-react"

// ─── Inline placeholders (deleted components) ───

function LeftSidebar({ active, isDark }: { active: string; isDark: boolean }) {
  return null
}

function BottomDock({ isDark }: { isDark: boolean }) {
  return null
}

function CharacterDatabase({ characters, isDark }: { characters: any[]; isDark: boolean }) {
  return <div className={`text-xs ${isDark ? "text-zinc-400" : "text-zinc-600"} p-4`}>Characters</div>
}

function WorldMap({ entries, isDark }: { entries: any[]; isDark: boolean }) {
  return <div className={`text-xs ${isDark ? "text-zinc-400" : "text-zinc-600"} p-4`}>World Builder</div>
}

function FilmmakingPipeline({ storyId, chapterContent, isDark }: { storyId: string; chapterContent: string; isDark: boolean }) {
  return <div className={`rounded-xl border-2 border-dashed p-8 text-center text-xs ${isDark ? "border-zinc-700 text-zinc-500" : "border-purple-300 text-zinc-400"}`}>Filmmaking Pipeline — Coming Soon</div>
}

function AiStudio({ storyId, isDark }: { storyId: string; isDark: boolean }) {
  return <div className={`rounded-xl border-2 border-dashed p-8 text-center text-xs ${isDark ? "border-zinc-700 text-zinc-500" : "border-purple-300 text-zinc-400"}`}>AI Studio — Coming Soon</div>
}

// ─── Types ───

interface Story {
  id: string
  title: string
  cover?: string | null
  tags?: string | null
  status?: string
}

interface Character {
  id: string
  name: string
  age: string | null
  gender: string | null
  personality: string | null
  appearance: string | null
  clothing: string | null
  species: string | null
  background: string | null
  artStyle: string | null
  imageUrl: string | null
  storyId: string
  authorId: string
  createdAt: Date
  updatedAt: Date
}

interface WorldEntry {
  id: string
  type: string
  title: string
  content: string
  metadata: string | null
  imageUrl: string | null
  storyId: string
  authorId: string
  createdAt: Date
}

interface Environment {
  id: string
  name: string
  mood: string | null
  imageUrl: string | null
}

interface Scene {
  id: string
  title: string
  sceneNumber: number
}

interface StudioDashboardProps {
  stories: Story[]
  activeStory: (Story & { description?: string | null }) | null
  characters: Character[]
  worldEntries: WorldEntry[]
  environments: Environment[]
  scenes: Scene[]
}

// ─── Genre banner gradients ───

function getBannerStyle(tags?: string | null) {
  const tag = tags?.toLowerCase() ?? ""
  if (tag.includes("fantasy"))
    return { bg: "from-indigo-800 via-purple-900 to-violet-950", accent: "text-violet-200" }
  if (tag.includes("romance"))
    return { bg: "from-rose-800 via-pink-900 to-red-950", accent: "text-pink-200" }
  if (tag.includes("horror"))
    return { bg: "from-zinc-900 via-stone-900 to-neutral-950", accent: "text-zinc-300" }
  if (tag.includes("sci-fi"))
    return { bg: "from-cyan-800 via-blue-900 to-indigo-950", accent: "text-cyan-200" }
  if (tag.includes("drama"))
    return { bg: "from-amber-800 via-orange-900 to-yellow-950", accent: "text-amber-200" }
  return { bg: "from-violet-700 via-purple-800 to-indigo-900", accent: "text-purple-200" }
}

// ─── Card wrapper ───

function Card({ title, icon, children, className = "" }: { title: string; icon: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-purple-200/60 bg-white/70 p-4 shadow-sm transition-colors duration-200 dark:border-zinc-700/60 dark:bg-zinc-800/70 dark:shadow-black/10 ${className}`}>
      <div className="mb-3 flex items-center gap-2 border-b border-purple-200/60 pb-2 dark:border-zinc-700/60">
        <span className="text-purple-600 dark:text-zinc-400">{icon}</span>
        <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{title}</h3>
      </div>
      {children}
    </div>
  )
}

// ─── Section wrapper for 3-panel cards ───

function SectionCard({ icon, label, children, isDark }: { icon: ReactNode; label: string; children: ReactNode; isDark: boolean }) {
  return (
    <div className={`rounded-xl border p-3 transition-colors ${
      isDark
        ? "border-zinc-700/60 bg-zinc-800/60"
        : "border-purple-200/60 bg-white/70"
    }`}>
      <div className="mb-2 flex items-center gap-2">
        <span className={`${isDark ? "text-zinc-400" : "text-purple-600"}`}>{icon}</span>
        <h4 className={`text-xs font-semibold ${isDark ? "text-zinc-200" : "text-zinc-700"}`}>{label}</h4>
      </div>
      {children}
    </div>
  )
}

// ─── Spotify Player ───

function SpotifyPlayer({ isDark }: { isDark: boolean }) {
  const [url, setUrl] = useState("")
  const [activeUrl, setActiveUrl] = useState("")

  const embedUrl = activeUrl
    ? activeUrl
        .replace("https://open.spotify.com/playlist/", "https://open.spotify.com/embed/playlist/")
        .replace("https://open.spotify.com/track/", "https://open.spotify.com/embed/track/")
        .replace("https://open.spotify.com/album/", "https://open.spotify.com/embed/album/")
        .split("?")[0]
    : null

  return (
    <SectionCard icon={<Music size={13} />} label="Playlist" isDark={isDark}>
      {embedUrl ? (
        <div className="space-y-2">
          <iframe src={embedUrl} width="100%" height="80" frameBorder="0" allow="encrypted-media" className="rounded-lg" />
          <button onClick={() => { setActiveUrl(""); setUrl("") }} className="text-[10px] text-zinc-400 hover:text-red-500 transition-colors">Remove</button>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500">Paste Spotify URL to set the mood</p>
          <div className="flex gap-2">
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://open.spotify.com/playlist/..."
              className="flex-1 rounded-lg border border-purple-200 bg-white/80 px-2.5 py-1.5 text-[10px] text-zinc-700 outline-none focus:border-purple-400 transition-colors dark:border-zinc-600 dark:bg-zinc-700/80 dark:text-zinc-200 dark:focus:border-zinc-500"
              onKeyDown={(e) => { if (e.key === "Enter" && url) setActiveUrl(url) }}
            />
            <button onClick={() => url && setActiveUrl(url)} disabled={!url} className="rounded-lg bg-purple-600 px-2.5 py-1.5 text-white hover:bg-purple-500 disabled:opacity-50 transition-colors">
              <Play size={12} />
            </button>
          </div>
        </div>
      )}
    </SectionCard>
  )
}

// ─── Quick Notes ───

function QuickNotes({ isDark }: { isDark: boolean }) {
  const [notes, setNotes] = useState<string[]>([])
  const [input, setInput] = useState("")

  const addNote = () => {
    if (!input.trim()) return
    setNotes((prev) => [...prev, input.trim()])
    setInput("")
  }

  return (
    <SectionCard icon={<StickyNote size={13} />} label="Notes" isDark={isDark}>
      <div className="space-y-1.5 max-h-28 overflow-y-auto scrollbar-thin">
        {notes.length === 0 && <p className="text-[10px] text-zinc-400 dark:text-zinc-500">Jot down ideas, dialogue, or scene notes</p>}
        {notes.map((note, i) => (
          <div key={i} className="group flex items-start gap-2 rounded-lg bg-purple-50/50 px-2 py-1.5 text-[10px] text-zinc-700 dark:bg-zinc-700/50 dark:text-zinc-300">
            <span className="flex-1">{note}</span>
            <button onClick={() => setNotes((prev) => prev.filter((_, idx) => idx !== i))} className="hidden group-hover:block text-zinc-400 hover:text-red-500">&times;</button>
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-1.5">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add note..."
          className="flex-1 rounded-lg border border-purple-200 bg-white/80 px-2.5 py-1.5 text-[10px] text-zinc-700 outline-none focus:border-purple-400 transition-colors dark:border-zinc-600 dark:bg-zinc-700/80 dark:text-zinc-200"
          onKeyDown={(e) => { if (e.key === "Enter") addNote() }}
        />
        <button onClick={addNote} disabled={!input.trim()} className="rounded-lg bg-purple-600 px-2 py-1.5 text-white hover:bg-purple-500 disabled:opacity-50"><Plus size={12} /></button>
      </div>
    </SectionCard>
  )
}

// ─── Plotting Database ───

const DB_ENTITIES = [
  { id: "stories", label: "Stories", icon: <BookOpen size={14} />, color: "text-violet-600", bg: "bg-violet-50" },
  { id: "chapters", label: "Chapters", icon: <ScrollText size={14} />, color: "text-blue-600", bg: "bg-blue-50" },
  { id: "characters", label: "Characters", icon: <Users size={14} />, color: "text-purple-600", bg: "bg-purple-50" },
  { id: "locations", label: "Locations", icon: <Globe size={14} />, color: "text-emerald-600", bg: "bg-emerald-50" },
  { id: "magic", label: "Magic System", icon: <Wand2 size={14} />, color: "text-amber-600", bg: "bg-amber-50" },
  { id: "items", label: "Items", icon: <Warehouse size={14} />, color: "text-orange-600", bg: "bg-orange-50" },
  { id: "timeline", label: "Timeline", icon: <Clock size={14} />, color: "text-rose-600", bg: "bg-rose-50" },
  { id: "readers", label: "Readers", icon: <MessageSquare size={14} />, color: "text-cyan-600", bg: "bg-cyan-50" },
  { id: "comments", label: "Comments", icon: <MessageSquare size={14} />, color: "text-pink-600", bg: "bg-pink-50" },
  { id: "ai_notes", label: "AI Notes", icon: <BrainCircuit size={14} />, color: "text-indigo-600", bg: "bg-indigo-50" },
]

function PlottingDatabase({ isDark, characters, worldEntries, scenes, activeStory }: { isDark: boolean; characters: Character[]; worldEntries: WorldEntry[]; scenes: Scene[]; activeStory: StudioDashboardProps["activeStory"] }) {
  const [activeEntity, setActiveEntity] = useState<string | null>(null)
  const [search, setSearch] = useState("")

  const filtered = search
    ? DB_ENTITIES.filter((e) => e.label.toLowerCase().includes(search.toLowerCase()))
    : DB_ENTITIES

  return (
    <SectionCard icon={<Database size={13} />} label="Research" isDark={isDark}>
      <div className="relative mb-2">
        <Search size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search entities..."
          className="w-full rounded-lg border border-purple-200 bg-white/80 py-1.5 pl-7 pr-2 text-[10px] text-zinc-700 outline-none focus:border-purple-400 transition-colors dark:border-zinc-600 dark:bg-zinc-700/80 dark:text-zinc-200"
        />
      </div>
      <div className="grid grid-cols-2 gap-1 max-h-36 overflow-y-auto scrollbar-thin">
        {filtered.map((entity) => (
          <button
            key={entity.id}
            onClick={() => setActiveEntity(activeEntity === entity.id ? null : entity.id)}
            className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[10px] font-medium transition-colors ${
              activeEntity === entity.id
                ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                : "text-zinc-500 hover:bg-purple-50 dark:text-zinc-400 dark:hover:bg-zinc-700"
            }`}
          >
            <span className={entity.color}>{entity.icon}</span>
            {entity.label}
          </button>
        ))}
      </div>
    </SectionCard>
  )
}

// ─── Mood Board ───

const GENRE_PALETTES: Record<string, string[]> = {
  fantasy: ["#6366f1", "#8b5cf6", "#a855f7", "#7c3aed", "#6d28d9"],
  romance: ["#ec4899", "#f43f5e", "#e11d48", "#fb7185", "#f472b6"],
  horror: ["#1e1b4b", "#292524", "#44403c", "#3f3f46", "#1c1917"],
  "sci-fi": ["#06b6d4", "#0ea5e9", "#3b82f6", "#2563eb", "#0891b2"],
  drama: ["#f59e0b", "#d97706", "#b45309", "#f97316", "#ea580c"],
}

function MoodBoard({ tags, isDark }: { tags?: string | null; isDark: boolean }) {
  const palette = GENRE_PALETTES[tags?.toLowerCase() ?? ""] ?? GENRE_PALETTES.fantasy!
  const [images, setImages] = useState<string[]>([])

  const addImage = () => {
    const color = palette[images.length % palette.length]
    setImages((prev) => [...prev, `https://placehold.co/80x80/${color.slice(1)}/ffffff?text=M+${prev.length + 1}`])
  }

  return (
    <SectionCard icon={<Image size={13} />} label="Visual Mood" isDark={isDark}>
      <div className="flex flex-wrap gap-1.5">
        {images.map((src, i) => (
          <div key={i} className="group relative h-10 w-10 overflow-hidden rounded-lg">
            <img src={src} alt="" className="h-full w-full object-cover" />
            <button
              onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
              className="absolute inset-0 flex items-center justify-center bg-black/40 text-[8px] text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >X</button>
          </div>
        ))}
        {images.length < 9 && (
          <button onClick={addImage} className="flex h-10 w-10 items-center justify-center rounded-lg border border-dashed border-purple-300 text-purple-400 hover:bg-purple-50 hover:text-purple-600 transition-colors">
            <Plus size={14} />
          </button>
        )}
      </div>
    </SectionCard>
  )
}

// ─── Writing Editor (center panel) ───

function WritingEditor({ isDark }: { isDark: boolean }) {
  const [content, setContent] = useState("")
  const [mode, setMode] = useState<"novel" | "script">("novel")

  return (
    <div className="flex-1 flex flex-col">
      {/* Mode tabs */}
      <div className={`flex items-center gap-1 border-b px-1 pb-2 ${
        isDark ? "border-zinc-800" : "border-purple-200/60"
      }`}>
        {["novel", "script"].map((m) => (
          <button
            key={m}
            onClick={() => setMode(m as typeof mode)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[10px] font-medium transition-colors ${
              mode === m
                ? isDark ? "bg-zinc-700 text-zinc-100" : "bg-purple-100 text-purple-800"
                : isDark ? "text-zinc-500 hover:bg-zinc-800" : "text-zinc-500 hover:bg-purple-50"
            }`}
          >
            {m === "novel" ? <FileText size={12} /> : <Film size={12} />}
            {m === "novel" ? "Novel Mode" : "Script Mode"}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <span className={`text-[10px] ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
            {content.split(/\s+/).filter(Boolean).length} words
          </span>
        </div>
      </div>

      {/* Editor area */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={mode === "novel" ? "Write your chapter here..." : "CHARACTER\n(Dialogue direction)\nDialogue text..."}
        className={`mt-2 flex-1 resize-none rounded-xl border bg-white/50 p-4 text-sm leading-relaxed text-zinc-800 outline-none transition-colors placeholder:text-zinc-300 focus:border-purple-400 ${
          isDark
            ? "border-zinc-700 bg-zinc-800/50 text-zinc-200 placeholder:text-zinc-600 focus:border-zinc-500"
            : "border-purple-200/60"
        }`}
        spellCheck
      />
    </div>
  )
}

// ─── Scene Timeline (compact) ───

function SceneTimeline({ scenes, isDark }: { scenes: Scene[]; isDark: boolean }) {
  return (
    <SectionCard icon={<Clock size={13} />} label="Scene Timeline" isDark={isDark}>
      <div className="space-y-1.5 max-h-40 overflow-y-auto scrollbar-thin">
        {scenes.length === 0 ? (
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500">No scenes yet</p>
        ) : (
          scenes.map((scene, i) => (
            <div key={scene.id} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[10px] hover:bg-purple-50 dark:hover:bg-zinc-700/50">
              <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold ${
                isDark ? "bg-zinc-700 text-zinc-300" : "bg-purple-100 text-purple-700"
              }`}>
                {scene.sceneNumber}
              </span>
              <span className={`${isDark ? "text-zinc-300" : "text-zinc-700"}`}>{scene.title}</span>
            </div>
          ))
        )}
      </div>
    </SectionCard>
  )
}

// ─── Current Chapter ───

function CurrentChapter({ isDark }: { isDark: boolean }) {
  return (
    <SectionCard icon={<BookOpen size={13} />} label="Current Chapter" isDark={isDark}>
      <p className={`text-[10px] ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
        Chapter 1 — The Beginning
      </p>
      <p className={`mt-1 text-[10px] ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
        Last edited: Today
      </p>
    </SectionCard>
  )
}

// ─── Dialogue view ───

function DialogueView({ isDark }: { isDark: boolean }) {
  const [lines, setLines] = useState<string[]>(["Character: Hello.", "Narrator: He walked forward."])

  return (
    <SectionCard icon={<MessageSquare size={13} />} label="Dialogue" isDark={isDark}>
      <div className="space-y-1 max-h-28 overflow-y-auto scrollbar-thin">
        {lines.map((line, i) => (
          <div key={i} className={`rounded-lg px-2 py-1 text-[10px] ${
            isDark ? "bg-zinc-700/50 text-zinc-300" : "bg-purple-50/50 text-zinc-600"
          }`}>
            {line}
          </div>
        ))}
      </div>
    </SectionCard>
  )
}

// ─── Left Panel Sections ───

const LEFT_TABS = [
  { id: "library", label: "Library", icon: <BookOpen size={14} /> },
  { id: "characters", label: "Characters", icon: <Users size={14} /> },
  { id: "world", label: "World Builder", icon: <Globe size={14} /> },
  { id: "playlist", label: "Playlist", icon: <Music size={14} /> },
  { id: "research", label: "Research", icon: <Database size={14} /> },
  { id: "notes", label: "Notes", icon: <StickyNote size={14} /> },
]

function LeftPanelContent({
  activeTab,
  isDark,
  characters,
  worldEntries,
  environments,
  activeStory,
  scenes,
}: {
  activeTab: string
  isDark: boolean
  characters: Character[]
  worldEntries: WorldEntry[]
  environments: Environment[]
  activeStory: StudioDashboardProps["activeStory"]
  scenes: Scene[]
}) {
  switch (activeTab) {
    case "playlist": return <SpotifyPlayer isDark={isDark} />
    case "notes": return <QuickNotes isDark={isDark} />
    case "research":
      return <PlottingDatabase isDark={isDark} characters={characters} worldEntries={worldEntries} scenes={scenes} activeStory={activeStory} />
    case "characters": return <CharacterDatabase characters={characters} isDark={isDark} />
    case "world": return <WorldMap entries={worldEntries} isDark={isDark} />
    case "library":
    default:
      return (
        <SectionCard icon={<BookOpen size={13} />} label="Story Library" isDark={isDark}>
          <p className={`text-[10px] ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>
            {activeStory?.title ?? "No story"}
          </p>
          {activeStory?.tags && (
            <div className="mt-1 flex flex-wrap gap-1">
              {activeStory.tags.split(",").map((tag, i) => (
                <span key={i} className={`rounded-full px-2 py-0.5 text-[9px] font-medium ${
                  isDark ? "bg-zinc-700 text-zinc-300" : "bg-purple-100 text-purple-700"
                }`}>{tag.trim()}</span>
              ))}
            </div>
          )}
          {activeStory?.description && (
            <p className={`mt-1 text-[10px] leading-relaxed ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
              {activeStory.description}
            </p>
          )}
        </SectionCard>
      )
  }
}

// ─── Center Panel Tabs ───

const CENTER_TABS = [
  { id: "editor", label: "Writing Editor", icon: <Pen size={13} /> },
  { id: "chapter", label: "Current Chapter", icon: <BookOpen size={13} /> },
  { id: "timeline", label: "Scene Timeline", icon: <Clock size={13} /> },
  { id: "dialogue", label: "Dialogue", icon: <MessageSquare size={13} /> },
  { id: "filmmaking", label: "Film Pipeline", icon: <Camera size={13} /> },
  { id: "aistudio", label: "AI Studio", icon: <Sparkles size={13} /> },
  { id: "novelscript", label: "Mode", icon: <FileText size={13} /> },
]

// ─── Main Dashboard ───

export function StudioDashboard({
  stories,
  activeStory,
  characters,
  worldEntries,
  environments,
  scenes,
}: StudioDashboardProps) {
  const [leftTab, setLeftTab] = useState("library")
  const [centerTab, setCenterTab] = useState("editor")

  const [isDark, setIsDark] = useState(() => {
    try { return localStorage.getItem("studio_dark") === "true" }
    catch { return false }
  })

  const toggleDark = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev
      localStorage.setItem("studio_dark", String(next))
      return next
    })
  }, [])

  const banner = getBannerStyle(activeStory?.tags)

  return (
    <div className={`flex h-screen flex-col transition-colors duration-300 ${isDark ? "bg-zinc-950" : "bg-[#D4C5F0]"} ${isDark ? "dark" : ""}`}>
      <div className="flex flex-1 overflow-hidden">
        {/* ── Left Sidebar ── */}
        <LeftSidebar active="stories" isDark={isDark} />

        {/* ── Main Content ── */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* ── Cover Banner with Progress ── */}
          <div className={`relative h-44 shrink-0 overflow-hidden bg-gradient-to-br ${banner.bg} md:h-48`}>
            <div className="absolute inset-0 bg-gradient-to-t from-[#D4C5F0]/80 via-transparent to-transparent dark:from-zinc-950/80" />
            <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/5 blur-3xl" />

            <div className="relative z-10 mx-auto flex h-full max-w-6xl items-end px-4 pb-3 md:px-6">
              <div className="flex-1">
                <p className={`text-[10px] font-medium uppercase tracking-widest ${banner.accent}`}>Studio</p>
                <h1 className="text-lg font-bold text-white drop-shadow-lg md:text-xl">
                  {activeStory?.title || "Creative Studio"}
                </h1>
                {activeStory?.description && (
                  <p className="mt-0.5 max-w-xl text-xs text-white/70 line-clamp-1">{activeStory.description}</p>
                )}

                {/* Progress Bar */}
                <div className="mt-3 max-w-xs">
                  <div className="flex items-center justify-between text-[10px] text-white/60">
                    <span>Story progress</span>
                    <span>67%</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/20">
                    <div className="h-full w-[67%] rounded-full bg-white/70 transition-all duration-700" />
                  </div>
                </div>
              </div>
              <button
                onClick={toggleDark}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white/70 backdrop-blur-sm hover:bg-white/20 transition-all"
                title={isDark ? "Light" : "Dark"}
              >
                {isDark ? <Sun size={14} /> : <Moon size={14} />}
              </button>
            </div>
          </div>

          {/* ── Three-Panel Body ── */}
          <div className="flex flex-1 overflow-hidden">
            {/* ══ LEFT PANEL ══ */}
            <div className={`hidden w-56 shrink-0 border-r p-3 overflow-y-auto md:block ${
              isDark ? "border-zinc-800 bg-zinc-900/60" : "border-purple-200/60 bg-white/50"
            }`}>
              {/* Section tabs */}
              <div className="flex flex-wrap gap-1 mb-3">
                {LEFT_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setLeftTab(tab.id)}
                    className={`flex items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-medium transition-colors ${
                      leftTab === tab.id
                        ? isDark
                          ? "bg-zinc-700 text-zinc-100"
                          : "bg-purple-100 text-purple-800"
                        : isDark
                          ? "text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
                          : "text-zinc-500 hover:bg-purple-50 hover:text-zinc-700"
                    }`}
                  >
                    {tab.icon}
                    <span className="hidden lg:inline">{tab.label}</span>
                  </button>
                ))}
              </div>

              <LeftPanelContent
                activeTab={leftTab}
                isDark={isDark}
                characters={characters}
                worldEntries={worldEntries}
                environments={environments}
                activeStory={activeStory}
                scenes={scenes}
              />
            </div>

            {/* ══ CENTER PANEL ══ */}
            <div className={`flex flex-1 flex-col overflow-hidden p-3 ${
              isDark ? "" : ""
            }`}>
              {/* Center tabs */}
              <div className={`flex items-center gap-1 border-b pb-2 mb-3 ${
                isDark ? "border-zinc-800" : "border-purple-200/60"
              }`}>
                {CENTER_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setCenterTab(tab.id)}
                    className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] font-medium transition-colors ${
                      centerTab === tab.id
                        ? isDark ? "bg-zinc-700 text-zinc-100" : "bg-purple-100 text-purple-800"
                        : isDark ? "text-zinc-500 hover:bg-zinc-800" : "text-zinc-500 hover:bg-purple-50"
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>

              {centerTab === "editor" && <WritingEditor isDark={isDark} />}
              {centerTab === "chapter" && <CurrentChapter isDark={isDark} />}
              {centerTab === "timeline" && <SceneTimeline scenes={scenes} isDark={isDark} />}
              {centerTab === "dialogue" && <DialogueView isDark={isDark} />}
              {centerTab === "filmmaking" && (
                <FilmmakingPipeline
                  storyId={activeStory?.id ?? ""}
                  chapterContent=""
                  isDark={isDark}
                />
              )}
              {centerTab === "aistudio" && (
                <AiStudio storyId={activeStory?.id ?? ""} isDark={isDark} />
              )}
              {centerTab === "novelscript" && (
                <div className={`flex-1 flex items-center justify-center rounded-xl border-2 border-dashed ${
                  isDark ? "border-zinc-700 text-zinc-500" : "border-purple-300 text-zinc-400"
                }`}>
                  <div className="text-center">
                    <FileText size={32} className="mx-auto mb-2 opacity-40" />
                    <p className="text-xs">Toggle between Novel &amp; Script Mode</p>
                    <p className="text-[10px] mt-1 opacity-60">Use the buttons in the editor header</p>
                  </div>
                </div>
              )}
            </div>

            {/* ══ RIGHT PANEL ══ */}
            <div className={`hidden w-56 shrink-0 border-l p-3 overflow-y-auto xl:block ${
              isDark ? "border-zinc-800 bg-zinc-900/60" : "border-purple-200/60 bg-white/50"
            }`}>
              <div className={`flex items-center gap-2 mb-3 ${
                isDark ? "text-zinc-500" : "text-zinc-400"
              }`}>
                <Sparkles size={13} />
                <span className="text-[10px] font-semibold uppercase tracking-wider">AI Story Tools</span>
              </div>

              <div className="space-y-2">
                {[
                  { icon: <BrainCircuit size={13} />, label: "AI Assistant", desc: "Suggestions, plot ideas, dialogue", color: "text-violet-500" },
                  { icon: <BookOpen size={13} />, label: "Story Memory", desc: "Remembers lore, arcs, past events", color: "text-indigo-500" },
                  { icon: <List size={13} />, label: "Plot Analyzer", desc: "Pacing analysis, plot holes", color: "text-cyan-500" },
                  { icon: <Search size={13} />, label: "Grammar", desc: "Real-time spelling & style", color: "text-green-500" },
                  { icon: <Sparkles size={13} />, label: "Ideas", desc: "Prompts, twists, starters", color: "text-amber-500" },
                  { icon: <Users size={13} />, label: "Character AI", desc: "Talk to your characters", color: "text-pink-500" },
                ].map((tool, i) => (
                  <div key={i} className={`rounded-lg p-2.5 transition-colors cursor-pointer ${
                    isDark ? "hover:bg-zinc-800" : "hover:bg-purple-50"
                  }`}>
                    <div className="flex items-center gap-1.5">
                      <span className={tool.color}>{tool.icon}</span>
                      <span className={`text-[10px] font-medium ${
                        isDark ? "text-zinc-200" : "text-zinc-700"
                      }`}>{tool.label}</span>
                    </div>
                    <p className={`mt-0.5 text-[9px] leading-relaxed ${
                      isDark ? "text-zinc-500" : "text-zinc-400"
                    }`}>{tool.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Dock ── */}
      <BottomDock isDark={isDark} />
    </div>
  )
}
