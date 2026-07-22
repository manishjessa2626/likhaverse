"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import { useSession } from "next-auth/react"
import { useSSE } from "@/hooks/useSSE"
import { showToast } from "@/components/Toast"

interface RealtimeContextType {
  unreadCount: number
  setUnreadCount: (count: number | ((prev: number) => number)) => void
  connected: boolean
}

const RealtimeContext = createContext<RealtimeContextType>({
  unreadCount: 0,
  setUnreadCount: () => {},
  connected: false,
})

export function useRealtime() {
  return useContext(RealtimeContext)
}

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession()
  const [unreadCount, setUnreadCount] = useState(0)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (!session?.user) return
    fetch("/api/notifications/unread-counts")
      .then((r) => r.json())
      .then((data) => {
        const total = (data.main ?? 0) + (data.feed ?? 0)
        setUnreadCount(total)
      })
      .catch(() => {})
  }, [session])

  const onMessage = useCallback((data: any) => {
    if (data.type === "connected") return

    if (data.type === "notification") {
      setUnreadCount((prev) => prev + 1)
      showToast({
        id: data.notification?.id || Math.random().toString(36).slice(2),
        message: data.notification?.message || "New notification",
        link: data.notification?.link,
        type: data.notification?.type,
      })
    }
  }, [])

  const onStatusChange = useCallback((s: string) => {
    setConnected(s === "connected")
  }, [])

  useSSE({
    onMessage,
    onStatusChange,
    enabled: !!session?.user,
  })

  return (
    <RealtimeContext.Provider value={{ unreadCount, setUnreadCount, connected }}>
      {children}
    </RealtimeContext.Provider>
  )
}
