"use client"

import { useState } from "react"
import { Shield, Trash2 } from "lucide-react"
import { AdminTable } from "../AdminTable"
import { getModerationQueue, deleteComment } from "@/app/actions/admin"

export function ModerationClient({ initialData }: { initialData: any }) {
  const [data, setData] = useState(initialData)
  const [page, setPage] = useState(1)

  const fetchData = async (p: number) => {
    const d = await getModerationQueue(p)
    setData(d)
    setPage(p)
  }

  const handlePage = (p: number) => fetchData(p)

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this comment? This cannot be undone.")) return
    await deleteComment(id)
    fetchData(page)
  }

  const columns = [
    { key: "content", label: "Comment", render: (v: string) => (
      <span className="text-zinc-600">{v ? (v.length > 80 ? v.slice(0, 80) + "…" : v) : "—"}</span>
    )},
    { key: "user", label: "Author", render: (_: any, row: any) => <span className="font-medium">{row.user?.name ?? "—"}</span> },
    { key: "story", label: "Story", render: (_: any, row: any) => row.story?.title ?? "—" },
    { key: "reports", label: "Reports", render: (v: any[]) => <span className="font-medium text-amber-600">{v?.length ?? 0}</span> },
    { key: "createdAt", label: "Date", render: (v: string) => new Date(v).toLocaleDateString() },
    { key: "id", label: "Actions", render: (id: string) => (
      <button onClick={() => handleDelete(id)} className="text-zinc-400 hover:text-red-500 transition-colors"><Trash2 size={13} /></button>
    )},
  ]

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2"><Shield size={20} /> Moderation</h1>
        <p className="mt-1 text-sm text-zinc-500">{data.total} reported comments</p>
      </div>
      <AdminTable columns={columns} data={data.comments} total={data.total} page={page} pages={data.pages} onPageChange={handlePage} />
    </div>
  )
}
