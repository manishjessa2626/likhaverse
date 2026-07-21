import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { BackButton } from "@/components/ui/BackButton"
import { AuthorStoryList } from "@/components/author/AuthorStoryList"

export default async function AuthorDashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session || !["AUTHOR", "PREMIUM_CREATOR", "ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    redirect("/login")
  }

  const [stories, followersCount, totalViews, unreadCount, charactersCount] = await Promise.all([
    prisma.story.findMany({
      where: { authorId: session.user.id },
      orderBy: { updatedAt: "desc" },
      include: {
        _count: { select: { chapters: true, saves: true } },
      },
    }),
    prisma.follow.count({ where: { followingId: session.user.id } }),
    prisma.story.aggregate({
      where: { authorId: session.user.id },
      _sum: { viewCount: true },
    }),
    prisma.message.count({ where: { receiverId: session.user.id, read: false } }),
    prisma.character.count({ where: { authorId: session.user.id } }),
  ])

  const premium = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { premium: true },
  })

  const publishedCount = stories.filter((s) => s.status === "PUBLISHED" || s.status === "COMPLETED").length
  const draftCount = stories.filter((s) => s.status === "DRAFT").length
  const totalViewsCount = totalViews._sum.viewCount ?? 0

  const serializedStories = stories.map((s) => ({
    ...s,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
    completedAt: s.completedAt?.toISOString() ?? null,
  }))

  return (
    <main className="min-h-screen bg-black">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <BackButton className="mb-4 text-sm text-zinc-400 hover:text-white transition-colors" />
        {/* === Header === */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-zinc-100">Writer Hub</h1>
              {premium?.premium && (
                <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-medium text-amber-400 border border-amber-500/30">
                  Premium
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-zinc-500">Welcome back, {session.user.name}</p>
          </div>
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <Link href="/author/messages">
                <Button variant="secondary" size="sm" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                  Messages ({unreadCount})
                </Button>
              </Link>
            )}
            <Link href="/author/stories/new">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 text-sm rounded-lg">
                <svg className="w-4 h-4 mr-1.5 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                New Story
              </Button>
            </Link>
          </div>
        </div>

        {/* === Stats Grid === */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
          {[
            { label: "Total Stories", value: stories.length, color: "from-blue-600 to-blue-800" },
            { label: "Published", value: publishedCount, color: "from-green-600 to-green-800" },
            { label: "Drafts", value: draftCount, color: "from-zinc-500 to-zinc-700" },
            { label: "Total Views", value: totalViewsCount.toLocaleString(), color: "from-purple-600 to-purple-800" },
            { label: "Followers", value: followersCount, color: "from-amber-600 to-amber-800" },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`rounded-xl bg-gradient-to-br ${stat.color} p-4 shadow-lg`}
            >
              <p className="text-xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-white/70 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* === Tool Cards === */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <Link
            href="/author/ai"
            className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 hover:bg-zinc-800 transition-colors group"
          >
            <p className="text-sm font-semibold text-blue-400 group-hover:text-blue-300">AI Tools</p>
            <p className="text-xs text-zinc-600 mt-1">{charactersCount} characters created</p>
          </Link>
          <Link
            href="/author/studio"
            className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 hover:bg-zinc-800 transition-colors group"
          >
            <p className="text-sm font-semibold text-purple-400 group-hover:text-purple-300">Cinematic Studio</p>
            <p className="text-xs text-zinc-600 mt-1">Apply for adaptation</p>
          </Link>
          <Link
            href="/author/messages"
            className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 hover:bg-zinc-800 transition-colors group"
          >
            <p className="text-sm font-semibold text-green-400 group-hover:text-green-300">Messages</p>
            <p className="text-xs text-zinc-600 mt-1">
              {unreadCount > 0 ? `${unreadCount} unread` : "No new messages"}
            </p>
          </Link>
        </div>

        {/* === Story List with Draft/Published Tabs === */}
        <AuthorStoryList stories={serializedStories} />
      </div>
    </main>
  )
}
