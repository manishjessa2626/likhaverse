import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { StoryActions } from "./StoryActions"
import { CommentSection } from "./CommentSection"
import { ChapterList } from "./ChapterList"
import { LikeButton } from "@/components/stories/LikeButton"
import { FollowButton } from "@/components/stories/FollowButton"
import Link from "next/link"
import { BackButton } from "@/components/ui/BackButton"
import { Mail } from "lucide-react"

export async function generateMetadata({ params }: { params: Promise<{ storyId: string }> }) {
  const { storyId } = await params
  const story = await prisma.story.findUnique({ where: { id: storyId } })
  if (!story) return { title: "Story Not Found" }
  return { title: `${story.title} — LikhaVerse`, description: story.description }
}

export default async function StoryDetailPage({ params }: { params: Promise<{ storyId: string }> }) {
  const { storyId } = await params
  const session = await getServerSession(authOptions)

  const story = await prisma.story.findUnique({
    where: { id: storyId },
    include: {
      author: { select: { id: true, name: true, avatar: true, bio: true, role: true } },
      chapters: { orderBy: { number: "asc" }, select: { id: true, title: true, number: true, createdAt: true } },
      _count: { select: { saves: true, comments: true, chapters: true } },
      seasons: { orderBy: { number: "asc" }, include: { _count: { select: { chapters: true } } } },
      characters: { orderBy: { createdAt: "asc" } },
    },
  })

  if (!story || (story.status === "DRAFT" && story.authorId !== session?.user?.id)) {
    notFound()
  }

  const isAuthor = session?.user?.id === story.authorId
  const canReadAll = !!session?.user
  const isFounder = story.author.role === "SUPER_ADMIN"

  let isPremium = false
  if (session?.user) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { premium: true },
    })
    isPremium = user?.premium ?? false
  }

  const storyWithAccess = story as typeof story & { accessType?: string; original?: boolean }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <BackButton fallbackHref="/stories" className="mb-6 inline-block" />
      <div className="flex gap-8">
        <div className="w-48 shrink-0">
          <div className="aspect-[3/4] rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-zinc-400">
            {story.cover ? (
              <img src={story.cover} alt={story.title} className="h-full w-full object-cover rounded-xl" />
            ) : (
              <span className="text-4xl">{story.title.charAt(0)}</span>
            )}
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-3xl font-bold text-amber-700 dark:text-zinc-100">{story.title}</h1>
                {storyWithAccess.original && (
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                    🎬 LikhaVerse Original
                  </span>
                )}
                {story.studioBadge && (
                  <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700">
                    Studio Pick
                  </span>
                )}
                {story.completedBadge && (
                  <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                    Completed
                  </span>
                )}
              </div>
              <p className="mt-1 text-zinc-500">
                by{" "}
                <Link href={"#"} className="text-blue-600 hover:underline">
                  {story.author.name}
                </Link>
                {isFounder && <span className="ml-1.5" title="Founder">👑 Founder</span>}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <LikeButton storyId={story.id} />
              {session?.user?.id !== story.author.id && (
                <>
                  <FollowButton authorId={story.author.id} />
                  <Link
                    href={`/profile/${story.author.id}`}
                    className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-700 hover:text-green-400 transition-colors"
                  >
                    <Mail size={14} />
                    Message
                  </Link>
                </>
              )}
              <StoryActions storyId={story.id} />
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {story.tags?.split(",").map((tag) => (
              <span key={tag} className="rounded-md bg-zinc-100 px-2.5 py-1 text-xs text-zinc-600">
                {tag.trim()}
              </span>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-4 text-sm text-zinc-500">
            <span>{story._count.chapters} chapters</span>
            <span>{story.wordCount.toLocaleString()} words</span>
            <span>{story.viewCount} views</span>
            <span>{story._count.saves} saves</span>
            <span>{story._count.comments} comments</span>
            {storyWithAccess.accessType === "PREMIUM" && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">Premium</span>
            )}
            {storyWithAccess.accessType === "FREEMIUM" && (
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">Freemium</span>
            )}
            {storyWithAccess.accessType === "FREE" && (
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Free</span>
            )}
          </div>

          {story.description && (
            <p className="mt-4 text-zinc-700 leading-relaxed">{story.description}</p>
          )}

          <div className="mt-6 flex items-center gap-3">
            {story.author.bio && (
              <p className="text-sm text-zinc-400 italic">&ldquo;{story.author.bio}&rdquo;</p>
            )}
          </div>

          <ChapterList
            storyId={story.id}
            chapters={story.chapters}
            freePreviewChapters={story.freePreviewChapters}
            canReadAll={canReadAll}
            isAuthor={isAuthor}
            accessType={storyWithAccess.accessType || "FREEMIUM"}
            isPremium={isPremium}
          />
        </div>
      </div>

      {story.characters.length > 0 && (
        <div className="mt-12 border-t pt-8">
          <h2 className="text-xl font-semibold mb-6 text-amber-600 dark:text-zinc-100">
            Characters ({story.characters.length})
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {story.characters.map((char) => (
              <div key={char.id} className="rounded-xl border bg-white dark:bg-zinc-800 p-4">
                <div className="flex items-start gap-4">
                  {char.imageUrl ? (
                    <img src={char.imageUrl} alt={char.name} className="h-16 w-16 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-purple-100 text-lg font-bold text-blue-600">
                      {char.name.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="font-semibold text-zinc-800 dark:text-zinc-100">{char.name}</h3>
                    <p className="text-xs text-zinc-500">
                      {[char.age, char.gender, char.species].filter(Boolean).join(" · ") || "Character"}
                    </p>
                  </div>
                </div>
                {char.personality && (
                  <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-3">{char.personality}</p>
                )}
                {char.background && (
                  <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-500 italic line-clamp-2">{char.background}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-12 border-t pt-8">
        <h2 className="text-xl font-semibold mb-6 text-amber-600 dark:text-zinc-100">Comments</h2>
        <CommentSection storyId={story.id} />
      </div>
    </div>
  )
}
