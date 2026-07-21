import { cache } from "react"
import { prisma } from "@/lib/prisma"
import { StoryCard } from "@/components/stories/StoryCard"
import { BackButton } from "@/components/ui/BackButton"
import { getCachedOrFetch } from "@/lib/cache"

export const metadata = { title: "Browse Stories — LikhaVerse" }

const getStories = cache(async (q?: string, author?: string) => {
  const cacheKey = `stories:${q ?? ""}:${author ?? ""}`
  return getCachedOrFetch(cacheKey, () =>
    prisma.story.findMany({
      where: {
        status: { in: ["PUBLISHED", "COMPLETED"] },
        ...(q
          ? {
              OR: [
                { title: { contains: q } },
                { tags: { contains: q } },
                { author: { name: { contains: q } } },
              ],
            }
          : {}),
        ...(author ? { author: { name: { contains: author } } } : {}),
      },
      orderBy: { viewCount: "desc" },
      take: 50,
      select: {
        id: true,
        title: true,
        description: true,
        tags: true,
        cover: true,
        wordCount: true,
        status: true,
        viewCount: true,
        createdAt: true,
        updatedAt: true,
        authorId: true,
        author: { select: { id: true, name: true, role: true } },
        _count: { select: { chapters: true, saves: true } },
      },
    }),
    30_000,
  )
})

export default async function StoriesPage(props: { searchParams?: Promise<{ q?: string; author?: string }> }) {
  const searchParams = await props.searchParams
  const q = searchParams?.q?.trim()
  const author = searchParams?.author?.trim()

  const stories = await getStories(q, author)

  const heading = q
    ? `Results for "${q}"`
    : author
      ? `Stories by ${author}`
      : "Browse Stories"

  const subtext = q || author
    ? `${stories.length} story${stories.length === 1 ? "" : "ies"} found`
    : "Discover new stories from talented writers."

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-indigo-50 via-white to-purple-50 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-900 overflow-hidden">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-purple-400/10 blur-3xl" />
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-blue-400/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-pink-400/10 blur-3xl" />
      </div>
      <div className="mx-auto max-w-5xl px-4 py-12 relative">
        <BackButton fallbackHref="/" className="mb-4 inline-block" />
        <h1 className="text-2xl font-bold text-amber-700 dark:text-zinc-100">{heading}</h1>
        <p className="mt-1 text-zinc-500 dark:text-zinc-400">{subtext}</p>

        {stories.length === 0 ? (
          <p className="mt-12 text-center text-zinc-400">
            {q
              ? `No stories match "${q}". Try a different search term.`
              : "No stories published yet. Be the first!"}
          </p>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {stories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
