"use client"

import { useEffect, useState } from "react"

export default function ChapterError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const [trace, setTrace] = useState("")

  useEffect(() => {
    setTrace(error.stack ?? error.message)
    console.error("[ChapterPage Error]", error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-16 bg-white">
      <div className="max-w-2xl w-full space-y-6">
        <div className="text-6xl text-center">!</div>
        <h1 className="text-2xl font-bold text-red-700 text-center">
          Something went wrong
        </h1>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 font-mono text-xs text-red-800 whitespace-pre-wrap break-all">
          <p className="font-bold mb-2">Error: {error.name}</p>
          <p className="mb-2">{error.message}</p>
          {error.digest && <p className="mb-2">Digest: {error.digest}</p>}
          {trace && <details><summary className="cursor-pointer font-bold mb-1">Stack Trace</summary><pre className="mt-2 text-[10px] leading-relaxed">{trace}</pre></details>}
        </div>
        <div className="flex justify-center gap-3">
          <button
            onClick={() => reset()}
            className="rounded-lg bg-red-600 px-6 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Try again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-zinc-200 px-6 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-300"
          >
            Reload page
          </button>
        </div>
      </div>
    </div>
  )
}
