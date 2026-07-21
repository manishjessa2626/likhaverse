import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getGenerationCredits } from "@/app/actions/ai"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { BackButton } from "@/components/ui/BackButton"

const TYPE_LABELS: Record<string, string> = {
  COVER: "Covers", CHARACTER: "Characters", SCENE: "Scenes",
  ENVIRONMENT: "Environments", OBJECT: "Objects",
}

export default async function AIHubPage() {
  const session = await getServerSession(authOptions)
  if (!session || !["AUTHOR", "PREMIUM_CREATOR", "SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
    redirect("/login")
  }

  const [credits, characters, generations, stories] = await Promise.all([
    getGenerationCredits(),
    prisma.character.count({ where: { authorId: session.user.id } }),
    prisma.aIGeneration.count({ where: { userId: session.user.id } }),
    prisma.story.findMany({
      where: { authorId: session.user.id },
      select: { id: true, title: true },
      orderBy: { updatedAt: "desc" },
    }),
  ])

  const bypasses = credits && credits.limit === -1

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <BackButton fallbackHref="/author" className="mb-4 inline-block" />
      <h1 className="text-2xl font-bold text-amber-700 dark:text-zinc-100">AI Tools</h1>
      <p className="mt-1 text-zinc-500">Generate characters, covers, and more with AI.</p>

      <div className="mt-6 rounded-xl border bg-white p-4">
        <h2 className="text-sm font-medium text-zinc-500">AI Creative Credits</h2>
        {bypasses ? (
          <p className="mt-1 text-lg font-bold text-green-600">Unlimited Access</p>
        ) : credits?.byType ? (
          <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {Object.entries(credits.byType).map(([type, data]) => (
              <div key={type} className="rounded-lg bg-zinc-50 p-3 text-center">
                <p className="text-xs font-medium text-zinc-500">{TYPE_LABELS[type] ?? type}</p>
                <p className="mt-0.5 text-lg font-bold">
                  {data.limit === -1 ? "∞" : `${Math.max(0, data.limit - data.used)}`}
                </p>
                <p className="text-xs text-zinc-400">/ {data.limit === -1 ? "∞" : data.limit} left</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-1 text-2xl font-bold">
            {credits?.remaining ?? 0} / {credits?.limit ?? 0}
          </p>
        )}
        {credits && credits.limit > 0 && (
          <div className="mt-3 h-2 w-full rounded-full bg-zinc-200">
            <div
              className="h-2 rounded-full bg-blue-500 transition-all"
              style={{ width: `${Math.min(100, (credits.used / credits.limit) * 100)}%` }}
            />
          </div>
        )}
        {credits?.resetsAt && (
          <p className="mt-2 text-xs text-zinc-400">
            Resets {new Date(credits.resetsAt).toLocaleDateString()}
          </p>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="rounded-xl border bg-white p-4">
          <p className="text-2xl font-bold">{characters}</p>
          <p className="text-sm text-zinc-500">Characters Created</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-2xl font-bold">{generations}</p>
          <p className="text-sm text-zinc-500">Total AI Generations</p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Link
          href="/author/ai/character"
          className="rounded-xl border bg-white p-6 hover:shadow-md transition-shadow"
        >
          <h2 className="text-lg font-semibold text-blue-600">Character Generator</h2>
          <p className="mt-2 text-sm text-zinc-500">
            Build detailed character portraits with AI image generation. Define personality, appearance, clothing and more.
          </p>
        </Link>
        <Link
          href="/author/ai/cover"
          className="rounded-xl border bg-white p-6 hover:shadow-md transition-shadow"
        >
          <h2 className="text-lg font-semibold text-blue-600">Cover Art Generator</h2>
          <p className="mt-2 text-sm text-zinc-500">
            Create stunning book cover art using AI. Choose from 8 art styles or let AI decide.
          </p>
        </Link>
        <Link
          href="/author/ai/history"
          className="rounded-xl border bg-white p-6 hover:shadow-md transition-shadow"
        >
          <h2 className="text-lg font-semibold text-blue-600">Generation History</h2>
          <p className="mt-2 text-sm text-zinc-500">
            View all past AI generations with image previews, styles, and status information.
          </p>
        </Link>
      </div>

      {stories.length === 0 && (
        <div className="mt-8 rounded-xl border-2 border-dashed p-8 text-center text-zinc-400">
          <p>Create a story first to start generating content.</p>
          <Link href="/author/stories/new">
            <Button className="mt-3">Create Story</Button>
          </Link>
        </div>
      )}
    </div>
  )
}
