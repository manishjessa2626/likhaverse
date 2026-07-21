"use client"

import Link from "next/link"

interface Props {
  open: boolean
  onClose: () => void
}

export function DailyLimitModal({ open, onClose }: Props) {
  if (!open) return null

  return (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-purple-900/30 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <div
          className="w-full max-w-sm rounded-2xl bg-white/90 border border-purple-200/60 p-6 text-center shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-5xl mb-4">😏</div>
          <h2 className="text-xl font-bold text-zinc-800 mb-2">
            You&apos;re hooked 😏
          </h2>
          <p className="text-zinc-500 text-sm mb-6 leading-relaxed">
            You&apos;ve reached your 2 free episodes today.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={onClose}
              className="w-full rounded-xl bg-purple-100 py-3 text-sm font-medium text-purple-700 hover:bg-purple-200 transition-colors"
            >
              Come back tomorrow
            </button>
            <Link
              href="/premium"
              onClick={onClose}
              className="w-full rounded-xl bg-purple-600 py-3 text-sm font-bold text-white hover:bg-purple-500 transition-colors"
            >
              Go Premium
            </Link>
          </div>
        </div>
      </div>
  )
}
