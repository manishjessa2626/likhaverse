import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { BookOpen, Clock, Bookmark, TrendingUp, BarChart3 } from "lucide-react"
import { BackButton } from "@/components/ui/BackButton"

export default async function ReaderHubPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login?callbackUrl=/reader-hub")
  }

  const [continueReading, saves, stats] = await Promise.all([
    prisma.readingProgress.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      take: 20,
      include: {
        story: {
          select: {
            id: true,
            title: true,
            cover: true,
            status: true,
            author: { select: { id: true, name: true } },
            _count: { select: { chapters: true } },
          },
        },
        chapter: { select: { id: true, title: true, number: true } },
      },
    }),
    prisma.save.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        story: {
          select: {
            id: true,
            title: true,
            cover: true,
            tags: true,
            status: true,
            wordCount: true,
            author: { select: { id: true, name: true, avatar: true } },
            _count: { select: { chapters: true, storyLikes: true } },
          },
        },
      },
    }),
    Promise.all([
      prisma.readingProgress.count({ where: { userId: session.user.id } }),
      prisma.save.count({ where: { userId: session.user.id } }),
      prisma.storyLike.count({ where: { userId: session.user.id } }),
    ]),
  ])

  const [storiesRead, savedCount, likedCount] = stats

  return (
    <div className="min-h-screen bg-black text-zinc-100">
      <div className="mx-auto max-w-5xl px-4 py-8">

        <BackButton className="mb-4 text-sm text-zinc-400 hover:text-white transition-colors inline-block" />

        <h1 className="mb-2 text-3xl font-bold text-white">Reader Hub</h1>
        <p className="mb-8 text-zinc-500">
          Welcome back, {session.user.name}
        </p>

        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Stories Read", value: storiesRead, icon: BookOpen, color: "from-blue-600 to-blue-800" },
            { label: "Saved", value: savedCount, icon: Bookmark, color: "from-amber-600 to-amber-800" },
            { label: "Liked", value: likedCount, icon: TrendingUp, color: "from-purple-600 to-purple-800" },
            { label: "Continue", value: continueReading.length, icon: Clock, color: "from-green-600 to-green-800" },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`rounded-xl bg-gradient-to-br ${stat.color} p-4 shadow-lg`}
            >
              <stat.icon size={20} className="mb-2 text-white/80" />
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-white/70">{stat.label}</p>
            </div>
          ))}
        </div>

        {continueReading.length > 0 && (
          <section className="mb-10">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={20} className="text-amber-500" />
                <h2 className="text-xl font-semibold text-zinc-200">Continue Reading</h2>
              </div>
              <Link
                href="/library"
                className="text-sm text-amber-500 hover:text-amber-400 transition-colors"
              >
                View all
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {continueReading.slice(0, 6).map((item) => (
                <Link
                  key={`${item.storyId}-${item.chapterId}`}
                  href={`/stories/${item.story.id}/chapter/${item.chapter.id}`}
                  className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 hover:border-zinc-700 hover:bg-zinc-900 transition-all group"
                >
                  <div className="flex h-16 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-zinc-800 text-lg font-bold text-zinc-500">
                    {item.story.cover ? (
                      <img
                        src={item.story.cover}
                        alt={item.story.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      item.story.title.charAt(0)
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-white group-hover:text-amber-400 transition-colors">
                      {item.story.title}
                    </p>
                    <p className="truncate text-sm text-zinc-500">
                      Ch. {item.chapter.number} &mdash; {item.chapter.title}
                    </p>
                    <p className="text-xs text-zinc-600">by {item.story.author.name}</p>
                  </div>
                  <BarChart3 size={16} className="shrink-0 text-zinc-600" />
                </Link>
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bookmark size={20} className="text-amber-500" />
              <h2 className="text-xl font-semibold text-zinc-200">
                Saved Stories
              </h2>
            </div>
            <Link
              href="/library"
              className="text-sm text-amber-500 hover:text-amber-400 transition-colors"
            >
              View library
            </Link>
          </div>

          {saves.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 py-16 text-zinc-600">
              <BookOpen size={48} className="mb-4" />
              <p className="mb-2 text-lg font-medium text-zinc-400">No saved stories yet</p>
              <p className="mb-6 text-sm">Start exploring and save stories you love</p>
              <Link
                href="/stories"
                className="rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-medium text-black hover:bg-amber-400 transition-colors"
              >
                Browse Stories
              </Link>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {saves.slice(0, 9).map((save) => (
                <Link
                  key={save.id}
                  href={`/stories/${save.story.id}`}
                  className="group rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 hover:border-zinc-700 transition-all"
                >
                  <div className="mb-3 flex gap-4">
                    <div className="flex h-20 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-zinc-800 text-lg font-bold text-zinc-500">
                      {save.story.cover ? (
                        <img
                          src={save.story.cover}
                          alt={save.story.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        save.story.title.charAt(0)
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-white group-hover:text-amber-400 transition-colors line-clamp-2">
                        {save.story.title}
                      </h3>
                      <p className="text-sm text-zinc-500">by {save.story.author.name}</p>
                      {save.story.tags && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {save.story.tags.split(",").slice(0, 2).map((t) => (
                            <span key={t} className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-500">
                              {t.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-zinc-600">
                    <span>{save.story._count.chapters} ch</span>
                    <span>{save.story.wordCount.toLocaleString()} words</span>
                    <span
                      className={`ml-auto ${
                        save.story.status === "COMPLETED" ? "text-green-500" : "text-amber-500"
                      }`}
                    >
                      {save.story.status === "COMPLETED" ? "Complete" : "Ongoing"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
