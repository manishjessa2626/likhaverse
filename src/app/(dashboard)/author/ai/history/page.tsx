import { getAIHistory } from "@/app/actions/ai"
import { BackButton } from "@/components/ui/BackButton"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function AIHistoryPage() {
  const session = await getServerSession(authOptions)
  if (!session || !["AUTHOR", "PREMIUM_CREATOR", "SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
    redirect("/login")
  }

  const history = await getAIHistory()

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <BackButton fallbackHref="/author/ai" className="mb-4 inline-block" />
      <h1 className="text-2xl font-bold text-amber-700 dark:text-zinc-100">Generation History</h1>
      <p className="mt-1 text-zinc-500">Your past AI generations.</p>

      {history.length === 0 ? (
        <p className="mt-8 text-zinc-400">No generations yet.</p>
      ) : (
        <div className="mt-6 space-y-3">
          {history.map((gen) => (
            <div key={gen.id} className="flex items-center gap-4 rounded-xl border bg-white p-4">
              {gen.imageUrl && (
                <img src={gen.imageUrl} alt="" className="h-16 w-16 flex-shrink-0 rounded-lg object-cover" />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">{gen.type}</span>
                  {gen.status === "FAILED" ? (
                    <span className="rounded bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-700">Failed</span>
                  ) : gen.status === "PROCESSING" ? (
                    <span className="rounded bg-yellow-100 px-1.5 py-0.5 text-xs font-medium text-yellow-700">Processing</span>
                  ) : (
                    <span className="rounded bg-green-100 px-1.5 py-0.5 text-xs font-medium text-green-700">Completed</span>
                  )}
                </div>
                <p className="mt-0.5 truncate text-sm text-zinc-700">{gen.prompt}</p>
                <div className="mt-1 flex items-center gap-3 text-xs text-zinc-400">
                  {gen.story && <span>Story: {gen.story.title}</span>}
                  {gen.durationMs && <span>{(gen.durationMs / 1000).toFixed(1)}s</span>}
                  <span>{new Date(gen.createdAt).toLocaleDateString()}</span>
                </div>
                {gen.errorMessage && (
                  <p className="mt-1 text-xs text-red-500">{gen.errorMessage}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
