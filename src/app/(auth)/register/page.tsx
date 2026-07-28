"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim())
}

function isValidPassword(s: string): string | null {
  if (s.length < 8) return "Password must be at least 8 characters"
  if (!/[A-Z]/.test(s)) return "Password must contain an uppercase letter"
  if (!/[a-z]/.test(s)) return "Password must contain a lowercase letter"
  if (!/[0-9]/.test(s)) return "Password must contain a number"
  return null
}

function isValidUsername(s: string): boolean {
  return /^[a-z0-9_]{3,30}$/i.test(s.trim())
}

export default function RegisterPage() {
  const router = useRouter()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [pending, setPending] = useState(false)

  function validate(): boolean {
    const errs: Record<string, string> = {}

    if (!firstName.trim()) errs.firstName = "First name is required"
    if (!lastName.trim()) errs.lastName = "Last name is required"

    if (!username.trim()) {
      errs.username = "Username is required"
    } else if (!isValidUsername(username)) {
      errs.username = "3–30 characters, letters, numbers, underscores"
    }

    if (!email.trim()) {
      errs.email = "Email is required"
    } else if (!isValidEmail(email)) {
      errs.email = "Invalid email format"
    }

    const pwErr = isValidPassword(password)
    if (pwErr) errs.password = pwErr

    if (!confirmPassword) {
      errs.confirmPassword = "Confirm your password"
    } else if (password !== confirmPassword) {
      errs.confirmPassword = "Passwords do not match"
    }

    if (!acceptTerms) errs.terms = "You must accept the terms"

    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!validate()) return

    setPending(true)

    try {
      const { createUserWithEmailAndPassword, sendEmailVerification } = await import("firebase/auth")
      const { auth } = await import("@/lib/firebase")

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim().toLowerCase(),
        password,
      )

      const firebaseUid = userCredential.user.uid

      await sendEmailVerification(userCredential.user, {
        url: `${window.location.origin}/auth/verify-email`,
        handleCodeInApp: false,
      })

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firebaseUid,
          email: email.trim().toLowerCase(),
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          username: username.trim().toLowerCase(),
        }),
      })

      const data = await res.json()

      if (data.error) {
        setError(data.error)
        return
      }

      router.push(`/auth/check-email?email=${encodeURIComponent(email.trim())}`)
    } catch (err: unknown) {
      const firebaseErr = err as { code?: string; message?: string }
      if (firebaseErr.code === "auth/email-already-in-use") {
        setError("This email is already registered. Try logging in instead.")
      } else if (firebaseErr.code === "auth/weak-password") {
        setError("Password is too weak. Use at least 8 characters.")
      } else if (firebaseErr.code === "auth/invalid-email") {
        setError("Invalid email format.")
      } else if (firebaseErr.code === "auth/too-many-requests") {
        setError("Too many attempts. Please wait a moment and try again.")
      } else if (firebaseErr.code === "auth/network-request-failed") {
        setError("Network error. Check your connection and try again.")
      } else {
        setError(firebaseErr.message || "Registration failed. Please try again.")
      }
    } finally {
      setPending(false)
    }
  }

  function Field({ name, label, type, value, onChange, placeholder, autoComplete }: {
    name: string; label: string; type: string; value: string; onChange: (v: string) => void; placeholder?: string; autoComplete?: string
  }) {
    return (
      <div>
        <label htmlFor={name} className="block text-sm font-medium text-zinc-300 mb-1">{label}</label>
        <input id={name} type={type} value={value}
          onChange={(e) => { onChange(e.target.value); setFieldErrors((p) => ({ ...p, [name]: "" })) }}
          placeholder={placeholder} autoComplete={autoComplete}
          className={`w-full rounded-xl border bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-zinc-600 transition-colors focus:outline-none ${
            fieldErrors[name] ? "border-red-500/50 focus:border-red-400" : "border-white/[0.08] focus:border-white/[0.2] focus:bg-white/[0.06]"
          }`} />
        {fieldErrors[name] && <p className="mt-1 text-xs text-red-400">{fieldErrors[name]}</p>}
      </div>
    )
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

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Field name="firstName" label="First Name" type="text" value={firstName} onChange={setFirstName}
                  placeholder="Juan" autoComplete="given-name" />
                <Field name="lastName" label="Last Name" type="text" value={lastName} onChange={setLastName}
                  placeholder="Dela Cruz" autoComplete="family-name" />
              </div>

              <Field name="username" label="Username" type="text" value={username} onChange={setUsername}
                placeholder="juandelacruz" autoComplete="username" />

              <Field name="email" label="Email" type="email" value={email} onChange={setEmail}
                placeholder="juan@email.com" autoComplete="email" />

              <Field name="password" label="Password" type="password" value={password} onChange={setPassword}
                placeholder="At least 8 characters" autoComplete="new-password" />

              <Field name="confirmPassword" label="Confirm Password" type="password" value={confirmPassword} onChange={setConfirmPassword}
                placeholder="Repeat your password" autoComplete="new-password" />

              <div className="pt-1">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" checked={acceptTerms}
                    onChange={(e) => { setAcceptTerms(e.target.checked); setFieldErrors((p) => ({ ...p, terms: "" })) }}
                    className="mt-0.5 h-4 w-4 rounded border-white/[0.08] bg-white/[0.04] text-purple-600 focus:ring-purple-500" />
                  <span className="text-xs text-zinc-500">
                    I accept the{" "}
                    <a href="/terms" className="text-purple-400 hover:text-purple-300 underline">Terms of Service</a>{" "}
                    and{" "}
                    <a href="/privacy" className="text-purple-400 hover:text-purple-300 underline">Privacy Policy</a>
                  </span>
                </label>
                {fieldErrors.terms && <p className="mt-1 text-xs text-red-400">{fieldErrors.terms}</p>}
              </div>

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

            <p className="mt-5 text-center text-xs text-zinc-600">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-zinc-300 transition-colors hover:text-white">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
