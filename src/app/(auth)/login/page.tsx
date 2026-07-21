"use client"

import { useState, useRef, useEffect } from "react"
import { signIn } from "next-auth/react"

const LOGIN_TIMEOUT = 10_000

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Request timed out. Check your connection and try again.")), ms),
    ),
  ])
}

function sanitizePhone(input: string): string {
  return input.replace(/[^+\d\s\-()]/g, "").trim()
}

function sanitizeName(input: string): string {
  return input.replace(/[<>"'()]/g, "").trim().slice(0, 100)
}

type View = "main" | "email" | "phone"

export default function LoginPage() {
  const [view, setView] = useState<View>("main")
  const [error, setError] = useState("")
  const [pending, setPending] = useState("")
  const [codeSent, setCodeSent] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [phone, setPhone] = useState("")
  const [phoneName, setPhoneName] = useState("")
  const [phoneCode, setPhoneCode] = useState("")
  const contentRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState<number | undefined>()

  useEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight)
    }
  }, [view, codeSent, error])

  async function loginGoogle() {
    setPending("google")
    setError("")
    try {
      const { GoogleAuthProvider, signInWithPopup } = await import("firebase/auth")
      const { auth } = await import("@/lib/firebase")
      const provider = new GoogleAuthProvider()
      let result
      try {
        result = await withTimeout(signInWithPopup(auth, provider), LOGIN_TIMEOUT)
      } catch (popupErr: any) {
        if (popupErr?.code === "auth/popup-blocked") {
          throw new Error("Popup was blocked by your browser. Please allow popups for this site and try again.")
        }
        if (popupErr?.code === "auth/unauthorized-domain") {
          throw new Error("This domain is not authorized for Google sign-in. Add 'localhost' to Firebase Console > Authentication > Settings > Authorized domains.")
        }
        throw popupErr
      }
      const idToken = await result.user.getIdToken()
      const res = await fetch("/api/auth/firebase/callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, provider: "google" }),
      })
      if (!res.ok) {
        const txt = await res.text().catch(() => "")
        throw new Error(txt ? `Server error: ${txt}` : `Sign-in failed (HTTP ${res.status})`)
      }
      const data = await res.json()
      if (data.error) { setError(data.error); return }
      const signInRes = await signIn("firebase", {
        userId: data.user.id,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role,
        redirect: false,
      })
      if (signInRes?.error) {
        throw new Error(signInRes.error)
      }
      window.location.href = "/"
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Google sign-in failed"
      setError(msg)
    } finally {
      setPending("")
    }
  }

  function loginApple() {
    setError("Apple sign-in coming soon")
  }

  async function handleEmailLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending("email")
    setError("")
    try {
      const result = await withTimeout(
        signIn("credentials", { email, password, redirect: false }),
        LOGIN_TIMEOUT,
      )
      if (result?.error) { setError("Invalid email or password"); return }
      if (!result?.ok) { setError("Login failed"); return }
      window.location.href = "/"
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setPending("")
    }
  }

  async function handleSendOtp() {
    setPending("phone")
    setError("")
    try {
      const { sendPhoneOtp } = await import("@/app/actions/phone")
      const result = await withTimeout(sendPhoneOtp(sanitizePhone(phone)), LOGIN_TIMEOUT)
      if (result?.error) {
        setError(result.error)
      } else {
        setCodeSent(true)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send code")
    } finally {
      setPending("")
    }
  }

  async function handleVerifyOtp() {
    setPending("phone")
    setError("")
    try {
      const { verifyPhoneOtp } = await import("@/app/actions/phone")
      const result = await withTimeout(
        verifyPhoneOtp(sanitizePhone(phone), phoneCode.replace(/\D/g, ""), phoneName ? sanitizeName(phoneName) : undefined),
        LOGIN_TIMEOUT,
      )
      if (result?.error) {
        setError(result.error)
        return
      }
      if (result?.userId) {
        const r = await withTimeout(
          signIn("phone", { phone: sanitizePhone(phone), userId: result.userId, redirect: false }),
          LOGIN_TIMEOUT,
        )
        if (r?.error) { setError("Login failed"); return }
        window.location.href = "/"
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Verification failed")
    } finally {
      setPending("")
    }
  }

  function reset() {
    setView("main")
    setError("")
    setCodeSent(false)
    setPhone("")
    setPhoneCode("")
    setPhoneName("")
    setEmail("")
    setPassword("")
  }

  const isLoading = !!pending

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-black via-zinc-950 to-black px-5">

      <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[600px] -translate-x-1/2 rounded-full bg-violet-900/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 left-1/2 h-80 w-[600px] -translate-x-1/2 rounded-full bg-amber-900/10 blur-[120px]" />

      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            LikhaVerse
          </h1>
          <p className="mt-1.5 text-sm text-zinc-500">
            {view === "main" ? "Enter your universe" : "Continue your story"}
          </p>
        </div>

        <div
          className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-2xl"
          style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.03), 0 20px 60px -20px rgba(0,0,0,0.8)" }}
        >
          <div
            ref={contentRef}
            className="px-6 py-6"
            style={height ? { minHeight: height } : undefined}
          >
            {error && (
              <div className="mb-5 rounded-xl bg-red-500/10 px-4 py-2.5 text-center text-sm text-red-400 ring-1 ring-red-500/20">
                {error}
              </div>
            )}

            {view === "main" && (
              <div className="space-y-2.5">
                <button
                  onClick={loginGoogle}
                  disabled={isLoading}
                  className="group relative flex w-full items-center justify-center gap-3 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-zinc-900 transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
                >
                  <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  {pending === "google" ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent" />
                      Signing in...
                    </span>
                  ) : (
                    "Continue with Google"
                  )}
                </button>

                <button
                  onClick={loginApple}
                  disabled={isLoading}
                  className="group relative flex w-full items-center justify-center gap-3 rounded-xl border border-white/[0.12] bg-white/[0.04] px-4 py-3 text-sm font-medium text-zinc-200 transition-all duration-150 hover:scale-[1.02] hover:bg-white/[0.08] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
                >
                  <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  Continue with Apple
                </button>

                <button
                  onClick={() => { setView("phone"); setError("") }}
                  disabled={isLoading}
                  className="group relative flex w-full items-center justify-center gap-3 rounded-xl bg-purple-600 px-4 py-3 text-sm font-semibold text-white transition-all duration-150 hover:scale-[1.02] hover:bg-purple-500 active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
                >
                  <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Continue with Phone
                </button>

                <div className="flex items-center gap-3 py-2">
                  <div className="h-px flex-1 bg-white/[0.06]" />
                  <span className="text-xs text-zinc-600">or</span>
                  <div className="h-px flex-1 bg-white/[0.06]" />
                </div>

                <button
                  onClick={() => { setView("email"); setError("") }}
                  disabled={isLoading}
                  className="group relative flex w-full items-center justify-center gap-3 rounded-xl bg-white/[0.06] px-4 py-3 text-sm font-medium text-zinc-300 transition-all duration-150 hover:scale-[1.02] hover:bg-white/[0.1] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
                >
                  <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 001.183 1.981l6.478 3.488m8.839 2.51l-4.66-2.51m0 0l-1.023-.55a2.25 2.25 0 00-2.134 0l-1.022.55m0 0l-4.661 2.51m16.5 1.615a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V8.844a2.25 2.25 0 011.183-1.98l7.5-4.04a2.25 2.25 0 012.134 0l7.5 4.04a2.25 2.25 0 011.183 1.98V19.5z" />
                  </svg>
                  Continue with Email
                </button>
              </div>
            )}

            {view === "email" && (
              <form onSubmit={handleEmailLogin} className="space-y-3">
                <button type="button" onClick={reset} className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                  Back
                </button>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Email"
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-white/[0.2] focus:bg-white/[0.06] focus:outline-none"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Password"
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-white/[0.2] focus:bg-white/[0.06] focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-zinc-900 transition-all duration-150 hover:scale-[1.02] active:scale-[0.97] disabled:opacity-50 disabled:hover:scale-100"
                >
                  {pending === "email" ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent" />
                      Logging in...
                    </span>
                  ) : "Log In"}
                </button>
                <p className="text-center text-xs text-zinc-600">
                  No account?{" "}
                  <a href="/register" className="font-medium text-zinc-300 hover:text-white">
                    Register
                  </a>
                </p>
              </form>
            )}

            {view === "phone" && !codeSent && (
              <div className="space-y-3">
                <button type="button" onClick={reset} className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                  Back
                </button>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone number"
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-white/[0.2] focus:bg-white/[0.06] focus:outline-none"
                />
                <input
                  type="text"
                  value={phoneName}
                  onChange={(e) => setPhoneName(e.target.value)}
                  placeholder="Your name (optional)"
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-white/[0.2] focus:bg-white/[0.06] focus:outline-none"
                />
                <button
                  onClick={handleSendOtp}
                  disabled={isLoading || phone.length < 10}
                  className="w-full rounded-xl bg-purple-600 px-4 py-3 text-sm font-semibold text-white transition-all duration-150 hover:scale-[1.02] hover:bg-purple-500 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                >
                  {pending === "phone" ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Sending...
                    </span>
                  ) : "Send Code"}
                </button>
              </div>
            )}

            {view === "phone" && codeSent && (
              <div className="space-y-3">
                <button type="button" onClick={reset} className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                  Back
                </button>
                <p className="text-center text-xs text-zinc-500">
                  Code sent to <span className="text-zinc-300">{phone}</span>
                </p>
                <input
                  type="text"
                  value={phoneCode}
                  onChange={(e) => setPhoneCode(e.target.value)}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-center text-lg tracking-[0.3em] text-white placeholder-zinc-600 focus:border-white/[0.2] focus:bg-white/[0.06] focus:outline-none"
                />
                <button
                  onClick={handleVerifyOtp}
                  disabled={isLoading || phoneCode.length < 4}
                  className="w-full rounded-xl bg-purple-600 px-4 py-3 text-sm font-semibold text-white transition-all duration-150 hover:scale-[1.02] hover:bg-purple-500 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                >
                  {pending === "phone" ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Verifying...
                    </span>
                  ) : "Verify & Log In"}
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
