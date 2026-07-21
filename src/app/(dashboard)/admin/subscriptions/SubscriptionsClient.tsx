"use client"

import { useState } from "react"
import { Repeat, XCircle } from "lucide-react"
import { AdminTable } from "../AdminTable"
import { getSubscriptions, cancelSubscription } from "@/app/actions/admin"

export function SubscriptionsClient({ initialData }: { initialData: any }) {
  const [data, setData] = useState(initialData)
  const [page, setPage] = useState(1)

  const fetchData = async (p: number) => {
    const d = await getSubscriptions(p)
    setData(d)
    setPage(p)
  }

  const handlePage = (p: number) => fetchData(p)

  const handleCancel = async (userId: string) => {
    if (!confirm("Cancel this subscription? The user will lose premium access.")) return
    await cancelSubscription(userId)
    fetchData(page)
  }

  const planLabel = (row: any) => {
    if (row.isVIP) return "Studio"
    if (row.premium) return "PRO"
    return "Basic"
  }

  const columns = [
    { key: "name", label: "Name", render: (v: string) => <span className="font-medium">{v}</span> },
    { key: "email", label: "Email" },
    { key: "plan", label: "Plan", render: (_: any, row: any) => {
      const plan = planLabel(row)
      const colors: Record<string, string> = { Basic: "bg-zinc-100 text-zinc-600", PRO: "bg-amber-100 text-amber-700", Studio: "bg-purple-100 text-purple-700" }
      return <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${colors[plan] || ""}`}>{plan}</span>
    }},
    { key: "subscriptionStatus", label: "Status", render: (v: string) => (
      <span className={`font-medium capitalize ${v === "active" ? "text-green-600" : "text-zinc-400"}`}>{v}</span>
    )},
    { key: "subscriptionExpiry", label: "Expiry", render: (v: string | null) => v ? new Date(v).toLocaleDateString() : "—" },
    { key: "id", label: "Actions", render: (id: string, row: any) => row.subscriptionStatus === "active" ? (
      <button onClick={() => handleCancel(id)} className="flex items-center gap-1 text-zinc-400 hover:text-red-500 transition-colors text-[10px]">
        <XCircle size={13} /> Cancel
      </button>
    ) : "—" },
  ]

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2"><Repeat size={20} /> Subscriptions</h1>
        <p className="mt-1 text-sm text-zinc-500">{data.total} active subscriptions</p>
      </div>
      <AdminTable columns={columns} data={data.users} total={data.total} page={page} pages={data.pages} onPageChange={handlePage} />
    </div>
  )
}
