"use client"

import { useState, useEffect, useRef, useCallback } from "react"

type SSEStatus = "connecting" | "connected" | "disconnected" | "error"

interface SSEOptions {
  onMessage?: (data: any) => void
  onStatusChange?: (status: SSEStatus) => void
  enabled?: boolean
}

export function useSSE(options: SSEOptions = {}) {
  const { onMessage, onStatusChange, enabled = true } = options
  const [status, setStatus] = useState<SSEStatus>("disconnected")
  const [lastEvent, setLastEvent] = useState<any>(null)
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const retryCountRef = useRef(0)
  const maxRetries = 10

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    const es = new EventSource("/api/notifications/stream")
    eventSourceRef.current = es

    es.onopen = () => {
      retryCountRef.current = 0
      setStatus("connected")
      onStatusChange?.("connected")
    }

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        setLastEvent(data)
        onMessage?.(data)
      } catch {}
    }

    es.onerror = () => {
      es.close()
      setStatus("error")
      onStatusChange?.("error")

      if (retryCountRef.current < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, retryCountRef.current), 30000)
        retryCountRef.current++
        reconnectTimeoutRef.current = setTimeout(connect, delay)
      } else {
        setStatus("disconnected")
        onStatusChange?.("disconnected")
      }
    }
  }, [onMessage, onStatusChange])

  useEffect(() => {
    if (!enabled) return
    connect()
    return () => {
      if (eventSourceRef.current) eventSourceRef.current.close()
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current)
    }
  }, [enabled, connect])

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) eventSourceRef.current.close()
    if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current)
    setStatus("disconnected")
  }, [])

  return { status, lastEvent, reconnect: connect, disconnect }
}
