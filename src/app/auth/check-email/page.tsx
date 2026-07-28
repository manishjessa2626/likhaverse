"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Mail, RefreshCw, Edit3, ArrowLeft } from "lucide-react"

export default function CheckEmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const email = searchParams.get("email") || ""
  const [cooldown, setCooldown] = useState(0)
  const [resending, setResending] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setInterval(() => setCooldown((c) => c - 1), 1000)
    return () => clearInterval(t)
  }, [cooldown])

  const handleResend = async () => {
    if (cooldown > 0 || resending) return
    setResending(true)
    setMessage("")
    setError("")
    try {
      const { auth } = await import("@/lib/firebase")
      const { sendEmailVerification } = await import("firebase/auth")
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser, {
          url: `${window.location.origin}/auth/verify-email`,
          handleCodeInApp: false,
        })
        setMessage("Verification email sent successfully!")
        setCooldown(60)
      } else {
        setError("Session expired. Please try registering again.")
      }
    } catch (err: unknown) {
      const fbErr = err as { code?: string }
      if (fbErr.code === "auth/too-many-requests") {
        setError("Too many requests. Please wait a moment.")
      } else {
        setError("Failed to resend. Please try again.")
      }
    } finally {
      setResending(false)
    }
  }

  const mailtoUrl = `https://mail.google.com/mail/u/0/#search/from%3Alikhaverse`

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-black via-zinc-950 to-black px-5">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[600px] -translate-x-1/2 rounded-full bg-violet-900/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 left-1/2 h-80 w-[600px] -translate-x-1/2 rounded-full bg-amber-900/10 blur-[120px]" />

      <div className="relative z-10 w-full max-w-md text-center">
        <div className="mb-8">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-violet-900/30 ring-1 ring-violet-500/30">
            <Mail size={40} className="text-violet-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Check your email</h1>
          <p className="mt-3 text-sm text-zinc-400 leading-relaxed max-w-sm mx-auto">
            We sent a verification email to:
          </p>
          <p className="mt-2 text-base font-semibold text-violet-300 break-all">{email || "your email"}</p>
          <p className="mt-2 text-xs text-zinc-500">
            Click the verification link before signing in.
          </p>
        </div>

        {message && (
          <div className="mb-4 rounded-xl bg-green-500/10 px-4 py-2.5 text-sm text-green-400 ring-1 ring-green-500/20">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-4 rounded-xl bg-red-500/10 px-4 py-2.5 text-sm text-red-400 ring-1 ring-red-500/20">
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-2xl"
          style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.03), 0 20px 60px -20px rgba(0,0,0,0.8)" }}>
          <div className="px-6 py-6 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 text-left">Open your email</p>

            <a href={mailtoUrl} target="_blank" rel="noopener noreferrer"
              className="flex w-full items-center gap-3 rounded-xl bg-white/[0.06] px-4 py-3 text-sm font-medium text-zinc-200 transition-all hover:scale-[1.02] hover:bg-white/[0.1] active:scale-[0.98]">
              <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Open Gmail
            </a>

            <a href="https://outlook.live.com/mail/0/" target="_blank" rel="noopener noreferrer"
              className="flex w-full items-center gap-3 rounded-xl bg-white/[0.06] px-4 py-3 text-sm font-medium text-zinc-200 transition-all hover:scale-[1.02] hover:bg-white/[0.1] active:scale-[0.98]">
              <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M11.5 2.5v9.5l-9 4.5V7.5l3.5-1.5 5.5-3.5zm1 0l7 5-3.5 1.5L12.5 12V2.5zm0 10.5l9-4.5V17l-9 4.5v-9zM10.5 12L2 7.5V17l8.5-5z" fill="#0078D4"/></svg>
              Open Outlook
            </a>

            <a href="https://mail.yahoo.com/" target="_blank" rel="noopener noreferrer"
              className="flex w-full items-center gap-3 rounded-xl bg-white/[0.06] px-4 py-3 text-sm font-medium text-zinc-200 transition-all hover:scale-[1.02] hover:bg-white/[0.1] active:scale-[0.98]">
              <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="#6001D2"><path d="M13.5 2.5c-2.5 0-4.5 2-4.5 4.5s2 4.5 4.5 4.5S18 9.5 18 7s-2-4.5-4.5-4.5zm0 7c-1.4 0-2.5-1.1-2.5-2.5s1.1-2.5 2.5-2.5S16 5.6 16 7s-1.1 2.5-2.5 2.5zM6 11.5L2 22h4l1.5-5.5L9 22h4l-4-10.5h-3z"/></svg>
              Open Yahoo Mail
            </a>

            <details className="group">
              <summary className="flex cursor-pointer items-center gap-2 rounded-xl bg-white/[0.04] px-4 py-3 text-sm font-medium text-zinc-400 hover:text-zinc-200 transition-colors">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
                Open Apple Mail
              </summary>
              <div className="mt-2 rounded-xl bg-white/[0.04] px-4 py-3 text-xs text-zinc-500 leading-relaxed">
                <p className="mb-1 font-medium text-zinc-400">On iPhone or iPad:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Open the <strong className="text-zinc-300">Mail</strong> app</li>
                  <li>Check your inbox for the verification email</li>
                  <li>Tap the verification link</li>
                </ol>
                <p className="mt-2 mb-1 font-medium text-zinc-400">On Mac:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Open the <strong className="text-zinc-300">Mail</strong> app</li>
                  <li>Check your inbox</li>
                  <li>Click the verification link</li>
                </ol>
              </div>
            </details>
          </div>
        </div>

        <div className="mt-6 space-y-2">
          <button onClick={handleResend} disabled={cooldown > 0 || resending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/[0.06] px-4 py-3 text-sm font-medium text-zinc-300 transition-all hover:bg-white/[0.1] hover:text-white disabled:opacity-40">
            <RefreshCw size={16} className={resending ? "animate-spin" : ""} />
            {cooldown > 0
              ? `Resend available in ${cooldown}s`
              : resending ? "Sending..." : "Resend Verification Email"}
          </button>

          <Link href="/register"
            className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-zinc-500 transition-all hover:text-zinc-300">
            <Edit3 size={16} />
            Change Email Address
          </Link>

          <Link href="/login"
            className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-zinc-500 transition-all hover:text-zinc-300">
            <ArrowLeft size={16} />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}
