"use client"

import { useState } from "react"
import { BookOpen, Trash2, Star, Award, Baby, Sparkles } from "lucide-react"
import { AdminTable } from "../AdminTable"
import { getAdminStories, deleteStory, toggleStoryFlag, updateStoryAgeRating } from "@/app/actions/admin"

const STATUSES = ["ALL", "DRAFT", "PUBLISHED", "COMPLETED"]

const AGE_RATINGS = [
  { value: "EARLY_READERS", label: "Early Readers (3-5)" },
  { value: "JUNIOR_6", label: "Junior 6+" },
  { value: "JUNIOR_9", label: "Junior 9+" },
  { value: "TEEN_13", label: "Teen 13+" },
  { value: "TEEN_16", label: "Teen 16+" },
  { value: "ADULT_18", label: "Adult 18+" },
]

export function StoriesClient({ initialData }: { initialData: any }) {
  const [data, setData] = useState(initialData)
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState("ALL")

  const fetchData = async (p: number, s: string) => {
    const d = await getAdminStories(p, s)
    setData(d)
    setPage(p)
    setStatus(s)
  }

  const handlePage = (p: number) => fetchData(p, status)
  const handleFilter = (s: string) => fetchData(1, s)

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this story? This cannot be undone.")) return
    await deleteStory(id)
    fetchData(page, status)
  }

  const handleToggle = async (id: string, field: string, value: boolean) => {
    await toggleStoryFlag(id, field, value)
    fetchData(page, status)
  }

  const handleAgeRating = async (id: string, rating: string) => {
    await updateStoryAgeRating(id, rating)
    fetchData(page, status)
  }

  const statusColors: Record<string, string> = {
    DRAFT: "bg-zinc-100 text-zinc-600",
    PUBLISHED: "bg-green-100 text-green-700",
    COMPLETED: "bg-blue-100 text-blue-700",
  }

  const columns = [
    { key: "title", label: "Title", render: (v: string) => <span className="font-medium">{v}</span> },
    { key: "author", label: "Author", render: (_: any, row: any) => row.author?.name ?? "—" },
    { key: "_count", label: "Ch", render: (v: any, row: any) => row._count?.chapters ?? 0 },
    { key: "status", label: "Status", render: (v: string) => (
      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColors[v] || "bg-zinc-100 text-zinc-600"}`}>{v}</span>
    )},
    {
      key: "ageRating", label: "Age Rating", render: (v: string, row: any) => {
        const rating = AGE_RATINGS.find((r) => r.value === (v || "EARLY_READERS"))
        return (
          <select
            value={v || "EARLY_READERS"}
            onChange={(e) => handleAgeRating(row.id, e.target.value)}
            className="rounded-lg border border-purple-200/60 bg-white/70 px-2 py-1 text-[10px] text-zinc-700 focus:border-purple-400 focus:outline-none dark:border-zinc-700/60 dark:bg-zinc-800/70 dark:text-zinc-300"
          >
            {AGE_RATINGS.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        )
      },
    },
    {
      key: "id", label: "Actions", render: (id: string, row: any) => (
        <div className="flex items-center gap-1">
          <button onClick={() => handleToggle(id, "juniorApproved", !row.juniorApproved)}
            className={`rounded p-1 transition-colors ${row.juniorApproved ? "text-emerald-500" : "text-zinc-300 hover:text-emerald-400"}`}
            title="Toggle Junior Approved"><Baby size={13} /></button>
          <button onClick={() => handleToggle(id, "featuredInJunior", !row.featuredInJunior)}
            className={`rounded p-1 transition-colors ${row.featuredInJunior ? "text-purple-500" : "text-zinc-300 hover:text-purple-400"}`}
            title="Toggle Featured in Junior"><Sparkles size={13} /></button>
          <button onClick={() => handleToggle(id, "featured", !row.featured)}
            className={`rounded p-1 transition-colors ${row.featured ? "text-amber-500" : "text-zinc-300 hover:text-amber-400"}`}
            title="Toggle Featured"><Star size={13} /></button>
          <button onClick={() => handleToggle(id, "original", !row.original)}
            className={`rounded p-1 transition-colors ${row.original ? "text-purple-500" : "text-zinc-300 hover:text-purple-400"}`}
            title="Toggle Original"><Award size={13} /></button>
          <button onClick={() => handleDelete(id)} className="rounded p-1 text-zinc-300 hover:text-red-500 transition-colors" title="Delete"><Trash2 size={13} /></button>
        </div>
      ),
    },
  ]

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2"><BookOpen size={20} /> Stories</h1>
        <p className="mt-1 text-sm text-zinc-500">{data.total} total stories</p>
      </div>
      <div className="mb-4 flex gap-1 flex-wrap">
        {STATUSES.map((s) => (
          <button key={s} onClick={() => handleFilter(s)}
            className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
              status === s ? "bg-purple-100 text-purple-700" : "text-zinc-500 hover:bg-purple-50"
            }`}>{s}</button>
        ))}
      </div>
      <AdminTable columns={columns} data={data.stories} total={data.total} page={page} pages={data.pages} onPageChange={handlePage} />
    </div>
  )
}
