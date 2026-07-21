"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { auth } from "@/lib/firebase"
import { GoogleAuthProvider, signInWithPopup, FacebookAuthProvider, signInWithPhoneNumber, RecaptchaVerifier } from "firebase/auth"

export default function WelcomePage() {
  const router = useRouter()
  const [pending, setPending] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [emailMode, setEmailMode] = useState(false)
  const [phoneMode, setPhoneMode] = useState(false)

  async function handleGoogle() {
    setPending("google")
    setError("")
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const idToken = await result.user.getIdToken()
      const res = await fetch("/api/auth/firebase/callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, provider: "google" }),
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
      window.location.href = "/"
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Google sign-in failed")
    } finally {
      setPending(null)
    }
  }

  async function handleFacebook() {
    setPending("facebook")
    setError("")
    try {
      const provider = new FacebookAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const idToken = await result.user.getIdToken()
      const res = await fetch("/api/auth/firebase/callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, provider: "facebook" }),
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
      window.location.href = "/"
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Facebook sign-in failed")
    } finally {
      setPending(null)
    }
  }

  async function handleEmailOtp() {
    if (!email.trim()) return
    setPending("email")
    setError("")
    try {
      const res = await fetch("/api/auth/email-otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json()
      if (data.error) { setError(data.error); return }
      sessionStorage.setItem("otp_email", email.trim())
      sessionStorage.setItem("otp_mode", "email")
      router.push("/verify-otp")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send code")
    } finally {
      setPending(null)
    }
  }

  async function handlePhoneOtp() {
    if (!phone.trim()) return
    setPending("phone")
    setError("")
    try {
      const verifier = new RecaptchaVerifier(auth, "recaptcha-container", { size: "invisible" })
      const confirmation = await signInWithPhoneNumber(auth, phone.trim(), verifier)
      sessionStorage.setItem("otp_phone", phone.trim())
      sessionStorage.setItem("otp_verificationId", confirmation.verificationId)
      sessionStorage.setItem("otp_mode", "phone")
      router.push("/verify-otp")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send code")
    } finally {
      setPending(null)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-800 px-4">
      <div id="recaptcha-container" />
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <img src="/logo.png" alt="LikhaVerse" className="mx-auto mb-2 h-16 w-auto" />
          <h1 className="text-2xl font-bold text-amber-300">Welcome to LikhaVerse</h1>
          <p className="mt-1 text-sm text-zinc-400">Sign up or log in to continue</p>
        </div>

        {error && (
          <p className="rounded-lg bg-red-900/60 px-3 py-2 text-sm text-red-200 text-center border border-red-700/50">{error}</p>
        )}

        {!emailMode && !phoneMode && (
          <div className="space-y-3">
            <button
              onClick={handleGoogle}
              disabled={!!pending}
              className="flex w-full items-center justify-center gap-3 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-zinc-800 hover:bg-zinc-100 disabled:opacity-50 transition-colors"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              {pending === "google" ? "Signing in..." : "Continue with Google"}
            </button>

            <button
              onClick={handleFacebook}
              disabled={!!pending}
              className="flex w-full items-center justify-center gap-3 rounded-lg bg-[#1877F2] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#166fe5] disabled:opacity-50 transition-colors"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              {pending === "facebook" ? "Signing in..." : "Continue with Facebook"}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-700" /></div>
              <div className="relative flex justify-center text-xs"><span className="bg-zinc-900 px-2 text-zinc-500">or</span></div>
            </div>

            <button
              onClick={() => setEmailMode(true)}
              disabled={!!pending}
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm font-semibold text-zinc-200 hover:bg-zinc-700 disabled:opacity-50 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              Continue with Email
            </button>

            <button
              onClick={() => setPhoneMode(true)}
              disabled={!!pending}
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm font-semibold text-zinc-200 hover:bg-zinc-700 disabled:opacity-50 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              Continue with Phone
            </button>

            <p className="text-center text-xs text-zinc-500">
              Already have an account?{" "}
              <Link href="/login" className="text-amber-400 hover:underline font-medium">Log in</Link>
            </p>
          </div>
        )}

        {emailMode && (
          <div className="space-y-4">
            <button onClick={() => setEmailMode(false)} className="text-sm text-zinc-400 hover:text-zinc-200">&larr; Back</button>
            <div>
              <label className="block text-sm font-semibold text-zinc-300">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="mt-1 block w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <button
              onClick={handleEmailOtp}
              disabled={!!pending || !email.trim()}
              className="w-full rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-black hover:bg-amber-400 disabled:opacity-50 transition-colors"
            >
              {pending === "email" ? "Sending..." : "Send Code"}
            </button>
          </div>
        )}

        {phoneMode && (
          <div className="space-y-4">
            <button onClick={() => setPhoneMode(false)} className="text-sm text-zinc-400 hover:text-zinc-200">&larr; Back</button>
            <div>
              <label className="block text-sm font-semibold text-zinc-300">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1234567890"
                className="mt-1 block w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <button
              onClick={handlePhoneOtp}
              disabled={!!pending || !phone.trim()}
              className="w-full rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-black hover:bg-amber-400 disabled:opacity-50 transition-colors"
            >
              {pending === "phone" ? "Sending..." : "Send Code"}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
