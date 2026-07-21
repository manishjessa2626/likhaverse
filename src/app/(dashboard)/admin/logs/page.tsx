"use client"

import { useState, useEffect } from "react"
import { ScrollText } from "lucide-react"
import { AdminTable } from "../AdminTable"
import { getActivityLogs } from "@/app/actions/admin"

export default function AdminLogsPage() {
  const [data, setData] = useState<any>({ logs: [], total: 0, pages: 1 })
  const [page, setPage] = useState(1)

  useEffect(() => { getActivityLogs(page).then(setData) }, [page])

  const typeColors: Record<string, string> = {
    STORY_CREATED: "bg-green-100 text-green-700",
    CHAPTER_PUBLISHED: "bg-blue-100 text-blue-700",
    COMMENT: "bg-zinc-100 text-zinc-600",
    REPORT: "bg-red-100 text-red-700",
    PREMIUM: "bg-amber-100 text-amber-700",
    USER: "bg-purple-100 text-purple-700",
  }

  const columns = [
    { key: "type", label: "Type", render: (v: string) => (
      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${typeColors[v] || "bg-zinc-100 text-zinc-600"}`}>{v}</span>
    )},
    { key: "message", label: "Message", render: (v: string) => <span className="text-zinc-600">{v ?? "—"}</span> },
    { key: "actor", label: "Actor", render: (_: any, row: any) => row.actor?.name ?? "—" },
    { key: "user", label: "User", render: (_: any, row: any) => row.user?.name ?? "—" },
    { key: "createdAt", label: "Date", render: (v: string) => new Date(v).toLocaleString() },
  ]

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2"><ScrollText size={20} /> Activity Logs</h1>
        <p className="mt-1 text-sm text-zinc-500">{data.total} total log entries</p>
      </div>
      <AdminTable columns={columns} data={data.logs} total={data.total} page={page} pages={data.pages} onPageChange={setPage} />
    </div>
  )
}
