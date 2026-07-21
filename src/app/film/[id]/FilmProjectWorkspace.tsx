"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Film,
  ArrowLeft,
  Sparkles,
  Loader2,
  CheckCircle2,
  Clock,
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
  Edit3,
  Users,
  Save,
  X,
} from "lucide-react"
import {
  runFilmPipelineStep,
  updateFilmProject,
  addCrewMember,
  removeCrewMember,
  deleteFilmProject,
} from "@/app/actions/films"

// ─── Types ───

interface CrewMember {
  id: string
  name: string
  role: string
}

interface StoryInfo {
  id: string
  title: string
  description?: string | null
  cover?: string | null
  tags?: string | null
}

interface FilmProjectData {
  id: string
  title: string
  logline: string | null
  genre: string | null
  status: string
  screenplayStatus: string
  storyboardStatus: string
  shotListStatus: string
  productionStatus: string
  editingStatus: string
  screenplayContent: string | null
  storyboardData: string | null
  shotListData: string | null
  productionPlan: string | null
  editingNotes: string | null
  budgetEstimate: string | null
  posterUrl: string | null
  runtime: number | null
  story: StoryInfo
  crew: CrewMember[]
}

// ─── Pipeline step definitions ───

const PIPELINE_STEPS = [
  { id: "screenplay", label: "Screenplay", icon: "🎬", desc: "Convert novel to screenplay format with scene headings and dialogue", statusKey: "screenplayStatus" as const, contentKey: "screenplayContent" as const },
  { id: "storyboard", label: "Storyboard", icon: "🎨", desc: "Visual breakdown with shot descriptions and camera notes", statusKey: "storyboardStatus" as const, contentKey: "storyboardData" as const },
  { id: "shotlist", label: "Shot List", icon: "🎯", desc: "Detailed shot-by-shot breakdown for production", statusKey: "shotListStatus" as const, contentKey: "shotListData" as const },
  { id: "production", label: "Production Plan", icon: "📋", desc: "Cast, locations, crew, schedule, and budget", statusKey: "productionStatus" as const, contentKey: "productionPlan" as const },
  { id: "editing", label: "Editing Notes", icon: "✂️", desc: "Pacing, visual consistency, dialogue, post-production notes", statusKey: "editingStatus" as const, contentKey: "editingNotes" as const },
]

const CREW_ROLES = ["DIRECTOR", "SCREENWRITER", "PRODUCER", "CINEMATOGRAPHER", "EDITOR", "COMPOSER", "PRODUCTION_DESIGNER", "COSTUME_DESIGNER"]

// ─── Simple Markdown Renderer ───

function MarkdownBlock({ content }: { content: string }) {
  const lines = content.split("\n")
  let inCode = false
  const els: React.ReactElement[] = []
  let idx = 0
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i]
    if (l.trim().startsWith("```")) {
      if (inCode) { inCode = false; continue }
      inCode = true; continue
    }
    if (inCode) {
      if (!els.length || els[els.length - 1].type !== "pre") {
        els.push(<pre key={idx++} className="my-2 overflow-x-auto rounded-lg bg-zinc-900 p-3 text-xs text-green-300 dark:bg-black/60"><code /></pre>)
      }
      continue
    }
    if (l.startsWith("## ")) els.push(<h3 key={idx++} className="mt-3 text-sm font-bold text-zinc-800 dark:text-zinc-100">{l.slice(3)}</h3>)
    else if (l.startsWith("### ")) els.push(<h4 key={idx++} className="mt-2 text-xs font-bold text-zinc-700 dark:text-zinc-200">{l.slice(4)}</h4>)
    else if (l.trim().startsWith("- ")) els.push(<p key={idx++} className="pl-3 text-[11px] text-zinc-600 dark:text-zinc-400">• {l.trim().slice(2)}</p>)
    else if (l.trim() === "") els.push(<div key={idx++} className="h-1" />)
    else els.push(<p key={idx++} className="text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-400">{l}</p>)
  }
  return <div className="space-y-0.5">{els}</div>
}

// ─── Main Component ───

