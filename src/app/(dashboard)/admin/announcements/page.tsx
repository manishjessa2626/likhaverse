"use client"

import { useState, useEffect } from "react"
import { Megaphone, Trash2, Send } from "lucide-react"
import { getAnnouncements, createAnnouncement, deleteAnnouncement } from "@/app/actions/admin"

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)

  useEffect(() => { getAnnouncements().then(setAnnouncements) }, [])

  const handleCreate = async () => {
    if (!message.trim()) return
    setSending(true)
    await createAnnouncement(message.trim())
    setMessage("")
    setSending(false)
    getAnnouncements().then(setAnnouncements)
  }

  const handleDelete = async (id: string) => {
    await deleteAnnouncement(id)
    getAnnouncements().then(setAnnouncements)
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2"><Megaphone size={20} /> Announcements</h1>
        <p className="mt-1 text-sm text-zinc-500">Create and manage platform-wide announcements</p>
      </div>
      <div className="mb-6 rounded-xl border border-purple-200/60 bg-white/70 p-4">
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Write an announcement..."
          className="w-full rounded-lg border border-purple-200 bg-white/70 p-3 text-xs outline-none resize-none h-20 focus:border-purple-400 dark:border-zinc-600 dark:bg-zinc-800/70 dark:text-zinc-200" />
        <button onClick={handleCreate} disabled={sending || !message.trim()}
          className="mt-2 flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-purple-500 disabled:opacity-50 transition-colors">
          <Send size={13} /> {sending ? "Sending..." : "Send Announcement"}
        </button>
      </div>
      <div className="space-y-2">
        {announcements.length === 0 ? (
          <p className="text-center text-sm text-zinc-400 py-8">No announcements yet</p>
        ) : (
          announcements.map((a) => (
            <div key={a.id} className="flex items-start justify-between rounded-xl border border-purple-200/60 bg-white/70 p-3">
              <div>
                <p className="text-xs text-zinc-700 dark:text-zinc-300">{a.message}</p>
                <p className="mt-1 text-[10px] text-zinc-400">{new Date(a.createdAt).toLocaleString()}</p>
              </div>
              <button onClick={() => handleDelete(a.id)} className="shrink-0 text-zinc-300 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
