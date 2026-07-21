"use client"

import { useState } from "react"
import { Flag, Check, X } from "lucide-react"
import { AdminTable } from "../AdminTable"
import { getReports, resolveReport } from "@/app/actions/admin"

const STATUSES = ["ALL", "PENDING", "RESOLVED", "DISMISSED"]

export function ReportsClient({ initialData }: { initialData: any }) {
  const [data, setData] = useState(initialData)
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState("ALL")

  const fetchData = async (p: number, s: string) => {
    const d = await getReports(p, s)
    setData(d)
    setPage(p)
    setStatus(s)
  }

  const handlePage = (p: number) => fetchData(p, status)
  const handleFilter = (s: string) => fetchData(1, s)

  const handleResolve = async (id: string) => {
    await resolveReport(id, "RESOLVED")
    fetchData(page, status)
  }

  const handleDismiss = async (id: string) => {
    await resolveReport(id, "DISMISSED")
    fetchData(page, status)
  }

  const columns = [
    { key: "reason", label: "Reason" },
    { key: "reporter", label: "Reporter", render: (_: any, row: any) => row.reporter?.name ?? "—" },
    { key: "story", label: "Story", render: (_: any, row: any) => row.story?.title ?? "—" },
    { key: "createdAt", label: "Date", render: (v: string) => new Date(v).toLocaleDateString() },
    { key: "status", label: "Status", render: (v: string) => {
      const colors: Record<string, string> = { PENDING: "text-amber-600", RESOLVED: "text-green-600", DISMISSED: "text-zinc-400" }
      return <span className={`font-medium ${colors[v] || ""}`}>{v}</span>
    }},
    { key: "id", label: "Actions", render: (id: string, row: any) => row.status === "PENDING" ? (
      <div className="flex gap-1">
        <button onClick={() => handleResolve(id)} className="rounded border border-green-200 bg-green-50 p-1 text-green-600 hover:bg-green-100"><Check size={13} /></button>
        <button onClick={() => handleDismiss(id)} className="rounded border border-zinc-200 bg-zinc-50 p-1 text-zinc-400 hover:bg-zinc-100"><X size={13} /></button>
      </div>
    ) : "—" },
  ]

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2"><Flag size={20} /> Reports</h1>
        <p className="mt-1 text-sm text-zinc-500">{data.total} total reports</p>
      </div>
      <div className="mb-4 flex gap-1">
        {STATUSES.map((s) => (
          <button key={s} onClick={() => handleFilter(s)}
            className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
              status === s ? "bg-purple-100 text-purple-700" : "text-zinc-500 hover:bg-purple-50"
            }`}>{s}</button>
        ))}
      </div>
      <AdminTable columns={columns} data={data.reports} total={data.total} page={page} pages={data.pages} onPageChange={handlePage} />
    </div>
  )
}
