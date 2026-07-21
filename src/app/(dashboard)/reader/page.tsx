import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { BackButton } from "@/components/ui/BackButton"
import { StoryCard } from "@/components/stories/StoryCard"
import { getContinueReading } from "@/app/actions/reading"

export default async function ReaderDashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { premium: true },
  })

  const [saves, following, unreadCount, continueReading] = await Promise.all([
    prisma.save.findMany({
      where: { userId: session.user.id },
      include: {
        story: {
          include: {
            author: { select: { id: true, name: true, role: true } },
            _count: { select: { chapters: true, saves: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.follow.count({ where: { followerId: session.user.id } }),
    prisma.message.count({ where: { receiverId: session.user.id, read: false } }),
    getContinueReading(),
  ])

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-6">
        <BackButton fallbackHref="/" className="inline-block" />
      </div>
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-amber-700 dark:text-zinc-100">Reader Dashboard</h1>
            {user?.premium && (
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                Premium
              </span>
            )}
          </div>
          <p className="mt-1 text-zinc-500">Welcome, {session.user.name}!</p>
        </div>
        <div className="flex gap-2">
          {!user?.premium && (
            <Link href="/premium">
              <Button variant="secondary" size="sm">Upgrade</Button>
            </Link>
          )}
          {unreadCount > 0 && (
            <Link href="/author/messages">
              <Button variant="secondary" size="sm">
                Messages ({unreadCount})
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-3 gap-4">
        <div className="rounded-xl border bg-white p-4">
          <p className="text-2xl font-bold">{saves.length}</p>
          <p className="text-sm text-zinc-500">Saved Stories</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-2xl font-bold">{following}</p>
          <p className="text-sm text-zinc-500">Following</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-2xl font-bold">{unreadCount}</p>
          <p className="text-sm text-zinc-500">Unread Messages</p>
        </div>
      </div>

      {continueReading.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Continue Reading
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {continueReading.map((item) => (
              <Link
                key={item.id}
                href={`/stories/${item.storyId}/chapter/${item.chapterId}`}
                className="group rounded-xl border bg-white dark:bg-zinc-800 dark:border-zinc-700 p-4 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-amber-100 to-emerald-100 dark:from-amber-900 dark:to-emerald-900 flex items-center justify-center text-amber-700 dark:text-amber-300 font-bold">
                    {item.story.title.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-zinc-800 dark:text-zinc-100 truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      {item.story.title}
                    </p>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      by {item.story.author.name}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5">
                      Last Read: Episode {item.chapter.number} &mdash; {item.chapter.title}
                    </p>
                    <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                      Continue Reading
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 grid grid-cols-2 gap-4">
        <Link href="/reader/messages" className="rounded-xl border bg-white p-4 hover:shadow-md transition-shadow">
          <p className="font-semibold text-green-600">Send Message</p>
          <p className="text-xs text-zinc-400">Contact authors and readers</p>
        </Link>
        <Link href="/premium" className="rounded-xl border bg-white p-4 hover:shadow-md transition-shadow">
          <p className="font-semibold text-amber-600">Premium</p>
          <p className="text-xs text-zinc-400">{user?.premium ? "Manage your membership" : "Unlock more features"}</p>
        </Link>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">
          Saved Stories
          {saves.length > 0 && (
            <span className="ml-1 text-sm font-normal text-zinc-400">
              ({saves.length})
            </span>
          )}
        </h2>

        {saves.length === 0 ? (
          <div className="text-center py-12 text-zinc-400">
            <p>You haven&apos;t saved any stories yet.</p>
            <Link href="/stories" className="mt-2 inline-block text-blue-600 hover:underline">
              Browse stories
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {saves.filter(s => s.story?.author).map((save) => (
              <StoryCard key={save.id} story={save.story!} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
