"use client"

import { useState, useEffect } from "react"
import { CreditCard } from "lucide-react"
import { AdminTable } from "../AdminTable"
import { getPayments } from "@/app/actions/admin"

export default function AdminPaymentsPage() {
  const [data, setData] = useState<any>({ payments: [], total: 0, pages: 1 })
  const [page, setPage] = useState(1)

  useEffect(() => { getPayments(page).then(setData) }, [page])

  const columns = [
    { key: "user", label: "User", render: (_: any, row: any) => <span className="font-medium">{row.user?.name ?? "—"}</span> },
    { key: "amount", label: "Amount", render: (v: number) => <span className="font-medium">₱{(v / 100).toFixed(2)}</span> },
    { key: "method", label: "Method", render: (v: string) => v ?? "—" },
    { key: "type", label: "Type", render: (v: string) => v ? <span className="capitalize">{v}</span> : "—" },
    { key: "status", label: "Status", render: (v: string) => {
      const colors: Record<string, string> = { completed: "text-green-600", pending: "text-amber-600", failed: "text-red-500" }
      return <span className={`font-medium capitalize ${colors[v] || ""}`}>{v}</span>
    }},
    { key: "createdAt", label: "Date", render: (v: string) => new Date(v).toLocaleDateString() },
  ]

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2"><CreditCard size={20} /> Payments</h1>
        <p className="mt-1 text-sm text-zinc-500">{data.total} total payments</p>
      </div>
      <AdminTable columns={columns} data={data.payments} total={data.total} page={page} pages={data.pages} onPageChange={setPage} />
    </div>
  )
}
