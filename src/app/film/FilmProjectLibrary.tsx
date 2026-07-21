"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Film,
  Plus,
  Clock,
  CheckCircle2,
  ChevronRight,
  Loader2,
  AlertCircle,
  Sparkles,
  Users,
} from "lucide-react"
import { createFilmProject } from "@/app/actions/films"

const STEP_LABELS = ["Screenplay", "Storyboard", "Shot List", "Production", "Editing"]

function getStepStatus(status: string) {
  if (status === "COMPLETE") return { icon: <CheckCircle2 size={12} className="text-green-400" />, color: "bg-green-500/20 text-green-400" }
  if (status === "GENERATING") return { icon: <Loader2 size={12} className="animate-spin text-amber-400" />, color: "bg-amber-500/20 text-amber-400" }
  return { icon: <Clock size={12} className="text-zinc-500" />, color: "bg-zinc-500/20 text-zinc-500" }
}

function FilmCard({ project }: { project: any }) {
  const doneCount = ["screenplayStatus", "storyboardStatus", "shotListStatus", "productionStatus", "editingStatus"]
    .filter((k) => project[k as keyof typeof project] === "COMPLETE").length
  const totalStatuses = 5
  const progress = Math.round((doneCount / totalStatuses) * 100)

  return (
    <Link
      href={"/film/" + project.id}
      className="group relative overflow-hidden rounded-2xl border border-purple-200/60 bg-white/70 p-5 shadow-sm transition-all hover:shadow-lg hover:border-purple-300 dark:border-zinc-700/60 dark:bg-zinc-800/70 dark:hover:border-zinc-600"
    >
      {/* Gradient top bar */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-500" />

      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-sm">
              <Film size={14} />
            </span>
            <div>
              <h3 className="text-sm font-bold text-zinc-800 truncate dark:text-zinc-100">{project.title}</h3>
              {project.story && (
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500">Based on: {project.story.title}</p>
              )}
            </div>
          </div>

          {project.logline && (
            <p className="mt-2 text-[11px] text-zinc-500 line-clamp-2 dark:text-zinc-400">{project.logline}</p>
          )}

          {/* Pipeline progress */}
          <div className="mt-3 flex items-center gap-1">
            {["screenplayStatus", "storyboardStatus", "shotListStatus", "productionStatus", "editingStatus"].map((k, i) => {
              const status = getStepStatus(project[k as keyof typeof project] as string)
              return (
                <div key={i} className="group/step relative">
                  <div className={`flex h-5 w-5 items-center justify-center rounded-full ${status.color}`}>
                    {status.icon}
                  </div>
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover/step:block z-10">
                    <div className="whitespace-nowrap rounded bg-zinc-800 px-2 py-1 text-[9px] text-white shadow-lg">
                      {STEP_LABELS[i]}: {project[k as keyof typeof project] === "COMPLETE" ? "Done" : "Pending"}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Progress bar */}
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400">{doneCount}/{totalStatuses}</span>
          </div>
        </div>

        <ChevronRight size={16} className="mt-2 shrink-0 text-zinc-300 group-hover:text-purple-500 transition-colors dark:text-zinc-600" />
      </div>
    </Link>
  )
}

export function FilmProjectLibrary({ projects }: { projects: any[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const handleCreate = async () => {
    // If user has stories, create from first story or let them choose
    // For now, redirect to studio to pick a story
    router.push("/studio")
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md">
                <Film size={18} />
              </span>
              <div>
                <h1 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">Filmmaker Studio</h1>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Turn your stories into film projects</p>
              </div>
            </div>
          </div>
          <Link
            href="/studio"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition-all hover:from-indigo-500 hover:to-purple-500 hover:shadow-purple-400/30"
          >
            <Plus size={16} />
            New Project
          </Link>
        </div>

        {/* Pipeline explanation */}
        <div className="mt-6 flex items-center gap-2 rounded-xl border border-purple-200/60 bg-white/50 p-3 dark:border-zinc-700/60 dark:bg-zinc-800/50">
          <Sparkles size={14} className="text-purple-500 shrink-0" />
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
            Each story evolves through 5 AI-powered stages: <strong className="text-zinc-700 dark:text-zinc-300">Screenplay</strong> → <strong className="text-zinc-700 dark:text-zinc-300">Storyboard</strong> → <strong className="text-zinc-700 dark:text-zinc-300">Shot List</strong> → <strong className="text-zinc-700 dark:text-zinc-300">Production Plan</strong> → <strong className="text-zinc-700 dark:text-zinc-300">Editing Notes</strong>
          </p>
        </div>
      </div>

      {/* Projects grid */}
      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-purple-200/60 bg-white/30 py-16 dark:border-zinc-700 dark:bg-zinc-800/20">
          <Film size={48} className="mb-4 text-zinc-300 dark:text-zinc-600" />
          <h3 className="text-lg font-semibold text-zinc-600 dark:text-zinc-400">No film projects yet</h3>
          <p className="mt-1 text-sm text-zinc-400 dark:text-zinc-500">Go to your Studio and pick a story to adapt</p>
          <Link
            href="/studio"
            className="mt-6 flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-purple-500"
          >
            <Sparkles size={16} />
            Go to Studio
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((p) => (
            <FilmCard key={p.id} project={p} />
          ))}
        </div>
      )}
    </div>
  )
}
