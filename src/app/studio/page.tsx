import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { BookOpen, BarChart3, ChevronRight, Plus } from "lucide-react"

export default async function StudioLibrary() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    redirect("/login?callbackUrl=/studio")
  }

  const stories = await prisma.story.findMany({
    where: { authorId: session.user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { chapters: true } },
      chapters: {
        orderBy: { number: "desc" },
        take: 1,
        select: { number: true },
      },
    },
  })

  // If user has exactly one story, jump straight to its workspace
  if (stories.length === 1) {
    redirect(`/studio/${stories[0].id}`)
  }

  return (
    <div className="min-h-screen bg-[#D4C5F0] dark:bg-zinc-950 transition-colors duration-300">
      {/* Header */}
      <div className="border-b border-purple-200/60 bg-white/70 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900/90">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">Your Stories</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Every project is its own universe</p>
          </div>
          <Link
            href="/write"
            className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-sm font-bold text-white hover:bg-purple-500 transition-colors"
          >
            <Plus size={16} /> New Story
          </Link>
        </div>
      </div>

      {/* Story Grid */}
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {stories.map((story) => {
            const totalCh = story._count.chapters
            const progress = 0 // placeholder — could compute from unlocks
            const tag = story.tags?.split(",")[0]?.trim() ?? ""

            return (
              <Link
                key={story.id}
                href={`/studio/${story.id}`}
                className="group relative overflow-hidden rounded-2xl border border-purple-200/60 bg-white/70 shadow-sm transition-all hover:shadow-lg hover:-translate-y-0.5 dark:border-zinc-700/60 dark:bg-zinc-800/70"
              >
                {/* Animated cover area */}
                <div className="relative h-36 overflow-hidden bg-gradient-to-br from-violet-700 via-purple-800 to-indigo-900">
                  {story.cover && (
                    <img src={story.cover} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/5 blur-2xl group-hover:scale-150 transition-transform duration-700" />
                  <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-white/5 blur-xl" />

                  <div className="relative flex h-full flex-col justify-end p-4">
                    {tag && (
                      <span className="mb-1 w-fit rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white backdrop-blur-sm">
                        {tag}
                      </span>
                    )}
                    <h3 className="text-lg font-bold text-white drop-shadow-lg">{story.title}</h3>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <p className="text-xs text-zinc-500 line-clamp-2 dark:text-zinc-400">
                    {story.description || "No synopsis yet"}
                  </p>

                  {/* Progress bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-[10px] text-zinc-400 dark:text-zinc-500">
                      <span>{totalCh} chapters</span>
                      <span>{progress === 0 ? "In progress" : `${progress}% complete`}</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                      <div
                        className="h-full rounded-full bg-purple-500 transition-all duration-500"
                        style={{ width: `${Math.max(5, progress)}%` }}
                      />
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                      {story.status || "DRAFT"}
                    </span>
                    <ChevronRight size={14} className="text-zinc-300 group-hover:text-purple-500 transition-colors dark:text-zinc-600" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Empty state */}
        {stories.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <BookOpen size={48} className="text-zinc-300 mb-4 dark:text-zinc-600" />
            <h2 className="text-lg font-semibold text-zinc-700 dark:text-zinc-300">No stories yet</h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Create a story to open its universe.</p>
            <Link
              href="/write"
              className="mt-4 rounded-xl bg-purple-600 px-6 py-3 text-sm font-bold text-white hover:bg-purple-500 transition-colors"
            >
              Create Your First Story
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
