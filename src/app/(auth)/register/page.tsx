"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim())
}

export default function RegisterPage() {
  const [step, setStep] = useState<"form" | "verify" | "type">("form")
  const [error, setError] = useState("")
  const [pending, setPending] = useState("")

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [code, setCode] = useState("")

  async function handleSendCode() {
    if (!name.trim()) { setError("Name is required"); return }
    if (!isValidEmail(email)) { setError("Valid email is required"); return }
    setPending("send")
    setError("")
    try {
      const res = await fetch("/api/auth/email-otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json()
      if (data.error) { setError(data.error); return }
      setStep("verify")
    } catch {
      setError("Failed to send code")
    } finally {
      setPending("")
    }
  }

  async function handleVerify() {
    if (!code.trim()) { setError("Enter the verification code"); return }
    setPending("verify")
    setError("")
    try {
      const res = await fetch("/api/auth/email-otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), code: code.trim(), name: name.trim() }),
      })
      const data = await res.json()
      if (data.error) { setError(data.error); return }

      await signIn("firebase", {
        userId: data.user.id,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role,
        redirect: false,
      })

      if (phone.trim()) {
        try { await fetch("/api/user/phone", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: data.user.id, phone: phone.trim() }) }) } catch {}
      }

      window.location.href = "/"
    } catch {
      setError("Verification failed")
    } finally {
      setPending("")
    }
  }

  function reset() {
    setStep("form")
    setError("")
    setCode("")
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-black via-zinc-950 to-black px-5">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[600px] -translate-x-1/2 rounded-full bg-violet-900/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 left-1/2 h-80 w-[600px] -translate-x-1/2 rounded-full bg-amber-900/10 blur-[120px]" />

      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white">LikhaVerse</h1>
          <p className="mt-1.5 text-sm text-zinc-500">
            {step === "form" ? "Begin your story" : "Check your email"}
          </p>
        </div>

        <div
          className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-2xl transition-all duration-500"
          style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.03), 0 20px 60px -20px rgba(0,0,0,0.8)" }}
        >
          <div className="px-6 py-6">
            {error && (
              <div className="mb-5 rounded-xl bg-red-500/10 px-4 py-2.5 text-center text-sm text-red-400 ring-1 ring-red-500/20">
                {error}
              </div>
            )}

            {step === "form" && (
              <div className="space-y-3">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-zinc-600 transition-colors focus:border-white/[0.2] focus:bg-white/[0.06] focus:outline-none"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-zinc-600 transition-colors focus:border-white/[0.2] focus:bg-white/[0.06] focus:outline-none"
                />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone (optional)"
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-zinc-600 transition-colors focus:border-white/[0.2] focus:bg-white/[0.06] focus:outline-none"
                />
                <button
                  onClick={handleSendCode}
                  disabled={!!pending}
                  className="mt-1 w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-zinc-900 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
                >
                  {pending === "send" ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent" />
                      Sending...
                    </span>
                  ) : "Create Account"}
                </button>
                <p className="text-center text-xs text-zinc-600">
                  Already have an account?{" "}
                  <a href="/login" className="font-medium text-zinc-300 transition-colors hover:text-white">
                    Sign in
                  </a>
                </p>
              </div>
            )}

            {step === "verify" && (
              <div className="space-y-3">
                <button type="button" onClick={reset} className="flex items-center gap-1.5 text-xs text-zinc-500 transition-colors hover:text-zinc-300">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                  Back
                </button>
                <p className="text-center text-xs text-zinc-500">
                  Code sent to <span className="text-zinc-300">{email}</span>
                </p>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-center text-lg tracking-[0.3em] text-white placeholder-zinc-600 transition-colors focus:border-white/[0.2] focus:bg-white/[0.06] focus:outline-none"
                />
                <button
                  onClick={handleVerify}
                  disabled={!!pending || code.length < 4}
                  className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-zinc-900 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
                >
                  {pending === "verify" ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent" />
                      Verifying...
                    </span>
                  ) : "Verify & Join"}
                </button>
              </div>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-zinc-700">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}