export function FilmProjectWorkspace({ project: initial }: { project: FilmProjectData }) {
  const router = useRouter()
  const [project, setProject] = useState(initial)
  const [activeStep, setActiveStep] = useState<string | null>(null)
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [editingMeta, setEditingMeta] = useState(false)
  const [editTitle, setEditTitle] = useState(project.title)
  const [editLogline, setEditLogline] = useState(project.logline || "")
  const [newMemberName, setNewMemberName] = useState("")
  const [newMemberRole, setNewMemberRole] = useState("DIRECTOR")
  const [showAddCrew, setShowAddCrew] = useState(false)

  const handleRunStep = useCallback(async (stepId: string) => {
    setLoading(stepId)
    setError(null)
    const result = await runFilmPipelineStep(project.id, stepId)
    if (result.error) {
      setError(result.error)
    } else {
      const statusKey = stepId + "Status"
      const contentKey = stepId === "editing" ? "editingNotes" : stepId === "shotlist" ? "shotListData" : stepId === "production" ? "productionPlan" : stepId + "Data"
      setProject((prev: any) => ({ ...prev, [statusKey]: "COMPLETE" }))
    }
    setLoading(null)
  }, [project.id])

  const handleSaveMeta = async () => {
    await updateFilmProject(project.id, { title: editTitle, logline: editLogline || undefined })
    setProject((prev) => ({ ...prev, title: editTitle, logline: editLogline }))
    setEditingMeta(false)
  }

  const handleAddCrew = async () => {
    if (!newMemberName.trim()) return
    await addCrewMember(project.id, newMemberName.trim(), newMemberRole)
    const res = await fetch("/film/" + project.id + "/api")
    if (res.ok) {
      const data = await res.json()
      setProject(data)
    }
    setNewMemberName("")
    setShowAddCrew(false)
  }

  const handleRemoveCrew = async (memberId: string) => {
    await removeCrewMember(memberId)
    setProject((prev) => ({ ...prev, crew: prev.crew.filter((c: CrewMember) => c.id !== memberId) }))
  }

  const handleDelete = async () => {
    if (!confirm("Delete this film project permanently?")) return
    await deleteFilmProject(project.id)
    router.push("/film")
  }

  const activeContent = activeStep
    ? project[PIPELINE_STEPS.find((s) => s.id === activeStep)?.contentKey ?? "screenplayContent" as keyof FilmProjectData] as string | null
    : null

  const activeStatus = activeStep
    ? project[PIPELINE_STEPS.find((s) => s.id === activeStep)?.statusKey ?? "screenplayStatus" as keyof FilmProjectData] as string
    : null

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Back link */}
      <button
        onClick={() => router.push("/film")}
        className="mb-4 flex items-center gap-1.5 text-xs text-zinc-500 hover:text-purple-600 transition-colors dark:text-zinc-400 dark:hover:text-zinc-300"
      >
        <ArrowLeft size={14} />
        Back to Film Projects
      </button>

      {/* Header */}
      <div className="mb-6">
        {editingMeta ? (
          <div className="space-y-3">
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full rounded-xl border border-purple-200 bg-white/70 px-3 py-2 text-lg font-bold text-zinc-800 outline-none focus:border-purple-400 dark:border-zinc-700 dark:bg-zinc-800/70 dark:text-zinc-100"
            />
            <textarea
              value={editLogline}
              onChange={(e) => setEditLogline(e.target.value)}
              rows={2}
              placeholder="Logline / short description..."
              className="w-full rounded-xl border border-purple-200 bg-white/50 px-3 py-2 text-sm text-zinc-600 outline-none focus:border-purple-400 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-400"
            />
            <div className="flex gap-2">
              <button onClick={handleSaveMeta} className="flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-purple-500"><Save size={12} /> Save</button>
              <button onClick={() => setEditingMeta(false)} className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs text-zinc-600 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-400"><X size={12} /> Cancel</button>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-xl text-white shadow-md">
                <Film size={20} />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">{project.title}</h1>
                  <button onClick={() => { setEditTitle(project.title); setEditLogline(project.logline || ""); setEditingMeta(true) }} className="text-zinc-400 hover:text-purple-500 transition-colors">
                    <Edit3 size={14} />
                  </button>
                </div>
                {project.logline && <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">{project.logline}</p>}
                <div className="mt-1 flex items-center gap-2 text-[10px] text-zinc-400 dark:text-zinc-500">
                  <span>Based on: <strong className="text-zinc-600 dark:text-zinc-300">{project.story.title}</strong></span>
                  {project.genre && <><span>·</span><span>{project.genre}</span></>}
                </div>
              </div>
            </div>
            <button onClick={handleDelete} className="rounded-lg border border-red-200 px-3 py-1.5 text-[11px] text-red-500 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30">
              Delete
            </button>
          </div>
        )}
      </div>

      <div className="flex gap-6">
        {/* ── Left sidebar: Pipeline steps ── */}
        <div className="w-64 shrink-0 space-y-2">
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-500 mb-3">Production Pipeline</h3>

          {/* Novel step (static, always complete) */}
          <div className="flex items-center gap-3 rounded-xl border border-purple-200/60 bg-purple-50/50 p-3 dark:border-zinc-700 dark:bg-zinc-800/50">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-sm text-white shadow-sm">📖</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-100">Novel</p>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate">{project.story.title}</p>
            </div>
            <CheckCircle2 size={14} className="text-green-500 shrink-0" />
          </div>

          {/* Connector line */}
          <div className="flex justify-center">
            <div className="h-4 w-0.5 rounded-full bg-gradient-to-b from-purple-300 to-indigo-300 dark:from-zinc-600 dark:to-zinc-600" />
          </div>

          {/* AI pipeline steps */}
          {PIPELINE_STEPS.map((step, i) => {
            const status = project[step.statusKey] as string
            const isActive = activeStep === step.id
            const isComplete = status === "COMPLETE"
            const isCurrentLoading = loading === step.id

            return (
              <div key={step.id}>
                <button
                  onClick={() => setActiveStep(step.id)}
                  className={`w-full flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                    isActive
                      ? "border-indigo-300 bg-white shadow-md dark:border-zinc-500 dark:bg-zinc-800"
                      : isComplete
                        ? "border-green-200/60 bg-white/50 hover:border-green-300 dark:border-green-900/30 dark:bg-zinc-800/50 dark:hover:border-green-700"
                        : "border-zinc-200/60 bg-white/30 hover:bg-white/50 dark:border-zinc-700/60 dark:bg-zinc-800/30 dark:hover:bg-zinc-800/50"
                  }`}
                >
                  <span className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm shadow-sm ${
                    isComplete
                      ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white"
                      : isActive
                        ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white"
                        : "bg-zinc-200 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400"
                  }`}>
                    {isComplete ? <CheckCircle2 size={14} /> : step.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold ${isActive ? "text-indigo-700 dark:text-zinc-100" : isComplete ? "text-green-700 dark:text-green-400" : "text-zinc-600 dark:text-zinc-400"}`}>
                      {step.label}
                    </p>
                    <p className="text-[9px] text-zinc-400 dark:text-zinc-500 truncate">{step.desc}</p>
                  </div>
                  <ChevronRight size={14} className={`shrink-0 transition-colors ${isActive ? "text-indigo-500" : "text-zinc-300 dark:text-zinc-600"}`} />
                </button>

                {/* Generation button */}
                <div className="ml-10 mt-1">
                  {isComplete ? (
                    <span className="text-[9px] text-green-500 dark:text-green-400">Completed ✓</span>
                  ) : isCurrentLoading ? (
                    <span className="flex items-center gap-1 text-[9px] text-amber-500"><Loader2 size={10} className="animate-spin" /> Generating...</span>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleRunStep(step.id) }}
                      className="flex items-center gap-1 text-[9px] text-purple-500 hover:text-purple-700 transition-colors dark:text-purple-400 dark:hover:text-purple-300"
                    >
                      <Sparkles size={10} />
                      Generate with AI
                    </button>
                  )}
                </div>

                {/* Connector (not after last) */}
                {i < PIPELINE_STEPS.length - 1 && (
                  <div className="flex justify-center">
                    <div className="h-3 w-0.5 rounded-full bg-zinc-200 dark:bg-zinc-700" />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* ── Right content area ── */}
        <div className="flex-1 min-w-0">
          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
              {error}
              <button onClick={() => setError(null)} className="ml-2 font-bold">&times;</button>
            </div>
          )}

          {activeStep && activeContent ? (
            <div className="rounded-xl border border-purple-200/60 bg-white/70 p-4 shadow-sm dark:border-zinc-700/60 dark:bg-zinc-800/70">
              <h2 className="mb-3 text-sm font-bold text-zinc-800 dark:text-zinc-100">
                {PIPELINE_STEPS.find((s) => s.id === activeStep)?.label} — Generated Content
              </h2>
              <div className="max-h-[60vh] overflow-y-auto scrollbar-thin">
                <MarkdownBlock content={activeContent} />
              </div>
            </div>
          ) : activeStep && !activeContent ? (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-200 bg-white/30 p-12 dark:border-zinc-700 dark:bg-zinc-800/20">
              <Sparkles size={36} className="mb-3 text-zinc-300 dark:text-zinc-600" />
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">No content yet</p>
              <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">Click &quot;Generate with AI&quot; to create this step</p>
            </div>
          ) : (
            <div className="rounded-xl border border-purple-200/60 bg-white/50 p-6 shadow-sm dark:border-zinc-700/60 dark:bg-zinc-800/50">
              <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 mb-4">Production Overview</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
                Select a pipeline step on the left to view or generate content. Each step builds on the previous one.
              </p>

              {/* Quick stats */}
              <div className="grid grid-cols-2 gap-3">
                {PIPELINE_STEPS.map((step) => {
                  const status = project[step.statusKey] as string
                  return (
                    <div key={step.id} className={`rounded-lg border p-3 ${
                      status === "COMPLETE"
                        ? "border-green-200 bg-green-50/50 dark:border-green-900/30 dark:bg-green-950/20"
                        : "border-zinc-200 bg-white/50 dark:border-zinc-700 dark:bg-zinc-800/50"
                    }`}>
                      <div className="flex items-center gap-2">
                        <span className="text-base">{step.icon}</span>
                        <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{step.label}</span>
                        {status === "COMPLETE" && <CheckCircle2 size={12} className="text-green-500 ml-auto" />}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Crew section */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <Users size={12} />
                    Crew
                  </h3>
                  <button onClick={() => setShowAddCrew(!showAddCrew)} className="flex items-center gap-1 text-[10px] text-purple-600 hover:text-purple-500 dark:text-purple-400">
                    <Plus size={10} />
                    Add
                  </button>
                </div>

                {project.crew.length === 0 && !showAddCrew && (
                  <p className="text-[11px] text-zinc-400 dark:text-zinc-500">No crew assigned yet</p>
                )}

                <div className="space-y-1.5">
                  {project.crew.map((member: CrewMember) => (
                    <div key={member.id} className="flex items-center justify-between rounded-lg bg-white/50 px-3 py-2 dark:bg-zinc-800/50">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-[10px] font-bold text-purple-700 dark:bg-zinc-700 dark:text-zinc-300">
                          {member.name.charAt(0)}
                        </span>
                        <div>
                          <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{member.name}</p>
                          <p className="text-[9px] text-zinc-400 dark:text-zinc-500">{member.role.replace("_", " ")}</p>
                        </div>
                      </div>
                      <button onClick={() => handleRemoveCrew(member.id)} className="text-zinc-300 hover:text-red-500 dark:text-zinc-600 dark:hover:text-red-400">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>

                {showAddCrew && (
                  <div className="mt-2 flex gap-2">
                    <input
                      value={newMemberName}
                      onChange={(e) => setNewMemberName(e.target.value)}
                      placeholder="Name"
                      className="flex-1 rounded-lg border border-purple-200 bg-white/70 px-2.5 py-1.5 text-xs outline-none focus:border-purple-400 dark:border-zinc-600 dark:bg-zinc-800/70 dark:text-zinc-200"
                      onKeyDown={(e) => e.key === "Enter" && handleAddCrew()}
                    />
                    <select
                      value={newMemberRole}
                      onChange={(e) => setNewMemberRole(e.target.value)}
                      className="rounded-lg border border-purple-200 bg-white/70 px-2 py-1.5 text-[10px] outline-none focus:border-purple-400 dark:border-zinc-600 dark:bg-zinc-800/70 dark:text-zinc-200"
                    >
                      {CREW_ROLES.map((r) => (
                        <option key={r} value={r}>{r.replace("_", " ")}</option>
                      ))}
                    </select>
                    <button onClick={handleAddCrew} className="rounded-lg bg-purple-600 px-2.5 py-1.5 text-white hover:bg-purple-500">
                      <Plus size={12} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
