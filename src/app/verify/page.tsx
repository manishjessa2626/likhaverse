"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { sendVerificationCode, confirmVerificationCode, getVerificationStatus } from "@/app/actions/verify"
import { Button } from "@/components/ui/Button"
import { BackButton } from "@/components/ui/BackButton"

export default function VerifyPage() {
  const router = useRouter()
  const [step, setStep] = useState<"loading" | "send" | "confirm" | "done">("loading")
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [sending, setSending] = useState(false)
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    getVerificationStatus().then((status) => {
      if (!status) {
        router.push("/login")
        return
      }
      setEmail(status.email ?? "")
      if (status.emailVerified) {
        setStep("done")
      } else {
        setStep("send")
      }
    })
  }, [router])

  async function handleSend() {
    setSending(true)
    setError("")
    setMessage("")
    const result = await sendVerificationCode()
    if (result.error) {
      setError(result.error)
    } else {
      setMessage(result.message)
      setStep("confirm")
    }
    setSending(false)
  }

  async function handleConfirm() {
    setConfirming(true)
    setError("")
    setMessage("")
    const result = await confirmVerificationCode(code)
    if (result.error) {
      setError(result.error)
    } else {
      setMessage(result.message)
      setStep("done")
    }
    setConfirming(false)
  }

  if (step === "loading") {
    return (
      <div className="mx-auto max-w-sm px-4 py-24 text-center text-zinc-400">
        Loading...
      </div>
    )
  }

  if (step === "done") {
    return (
      <div className="mx-auto max-w-sm px-4 py-24 text-center">
        <div className="rounded-xl border bg-white p-8 shadow-sm">
          <div className="text-4xl mb-4">✅</div>
          <h1 className="text-xl font-bold text-amber-700 dark:text-zinc-100">Email Verified</h1>
          <p className="mt-2 text-sm text-zinc-500">{email}</p>
          <div className="mt-6">
            <Button onClick={() => router.push("/")}>Go Home</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-24">
      <div className="rounded-xl border bg-white p-8 shadow-sm">
        <BackButton fallbackHref="/login" className="mb-4 inline-block" />
        <h1 className="text-xl font-bold text-center text-amber-700 dark:text-zinc-100">Verify Your Email</h1>
        <p className="mt-2 text-center text-sm text-zinc-500">{email}</p>

        {error && (
          <p className="mt-4 text-sm text-red-600 text-center">{error}</p>
        )}
        {message && (
          <p className="mt-4 text-sm text-green-600 text-center">{message}</p>
        )}

        {step === "send" && (
          <div className="mt-6 text-center">
            <p className="text-sm text-zinc-600 mb-4">
              You need to verify your email to access all features.
            </p>
            <Button onClick={handleSend} disabled={sending}>
              {sending ? "Sending..." : "Send Verification Code"}
            </Button>
          </div>
        )}

        {step === "confirm" && (
          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Enter 6-digit code
              </label>
              <input
                type="text"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                className="block w-full rounded-lg border px-3 py-2 text-lg text-center tracking-[8px] focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <Button
              onClick={handleConfirm}
              disabled={confirming || code.length !== 6}
              className="w-full"
            >
              {confirming ? "Verifying..." : "Confirm Code"}
            </Button>
            <p className="text-center text-xs text-zinc-400">
              Didn&apos;t get it?{" "}
              <button
                onClick={handleSend}
                className="text-blue-600 hover:underline"
              >
                Resend
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
