"use client"

import { useState } from "react"
import { setPremium } from "@/app/actions/premium"
import { Button } from "@/components/ui/Button"

interface User {
  id: string; name: string; email: string | null; premium: boolean; role: string
}

export function PremiumUserList({ users }: { users: User[] }) {
  const [userList, setUserList] = useState(users)
  const [pendingId, setPendingId] = useState<string | null>(null)

  async function togglePremium(user: User) {
    setPendingId(user.id)
    await setPremium(user.id, !user.premium)
    setUserList((prev) =>
      prev.map((u) =>
        u.id === user.id ? { ...u, premium: !u.premium } : u
      )
    )
    setPendingId(null)
  }

  return (
    <div className="mt-6">
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-zinc-500">Name</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-500">Email</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-500">Role</th>
              <th className="px-4 py-3 text-center font-medium text-zinc-500">Premium</th>
              <th className="px-4 py-3 text-center font-medium text-zinc-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {userList.map((user) => (
              <tr key={user.id} className="hover:bg-zinc-50">
                <td className="px-4 py-3 font-medium text-zinc-800">{user.name}</td>
                <td className="px-4 py-3 text-zinc-500">{user.email}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  {user.premium ? (
                    <span className="text-green-600 font-medium">Active</span>
                  ) : (
                    <span className="text-zinc-400">Free</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <Button
                    size="sm"
                    variant={user.premium ? "danger" : "primary"}
                    onClick={() => togglePremium(user)}
                    disabled={pendingId === user.id}
                  >
                    {pendingId === user.id
                      ? "..."
                      : user.premium
                        ? "Remove Premium"
                        : "Grant Premium"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
