"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function VerifyEmailPage() {
  const router = useRouter()

  useEffect(() => {
    async function handleVerification() {
      try {
        const { auth } = await import("@/lib/firebase")
        const { onAuthStateChanged } = await import("firebase/auth")

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (user) {
            await user.reload()
            if (user.emailVerified) {
              const idTokenResult = await user.getIdTokenResult()
              const firebaseUid = user.uid

              await fetch("/api/auth/verify-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ firebaseUid }),
              })

              unsubscribe()
              router.replace("/auth/verified")
            }
          }
        })

        setTimeout(() => {
          unsubscribe()
          router.replace("/auth/verified")
        }, 10000)
      } catch {
        router.replace("/login")
      }
    }

    handleVerification()
  }, [router])

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-black via-zinc-950 to-black px-5">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-violet-400 border-t-transparent" />
        <p className="text-sm text-zinc-400">Verifying your email...</p>
      </div>
    </div>
  )
}
