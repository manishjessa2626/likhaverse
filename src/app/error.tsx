"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/Button"

export default function ErrorPage({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-16">
      <div className="max-w-md text-center space-y-6">
        <div className="text-6xl">!</div>
        <h1 className="text-2xl font-bold text-amber-700 dark:text-zinc-100">
          Something went wrong
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          An unexpected error occurred. Please try again.
        </p>
        {error.digest && (
          <p className="text-xs text-zinc-400 dark:text-zinc-500 font-mono">
            Error ID: {error.digest}
          </p>
        )}
        <Button onClick={() => unstable_retry()}>
          Try again
        </Button>
      </div>
    </div>
  )
}
