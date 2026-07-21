"use client"

import { useEffect, useState } from "react"
import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { getLinkedProviders, unlinkProvider } from "@/app/actions/accounts"
import { sendPhoneOtp, verifyPhoneOtp } from "@/app/actions/phone"
import { BackButton } from "@/components/ui/BackButton"

type LinkedAccount = {
  id: string
  provider: string
  providerId: string
  createdAt: string
}

const providerLabels: Record<string, string> = {
  google: "Google",
  apple: "Apple",
  phone: "Phone",
  email: "Email & Password",
}

const providerIcons: Record<string, string> = {
  google: "G",
  apple: "A",
  phone: "📱",
  email: "✉️",
}

export default function AccountsSettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [accounts, setAccounts] = useState<LinkedAccount[]>([])
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [pending, setPending] = useState<string | null>(null)

  const [phone, setPhone] = useState("")
  const [phoneCode, setPhoneCode] = useState("")
  const [codeSent, setCodeSent] = useState(false)
  const [phonePending, setPhonePending] = useState(false)
  const [linkingProvider, setLinkingProvider] = useState<string | null>(null)
  const [showPhoneForm, setShowPhoneForm] = useState(false)

  async function handleLinkOAuth(provider: string) {
    setLinkingProvider(provider)
    try {
      await signIn(provider, { callbackUrl: "/settings/accounts" })
    } finally {
      setLinkingProvider(null)
    }
  }

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }
    if (status === "authenticated") {
      getLinkedProviders().then(setAccounts)
    }
  }, [status, router])

  async function handleUnlink(accountId: string, provider: string) {
    setPending(accountId)
    setError("")
    setMessage("")
    const result = await unlinkProvider(accountId)
    if (result?.error) {
      setError(result.error)
    } else {
      setMessage(result.message ?? "Account unlinked")
      setAccounts((prev) => prev.filter((a) => a.id !== accountId))
    }
    setPending(null)
  }

  function sanitizePhone(input: string): string {
    return input.replace(/[^+\d\s\-()]/g, "").trim()
  }

  async function handleSendOtp() {
    setPhonePending(true)
    setError("")
    const result = await sendPhoneOtp(sanitizePhone(phone))
    if (result?.error) {
      setError(result.error)
    } else {
      setCodeSent(true)
    }
    setPhonePending(false)
  }

  async function handleVerifyOtp() {
    setPhonePending(true)
    setError("")
    const result = await verifyPhoneOtp(sanitizePhone(phone), phoneCode.replace(/\D/g, ""))
    if (result?.error) {
      setError(result.error)
      setPhonePending(false)
      return
    }
    setMessage("Phone linked!")
    setShowPhoneForm(false)
    setPhone("")
    setPhoneCode("")
    setCodeSent(false)
    getLinkedProviders().then(setAccounts)
    setPhonePending(false)
  }

  const linkedProviders = accounts.map((a) => a.provider)

  const canLinkGoogle = !linkedProviders.includes("google")
  const canLinkApple = !linkedProviders.includes("apple")
  const canLinkPhone = !linkedProviders.includes("phone")

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center text-zinc-400">
        Loading...
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <BackButton fallbackHref="/" className="mb-4 inline-block" />
      <h1 className="text-2xl font-bold text-amber-700 dark:text-zinc-100">Linked Accounts</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Manage how you sign in to LikhaVerse
      </p>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>
      )}
      {message && (
        <p className="mt-4 rounded-lg bg-green-50 px-4 py-2 text-sm text-green-600">{message}</p>
      )}

      <div className="mt-6 space-y-3">
        {accounts.map((account) => (
          <div
            key={account.id}
            className="flex items-center justify-between rounded-xl border bg-white px-4 py-3 dark:bg-zinc-900 dark:border-zinc-700"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-sm font-bold dark:bg-zinc-800">
                {providerIcons[account.provider] ?? "?"}
              </span>
              <div>
                <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  {providerLabels[account.provider] ?? account.provider}
                </p>
                <p className="text-xs text-zinc-400">
                  {account.provider === "phone" ? account.providerId : `Linked ${new Date(account.createdAt).toLocaleDateString()}`}
                </p>
              </div>
            </div>
              <button
                onClick={() => handleUnlink(account.id, account.provider)}
                disabled={pending === account.id || accounts.length <= 1}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-30 dark:hover:bg-red-900/20"
              >
                {pending === account.id ? (
                  <span className="flex items-center gap-1">
                    <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Unlinking
                  </span>
                ) : "Unlink"}
              </button>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Link another account</h2>
        <div className="mt-3 space-y-2">
          {canLinkGoogle && (
            <button
              onClick={() => handleLinkOAuth("google")}
              disabled={!!linkingProvider}
              className="flex w-full items-center justify-center gap-3 rounded-xl border bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              {linkingProvider === "google" ? (
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-zinc-600 border-t-transparent" />
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )}
              {linkingProvider === "google" ? "Linking..." : "Link Google"}
            </button>
          )}
          {canLinkApple && (
            <button
              onClick={() => handleLinkOAuth("apple")}
              disabled={!!linkingProvider}
              className="flex w-full items-center justify-center gap-3 rounded-xl border bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              {linkingProvider === "apple" ? (
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-zinc-600 border-t-transparent" />
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
              )}
              {linkingProvider === "apple" ? "Linking..." : "Link Apple"}
            </button>
          )}
          {canLinkPhone && !showPhoneForm && (
            <button
              onClick={() => setShowPhoneForm(true)}
              className="flex w-full items-center justify-center gap-3 rounded-xl border bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              <span className="text-lg">📱</span>
              Link Phone
            </button>
          )}
          {canLinkPhone && showPhoneForm && (
            <div className="rounded-xl border bg-white p-4 space-y-3 dark:bg-zinc-900 dark:border-zinc-700">
              {!codeSent ? (
                <>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1234567890"
                    className="block w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:bg-zinc-800 dark:border-zinc-600"
                  />
                  <button
                    onClick={handleSendOtp}
                    disabled={phonePending || phone.length < 10}
                    className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {phonePending ? "Sending..." : "Send Code"}
                  </button>
                </>
              ) : (
                <>
                  <p className="text-sm text-zinc-500 text-center">
                    Code sent to <span className="font-medium text-zinc-700 dark:text-zinc-300">{phone}</span>
                  </p>
                  <input
                    type="text"
                    value={phoneCode}
                    onChange={(e) => setPhoneCode(e.target.value)}
                    placeholder="000000"
                    maxLength={6}
                    className="block w-full rounded-lg border px-3 py-2 text-lg text-center tracking-widest focus:border-blue-500 focus:outline-none dark:bg-zinc-800 dark:border-zinc-600"
                  />
                  <button
                    onClick={handleVerifyOtp}
                    disabled={phonePending || phoneCode.length < 4}
                    className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {phonePending ? "Verifying..." : "Verify & Link"}
                  </button>
                  <button
                    onClick={() => { setShowPhoneForm(false); setCodeSent(false); setPhone(""); setPhoneCode("") }}
                    className="w-full text-sm text-zinc-400 hover:text-zinc-600"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
