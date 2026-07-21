import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { BackButton } from "@/components/ui/BackButton"
import { ProfileTabs } from "@/components/profile/ProfileTabs"
import { FollowButton } from "@/components/stories/FollowButton"
import { ProfileMessages } from "@/components/profile/ProfileMessages"

const userSelect = {
  id: true,
  name: true,
  email: true,
  bio: true,
  avatar: true,
  role: true,
  createdAt: true,
  premium: true,
} as const

const storyInclude = {
  _count: { select: { chapters: true, saves: true } },
} as const

function mapStory(s: {
  id: string
  title: string
  cover: string | null
  description: string | null
  tags: string | null
  status: string
  viewCount: number
  createdAt: Date
  updatedAt: Date
  _count: { chapters: number; saves: number }
}) {
  return {
    id: s.id,
    title: s.title,
    cover: s.cover,
    description: s.description,
    tags: s.tags,
    status: s.status,
    viewCount: s.viewCount,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
    _count: { chapters: s._count.chapters, saves: s._count.saves },
  }
}

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const profileId = (await params).id
  const session = await getServerSession(authOptions)

  if (!session?.user) redirect("/")

  const user = await prisma.user.findUnique({
    where: { id: profileId },
    select: userSelect,
  })

  if (!user) notFound()

  const isOwner = session?.user?.id === profileId

  const isSuperAdmin = user.role === "SUPER_ADMIN"
  const canWrite = isSuperAdmin || ["AUTHOR", "PREMIUM_CREATOR", "ADMIN"].includes(user.role)
  const canFilm = isSuperAdmin || (user.premium && ["PREMIUM_CREATOR"].includes(user.role))

  const [allPublished, followerCount, followingCount, profilePosts] = await Promise.all([
    prisma.story.findMany({
      where: { authorId: profileId, status: { in: ["PUBLISHED", "COMPLETED"] } },
      orderBy: { updatedAt: "desc" },
      include: storyInclude,
    }),
    prisma.follow.count({ where: { followingId: profileId } }),
    prisma.follow.count({ where: { followerId: profileId } }),
    prisma.post.findMany({
      where: { userId: profileId },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        likes: { select: { userId: true } },
        saves: { select: { userId: true } },
        comments: {
          take: 2,
          orderBy: { createdAt: "desc" },
          include: { user: { select: { id: true, name: true, avatar: true } } },
        },
        _count: { select: { likes: true, comments: true, saves: true } },
      },
    }),
  ])

  const published = allPublished.map(mapStory)

  const profilePostsData = profilePosts.map(({ likes, saves, ...rest }) => ({
    ...rest,
    isLiked: likes.some((l) => l.userId === session.user.id),
    isSaved: saves.some((s) => s.userId === session.user.id),
  }))

  let drafts: ReturnType<typeof mapStory>[] = []
  let continueReading: Array<{
    storyId: string
    chapterId: string
    scrollPosition: number | null
    updatedAt: string
    story: { id: string; title: string; cover: string | null; author: { id: string; name: string }; _count: { chapters: number } }
    chapter: { id: string; title: string; number: number }
  }> = []
  let savedStories: Array<{
    id: string
    storyId: string
    savedAt: string
    story: {
      id: string
      title: string
      cover: string | null
      tags: string | null
      status: string
      wordCount: number
      author: { id: string; name: string; avatar: string | null }
      _count: { chapters: number; storyLikes: number }
    }
  }> = []

  if (isOwner) {
    const [rawDrafts, rawContinueReading, rawSaves] = await Promise.all([
      prisma.story.findMany({
        where: { authorId: profileId, status: "DRAFT" },
        orderBy: { updatedAt: "desc" },
        include: storyInclude,
      }),
      prisma.readingProgress.findMany({
        where: { userId: profileId },
        orderBy: { updatedAt: "desc" },
        take: 10,
        include: {
          story: {
            select: {
              id: true,
              title: true,
              cover: true,
              author: { select: { id: true, name: true } },
              _count: { select: { chapters: true } },
            },
          },
          chapter: { select: { id: true, title: true, number: true } },
        },
      }),
      prisma.save.findMany({
        where: { userId: profileId },
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
    ])

    drafts = rawDrafts.map(mapStory)
    continueReading = rawContinueReading.map((r) => ({
      storyId: r.storyId,
      chapterId: r.chapterId,
      scrollPosition: r.scrollPosition,
      updatedAt: r.updatedAt.toISOString(),
      story: r.story,
      chapter: r.chapter,
    }))
    savedStories = rawSaves.map((s) => ({
      id: s.id,
      storyId: s.storyId,
      savedAt: s.createdAt.toISOString(),
      story: s.story,
    }))
  }

  return (
    <main className="min-h-screen bg-black">
      <div className="mx-auto max-w-2xl px-4 pt-6 pb-16">
        <BackButton className="mb-4 text-sm text-zinc-400 hover:text-white transition-colors inline-block" />
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-600 to-purple-700 text-3xl font-bold text-white ring-4 ring-zinc-800">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>
            {user.premium && (
              <span className="absolute -bottom-1 -right-1 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-black ring-2 ring-black">
                PRO
              </span>
            )}
          </div>

          <h1 className="mt-4 text-xl font-bold text-zinc-100">{user.name}</h1>
          <p className="text-sm text-zinc-500 capitalize">{user.role.toLowerCase().replace(/_/g, " ")}</p>

          <div className="mt-5 flex items-center justify-center gap-8 text-center">
            <div>
              <p className="text-lg font-bold text-zinc-100">{published.length + (isOwner ? drafts.length : 0)}</p>
              <p className="text-xs text-zinc-500">Stories</p>
            </div>
            <div>
              <p className="text-lg font-bold text-zinc-100">{followerCount}</p>
              <p className="text-xs text-zinc-500">Followers</p>
            </div>
            <div>
              <p className="text-lg font-bold text-zinc-100">{followingCount}</p>
              <p className="text-xs text-zinc-500">Following</p>
            </div>
          </div>

          {user.bio && (
            <p className="mt-4 text-sm text-zinc-400 max-w-sm leading-relaxed">{user.bio}</p>
          )}

          {!isOwner && session?.user && (
            <div className="mt-5 flex items-center gap-3">
              <FollowButton authorId={user.id} />
              <ProfileMessages
                isOwner={false}
                profileUserId={profileId}
                profileName={user.name}
                compact
              />
            </div>
          )}
          {isOwner && (
            <div className="mt-5 flex items-center justify-center gap-3">
              <Link
                href="/settings/edit"
                className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
              >
                Edit Profile
              </Link>
            </div>
          )}
        </div>

        <div className="mt-8">
          <ProfileTabs
            isOwner={isOwner}
            profileUserId={profileId}
            userName={user.name}
            userBio={user.bio}
            userEmail={user.email}
            joinedAt={user.createdAt.toISOString()}
            stories={{ published, drafts: isOwner ? drafts : undefined }}
            continueReading={isOwner ? continueReading : undefined}
            savedStories={isOwner ? savedStories : undefined}
            canWrite={canWrite}
            canFilm={canFilm}
            userRole={user.role}
            profilePosts={profilePostsData}
          />
        </div>
      </div>
    </main>
  )
}
