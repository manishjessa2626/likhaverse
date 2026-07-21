"use client"

import { useActionState } from "react"
import { sendMessage } from "@/app/actions/messages"
import { Button } from "@/components/ui/Button"

interface User { id: string; name: string }

export function ComposeMessage({ users }: { users: User[] }) {
  const [state, formAction, pending] = useActionState(sendMessage, undefined)

  return (
    <form action={formAction} className="space-y-4 rounded-xl border p-6">
      <div>
        <label className="block text-sm font-medium mb-1">Recipient *</label>
        <select name="receiverId" required className="block w-full rounded-lg border px-3 py-2 text-sm">
          <option value="">Select a user...</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Subject</label>
        <input name="subject" className="block w-full rounded-lg border px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Message *</label>
        <textarea name="content" required rows={6} className="block w-full rounded-lg border px-3 py-2 text-sm" />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Sending..." : "Send Message"}
      </Button>
      {state?.message && (
        <p className="text-sm text-green-600">{state.message}</p>
      )}
      {state?.error && (
        <p className="text-sm text-red-500">{Object.values(state.error).flat().join(", ")}</p>
      )}
    </form>
  )
}
