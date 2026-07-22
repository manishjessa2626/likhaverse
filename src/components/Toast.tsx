"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"

interface ToastItem {
  id: string
  message: string
  link?: string | null
  type?: string
}

let toastListeners: ((toast: ToastItem) => void)[] = []

export function showToast(toast: ToastItem) {
  toastListeners.forEach((fn) => fn(toast))
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<(ToastItem & { visible: boolean })[]>([])

  useEffect(() => {
    const listener = (toast: ToastItem) => {
      const id = toast.id || Math.random().toString(36).slice(2)
      setToasts((prev) => [...prev, { ...toast, id, visible: true }])
      setTimeout(() => {
        setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, visible: false } : t)))
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id))
        }, 300)
      }, 5000)
    }
    toastListeners.push(listener)
    return () => {
      toastListeners = toastListeners.filter((fn) => fn !== listener)
    }
  }, [])

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto max-w-sm rounded-xl border border-purple-200/60 bg-white/90 backdrop-blur-md px-4 py-3 shadow-lg transition-all duration-300 dark:border-zinc-700/60 dark:bg-zinc-900/90 ${
            toast.visible ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"
          }`}
        >
          {toast.link ? (
            <Link href={toast.link} className="block text-sm text-zinc-700 dark:text-zinc-300 hover:text-purple-600 dark:hover:text-purple-400">
              {toast.message}
            </Link>
          ) : (
            <p className="text-sm text-zinc-700 dark:text-zinc-300">{toast.message}</p>
          )}
        </div>
      ))}
    </div>
  )
}
