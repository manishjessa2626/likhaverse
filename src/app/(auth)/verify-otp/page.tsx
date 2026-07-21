"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { auth } from "@/lib/firebase"
import { signInWithCredential, PhoneAuthProvider } from "firebase/auth"

export default function VerifyOtpPage() {
  const router = useRouter()
  const [code, setCode] = useState(["", "", "", "", "", ""])
  const [pending, setPending] = useState(false)
  const [error, setError] = useState("")
  const [cooldown, setCooldown] = useState(30)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const mode = typeof window !== "undefined" ? sessionStorage.getItem("otp_mode") : null
  const email = typeof window !== "undefined" ? sessionStorage.getItem("otp_email") : null
  const phone = typeof window !== "undefined" ? sessionStorage.getItem("otp_phone") : null
  const verificationId = typeof window !== "undefined" ? sessionStorage.getItem("otp_verificationId") : null

  useEffect(() => {
    if (!mode) router.replace("/welcome")
  }, [mode, router])

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setInterval(() => setCooldown((c) => c - 1), 1000)
    return () => clearInterval(t)
  }, [cooldown])

  function handleChange(index: number, value: string) {
    if (value && !/^\d$/.test(value)) return
    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  async function handleVerify() {
    const fullCode = code.join("")
    if (fullCode.length !== 6) return
    setPending(true)
    setError("")

    try {
      if (mode === "email" && email) {
        const res = await fetch("/api/auth/email-otp/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, code: fullCode }),
        })
        const data = await res.json()
        if (data.error) { setError(data.error); return }

        const signInResult = await signIn("firebase", {
          userId: data.user.id,
          email: data.user.email,
          name: data.user.name,
          role: data.user.role,
          redirect: false,
        })
        if (signInResult?.error) { setError("Login failed"); return }
        sessionStorage.removeItem("otp_email")
        sessionStorage.removeItem("otp_mode")
        window.location.href = "/"
      } else if (mode === "phone" && phone && verificationId) {
        const credential = PhoneAuthProvider.credential(verificationId, fullCode)
        const result = await signInWithCredential(auth, credential)
        const idToken = await result.user.getIdToken()
        const res = await fetch("/api/auth/firebase/callback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken, provider: "phone" }),
        })
        const data = await res.json()
        if (data.error) { setError(data.error); return }

        const signInResult = await signIn("firebase", {
          userId: data.user.id,
          email: data.user.email,
          name: data.user.name,
          role: data.user.role,
          redirect: false,
        })
        if (signInResult?.error) { setError("Login failed"); return }
        sessionStorage.removeItem("otp_phone")
        sessionStorage.removeItem("otp_verificationId")
        sessionStorage.removeItem("otp_mode")
        window.location.href = "/"
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Verification failed")
    } finally {
      setPending(false)
    }
  }

  if (!mode) return null

  return (
    <div className="w-full max-w-sm rounded-xl bg-gradient-to-br from-blue-600 to-purple-700 p-8 shadow-lg">
      <Link href="/welcome" className="mb-4 inline-block text-sm text-white/70 hover:text-white">&larr; Back</Link>
      <h1 className="mb-2 text-2xl font-bold text-center text-amber-300">Verify Code</h1>
      <p className="mb-6 text-center text-sm text-white/70">
        Enter the code sent to<br />
        <span className="font-semibold text-white">{email || phone}</span>
      </p>

      {error && (
        <p className="mb-4 rounded-lg bg-red-900/60 px-3 py-2 text-sm text-red-200 text-center border border-red-700/50">{error}</p>
      )}

      <div className="flex justify-center gap-2 mb-6">
        {code.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className="h-12 w-12 rounded-lg border border-white/20 bg-white/10 text-center text-lg font-bold text-white focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
          />
        ))}
      </div>

      <button
        onClick={handleVerify}
        disabled={pending || code.join("").length !== 6}
        className="w-full rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-black hover:bg-amber-400 disabled:opacity-50 transition-colors"
      >
        {pending ? "Verifying..." : "Verify"}
      </button>

      {cooldown > 0 ? (
        <p className="mt-4 text-center text-xs text-white/50">Resend in {cooldown}s</p>
      ) : (
        <button
          onClick={() => {
            setCooldown(30)
            setError("")
            setCode(["", "", "", "", "", ""])
            inputRefs.current[0]?.focus()
          }}
          className="mt-4 w-full text-sm text-amber-300 hover:text-amber-200"
        >
          Resend Code
        </button>
      )}
    </div>
  )
}
