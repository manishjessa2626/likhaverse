"use client"

import Link from "next/link"
import { CheckCircle } from "lucide-react"

export default function VerifiedPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-black via-zinc-950 to-black px-5">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[600px] -translate-x-1/2 rounded-full bg-green-900/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 left-1/2 h-80 w-[600px] -translate-x-1/2 rounded-full bg-violet-900/20 blur-[120px]" />

      <div className="relative z-10 w-full max-w-sm text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 animate-[scale-in_0.3s_ease-out] items-center justify-center rounded-full bg-green-900/30 ring-1 ring-green-500/30">
          <CheckCircle size={44} className="text-green-400" />
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-white">Email verified successfully!</h1>
        <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
          Welcome to LikhaVerse. Your account is now active and ready to go.
        </p>

        <Link href="/login"
          className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-white px-4 py-3 text-sm font-semibold text-zinc-900 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
          Continue to Login
        </Link>
      </div>
    </div>
  )
}
