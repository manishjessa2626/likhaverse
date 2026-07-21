"use client"

import { useState, useEffect } from "react"
import { HeadphonesIcon } from "lucide-react"
import { AdminTable } from "../AdminTable"
import { getSupportMessages } from "@/app/actions/admin"

export default function AdminSupportPage() {
  const [data, setData] = useState<any>({ messages: [], total: 0, pages: 1 })
  const [page, setPage] = useState(1)

  useEffect(() => { getSupportMessages(page).then(setData) }, [page])

  const columns = [
    { key: "sender", label: "Sender", render: (_: any, row: any) => <span className="font-medium">{row.sender?.name ?? "—"}</span> },
    { key: "sender", label: "Email", render: (_: any, row: any) => row.sender?.email ?? "—" },
    { key: "subject", label: "Subject", render: (v: string | null) => <span className="font-medium">{v ?? "—"}</span> },
    { key: "content", label: "Content", render: (v: string) => <span className="text-zinc-500">{v ? (v.length > 80 ? v.slice(0, 80) + "…" : v) : "—"}</span> },
    { key: "createdAt", label: "Date", render: (v: string) => new Date(v).toLocaleDateString() },
  ]

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2"><HeadphonesIcon size={20} /> Support</h1>
        <p className="mt-1 text-sm text-zinc-500">{data.total} support messages</p>
      </div>
      <AdminTable columns={columns} data={data.messages} total={data.total} page={page} pages={data.pages} onPageChange={setPage} />
    </div>
  )
}
