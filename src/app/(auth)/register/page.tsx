"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

function isValidEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim())
}

const inp = "w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-white/[0.2] focus:bg-white/[0.06] focus:outline-none"

export default function RegisterPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [acceptTerms, setAcceptTerms] = useState(true)
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)

  function validate(): boolean {
    if (!firstName.trim()) { setError("Please enter your first name"); return false }
    if (!lastName.trim()) { setError("Please enter your last name"); return false }
    if (!username.trim() || !/^[a-z0-9_]{3,30}$/i.test(username.trim())) { setError("Username must be 3-30 characters (letters, numbers, _)"); return false }
    if (!email.trim() || !isValidEmail(email)) { setError("Please enter a valid email"); return false }
    if (password.length < 8) { setError("Password must be at least 8 characters"); return false }
    if (password !== confirmPassword) { setError("Passwords do not match"); return false }
    if (!acceptTerms) { setError("Please accept the Terms of Service"); return false }
    return true
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (!validate()) return
    setPending(true)
    try {
      const { createUserWithEmailAndPassword, sendEmailVerification } = await import("firebase/auth")
      const { auth } = await import("@/lib/firebase")
      const cred = await createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), password)
      await sendEmailVerification(cred.user, { url: `${location.origin}/auth/verify-email`, handleCodeInApp: false })
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firebaseUid: cred.user.uid, email: email.trim().toLowerCase(),
          firstName: firstName.trim(), lastName: lastName.trim(), username: username.trim().toLowerCase(),
        }),
      })
      const d = await res.json()
      if (d.error) { setError(d.error); return }
      router.push(`/auth/check-email?email=${encodeURIComponent(email.trim())}`)
    } catch (x: any) {
      const m: Record<string, string> = {
        "auth/email-already-in-use": "Email already registered",
        "auth/weak-password": "Password too weak",
      }
      setError(m[x.code] || x.message || "Failed")
    } finally { setPending(false) }
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-black via-zinc-950 to-black px-5">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[600px] -translate-x-1/2 rounded-full bg-violet-900/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 left-1/2 h-80 w-[600px] -translate-x-1/2 rounded-full bg-amber-900/10 blur-[120px]" />

      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white">LikhaVerse</h1>
          <p className="mt-1.5 text-sm text-zinc-500">Create your account</p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-2xl"
          style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.03), 0 20px 60px -20px rgba(0,0,0,0.8)" }}>
          <div className="px-6 py-6">
            {error && (
              <div className="mb-5 rounded-xl bg-red-500/10 px-4 py-2.5 text-center text-sm text-red-400 ring-1 ring-red-500/20">
                {error}
              </div>
            )}

            {!mounted ? (
              <div className="flex items-center justify-center py-16">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-600 border-t-amber-500" />
              </div>
            ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)}
                required placeholder="First name" className={inp} />
              <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)}
                required placeholder="Last name" className={inp} />
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                required placeholder="Username" className={inp} />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                required placeholder="Email" className={inp} />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                required placeholder="Password (min 8 characters)" className={inp} />
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                required placeholder="Confirm password" className={inp} />

              <label className="flex items-start gap-2 cursor-pointer pt-1">
                <input type="checkbox" checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-white/[0.08] bg-white/[0.04] text-purple-600 focus:ring-purple-500" />
                <span className="text-xs text-zinc-500">
                  I accept the{" "}
                  <a href="/terms" className="text-purple-400 hover:text-purple-300 underline">Terms of Service</a>{" "}
                  and{" "}
                  <a href="/privacy" className="text-purple-400 hover:text-purple-300 underline">Privacy Policy</a>
                </span>
              </label>

              <button type="submit" disabled={pending}
                className="mt-2 w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-zinc-900 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100">
                {pending ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent" />
                    Creating account...
                  </span>
                ) : "Create Account"}
              </button>
            </form>
            )}

            <p className="mt-5 text-center text-xs text-zinc-600">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-zinc-300 hover:text-white">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
