"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { markNotificationRead, markAllNotificationsRead } from "@/app/actions/notifications"

interface Notification {
  id: string
  type: string
  message: string
  link: string | null
  read: boolean
  createdAt: string
  actor: { id: string; name: string; avatar: string | null } | null
}

export function NotificationsList({ notifications: initial, category = "main" }: { notifications: Notification[]; category?: "main" | "feed" }) {
  const [notifications, setNotifications] = useState(initial)
  const [markingAll, setMarkingAll] = useState(false)
  const router = useRouter()

  async function handleMarkRead(id: string) {
    await markNotificationRead(id, category)
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  async function handleMarkAllRead() {
    setMarkingAll(true)
    try {
      await markAllNotificationsRead(category)
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    } finally {
      setMarkingAll(false)
    }
  }

  const unread = notifications.filter((n) => !n.read).length

  if (notifications.length === 0) {
    return (
      <div className="rounded-xl border p-12 text-center dark:border-zinc-700">
        <p className="text-zinc-400 dark:text-zinc-500">No notifications yet</p>
      </div>
    )
  }

  return (
    <div>
      {unread > 0 && (
        <div className="mb-4 flex justify-end">
          <button
            onClick={handleMarkAllRead}
            disabled={markingAll}
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 disabled:opacity-50"
          >
            {markingAll ? "Marking..." : "Mark all as read"}
          </button>
        </div>
      )}

      <div className="space-y-2">
        {notifications.map((n) => (
          <Link
            key={n.id}
            href={n.link ?? "#"}
            onClick={() => {
              if (!n.read) handleMarkRead(n.id)
            }}
            className={`flex items-start gap-4 rounded-xl border p-4 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800 ${
              !n.read ? "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20" : ""
            }`}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-amber-500 text-sm font-bold text-white">
              {n.actor?.name?.charAt(0).toUpperCase() ?? "?"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-zinc-700 dark:text-zinc-300">{n.message}</p>
              <p className="mt-0.5 text-xs text-zinc-400">
                {timeAgo(new Date(n.createdAt))}
              </p>
            </div>
            {!n.read && (
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return "just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return date.toLocaleDateString()
}
