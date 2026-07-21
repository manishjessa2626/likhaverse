"use client"

import { useActionState, useState } from "react"
import { markMessageRead, deleteMessage } from "@/app/actions/messages"
import { formatDate } from "@/lib/utils"

interface Message {
  id: string
  subject: string | null
  content: string
  read: boolean
  createdAt: string | Date
  sender?: { id: string; name: string; avatar: string | null }
  receiver?: { id: string; name: string; avatar: string | null }
}

export function MessageList({
  inbox,
  outbox,
}: {
  inbox: Message[]
  outbox: Message[]
}) {
  const [tab, setTab] = useState<"inbox" | "outbox">("inbox")
  const [expanded, setExpanded] = useState<string | null>(null)
  const [messages, setMessages] = useState({ inbox, outbox })

  async function handleOpen(message: Message) {
    if (tab === "inbox" && !message.read) {
      await markMessageRead(message.id)
      setMessages((prev) => ({
        ...prev,
        inbox: prev.inbox.map((m) =>
          m.id === message.id ? { ...m, read: true } : m
        ),
      }))
    }
    setExpanded(expanded === message.id ? null : message.id)
  }

  async function handleDelete(messageId: string) {
    if (!confirm("Delete this message?")) return
    await deleteMessage(messageId)
    setMessages((prev) => ({
      inbox: prev.inbox.filter((m) => m.id !== messageId),
      outbox: prev.outbox.filter((m) => m.id !== messageId),
    }))
  }

  const current = tab === "inbox" ? messages.inbox : messages.outbox

  return (
    <div>
      <div className="mt-6 flex gap-2 border-b pb-2">
        <button
          onClick={() => setTab("inbox")}
          className={`px-3 py-1.5 text-sm font-medium rounded-t ${
            tab === "inbox"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-zinc-500 hover:text-zinc-700"
          }`}
        >
          Inbox ({messages.inbox.length})
        </button>
        <button
          onClick={() => setTab("outbox")}
          className={`px-3 py-1.5 text-sm font-medium rounded-t ${
            tab === "outbox"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-zinc-500 hover:text-zinc-700"
          }`}
        >
          Sent ({messages.outbox.length})
        </button>
      </div>

      {current.length === 0 ? (
        <p className="mt-6 text-zinc-400 text-center py-8">No messages.</p>
      ) : (
        <div className="mt-4 space-y-2">
          {current.map((msg) => (
            <div key={msg.id} className="rounded-lg border bg-white">
              <div
                onClick={() => handleOpen(msg)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleOpen(msg) } }}
                role="button"
                tabIndex={0}
                className="flex w-full items-center justify-between px-4 py-3 text-left cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {tab === "inbox" && !msg.read && (
                    <span className="h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                  )}
                  <div className="min-w-0">
                    <p className={`text-sm truncate ${!msg.read && tab === "inbox" ? "font-semibold" : ""}`}>
                      {msg.subject || "(No subject)"}
                    </p>
                    <p className="text-xs text-zinc-400">
                      {tab === "inbox" ? msg.sender?.name : msg.receiver?.name} &middot; {formatDate(new Date(msg.createdAt))}
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(msg.id) }}
                  className="ml-2 text-xs text-red-500 hover:underline shrink-0"
                >
                  Delete
                </button>
              </div>
              {expanded === msg.id && (
                <div className="border-t px-4 py-3">
                  <p className="text-sm text-zinc-700 whitespace-pre-wrap">{msg.content}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
