"use client"

import { useState } from "react"
import { Users, Shield, Trash2, Star } from "lucide-react"
import { AdminTable } from "../AdminTable"
import { updateUserRole, deleteUser, getUsers } from "@/app/actions/admin"

const ROLES = ["READER", "AUTHOR", "VIP_GOLD", "PREMIUM_CREATOR", "ADMIN", "SUPER_ADMIN"]

export function UsersClient({ initialData }: { initialData: any }) {
  const [data, setData] = useState(initialData)
  const [page, setPage] = useState(1)

  const handlePage = async (p: number) => {
    const d = await getUsers(p)
    setData(d)
    setPage(p)
  }

  const handleRole = async (userId: string, role: string) => {
    await updateUserRole(userId, role)
    const d = await getUsers(page)
    setData(d)
  }

  const handleDelete = async (userId: string) => {
    if (!confirm("Delete this user? This cannot be undone.")) return
    await deleteUser(userId)
    const d = await getUsers(page)
    setData(d)
  }

  const columns = [
    { key: "name", label: "Name", render: (_: any, row: any) => <span className="font-medium">{row.name}</span> },
    { key: "email", label: "Email" },
    { key: "role", label: "Role", render: (role: string, row: any) => (
      <select value={role} onChange={(e) => handleRole(row.id, e.target.value)}
        className="rounded-lg border border-purple-200 bg-white/70 px-2 py-0.5 text-[10px] outline-none dark:border-zinc-600 dark:bg-zinc-800/70">
        {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
      </select>
    )},
    { key: "premium", label: "Status", render: (_: any, row: any) => row.premium ? <span className="text-amber-600 font-medium">Premium</span> : <span className="text-zinc-400">Free</span> },
    { key: "id", label: "Actions", render: (id: string, row: any) => (
      <button onClick={() => handleDelete(id)} className="text-zinc-400 hover:text-red-500 transition-colors"><Trash2 size={13} /></button>
    )},
  ]

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2"><Users size={20} /> Users</h1>
        <p className="mt-1 text-sm text-zinc-500">{data.total} total users</p>
      </div>
      <AdminTable
        columns={columns}
        data={data.users}
        total={data.total}
        page={page}
        pages={data.pages}
        onPageChange={handlePage}
        searchable
        onSearch={async (q) => { const d = await getUsers(1, q); setData(d); setPage(1) }}
      />
    </div>
  )
}
