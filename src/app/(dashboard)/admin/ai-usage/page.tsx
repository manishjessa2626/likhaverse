"use client"

import { useState, useEffect } from "react"
import { Cpu } from "lucide-react"
import { AdminTable } from "../AdminTable"
import { getAiUsage } from "@/app/actions/admin"

export default function AdminAiUsagePage() {
  const [data, setData] = useState<any>({ generations: [], total: 0, pages: 1, typeBreakdown: [] })
  const [page, setPage] = useState(1)

  useEffect(() => { getAiUsage(page).then(setData) }, [page])

  const columns = [
    { key: "user", label: "User", render: (_: any, row: any) => <span className="font-medium">{row.user?.name ?? "—"}</span> },
    { key: "type", label: "Type", render: (v: string) => <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-medium text-purple-700">{v}</span> },
    { key: "prompt", label: "Prompt", render: (v: string) => <span className="text-zinc-500">{v ? (v.length > 60 ? v.slice(0, 60) + "…" : v) : "—"}</span> },
    { key: "status", label: "Status", render: (v: string) => (
      <span className={`font-medium capitalize ${v === "completed" ? "text-green-600" : v === "failed" ? "text-red-500" : "text-amber-600"}`}>{v}</span>
    )},
    { key: "createdAt", label: "Date", render: (v: string) => new Date(v).toLocaleDateString() },
  ]

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2"><Cpu size={20} /> AI Usage</h1>
        <p className="mt-1 text-sm text-zinc-500">{data.total} total generations</p>
      </div>
      <div className="mb-6 grid grid-cols-4 gap-3">
        {data.typeBreakdown?.map((t: any) => (
          <div key={t.type} className="rounded-xl border border-purple-200/60 bg-white/70 p-3">
            <p className="text-lg font-bold text-zinc-800">{t._count.type}</p>
            <p className="text-[10px] text-zinc-500">{t.type}</p>
          </div>
        ))}
      </div>
      <AdminTable columns={columns} data={data.generations} total={data.total} page={page} pages={data.pages} onPageChange={setPage} />
    </div>
  )
}
