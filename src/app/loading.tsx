export default function LoadingPage() {
  return (
    <div className="min-h-screen bg-[#D4C5F0] dark:bg-zinc-950 animate-fadeIn">
      {/* Hero skeleton */}
      <div className="relative flex min-h-[85vh] items-center justify-center bg-gradient-to-br from-violet-950 via-[#2a1f4e] to-indigo-950">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="mx-auto mb-6 h-5 w-48 rounded-full bg-white/10" />
          <div className="mx-auto mb-4 h-14 w-64 rounded-lg bg-white/10" />
          <div className="mx-auto mb-8 h-6 w-96 max-w-full rounded bg-white/10" />
          <div className="flex items-center justify-center gap-4">
            <div className="h-12 w-36 rounded-xl bg-white/10" />
            <div className="h-12 w-36 rounded-xl border border-white/10" />
          </div>
        </div>
      </div>
      {/* Content skeleton */}
      <div className="mx-auto max-w-7xl px-4 py-8 space-y-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-4">
            <div className="h-5 w-32 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="overflow-hidden rounded-2xl bg-white/60 dark:bg-zinc-800/60 border border-purple-200/40 dark:border-zinc-700/40">
                  <div className="h-44 bg-zinc-200 dark:bg-zinc-700" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 w-3/4 rounded bg-zinc-200 dark:bg-zinc-700" />
                    <div className="h-3 w-1/2 rounded bg-zinc-200 dark:bg-zinc-700" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
