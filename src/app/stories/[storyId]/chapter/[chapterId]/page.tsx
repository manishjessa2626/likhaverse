import { notFound, redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { checkEpisodeAccess } from "@/lib/episode-access"
import { ChapterReactions } from "./ChapterReactions"
import { CommentSection } from "../../CommentSection"
import { ChapterHeader } from "@/components/reader/ChapterHeader"
import { ChapterNavigation } from "@/components/reader/ChapterNavigation"
import { EpisodeListDrawer } from "@/components/reader/EpisodeListDrawer"
import { PremiumTransition } from "@/components/reader/PremiumTransition"
import { PremiumReaderLayout } from "@/components/reader/PremiumReaderLayout"
import { ReaderContent } from "@/components/reader/ReaderContent"
import { ReaderAccessOverlay } from "./ReaderAccessOverlay"
import { LockedChapterOverlay } from "@/components/reader/LockedChapterOverlay"
import { ReaderAmbience } from "@/components/reader/ReaderAmbience"
import { ReaderCompanion } from "@/components/reader/ReaderCompanion"
import { isSaved } from "@/app/actions/saves"

export async function generateMetadata({ params }: { params: Promise<{ storyId: string; chapterId: string }> }) {
  const { chapterId } = await params
  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    include: { story: { select: { title: true } } },
  })
  if (!chapter) return { title: "Chapter Not Found" }
  return { title: `${chapter.title} — ${chapter.story.title}` }
}

export default async function ChapterPage({ params }: { params: Promise<{ storyId: string; chapterId: string }> }) {
  const { storyId, chapterId } = await params
  const session = await getServerSession(authOptions)

  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    include: {
      story: {
        select: {
          id: true,
          title: true,
          tags: true,
          freePreviewChapters: true,
          accessType: true,
          authorId: true,
          author: { select: { id: true, name: true } },
          _count: { select: { chapters: true } },
          chapters: {
            orderBy: { number: "asc" },
            select: { id: true, number: true, title: true },
          },
        },
      },
    },
  })

  if (!chapter || chapter.storyId !== storyId) notFound()

  const isAuthor = session?.user?.id === chapter.story.authorId
  const story = chapter.story
  const chapterIndex = story.chapters.findIndex((c) => c.id === chapterId)
  const isFree = story.accessType === "FREE" || (story.accessType !== "PREMIUM" && chapterIndex < story.freePreviewChapters)

  let isPremium = false
  let bypassAll = false
  let userAccessFields: {
    isVIP: boolean
    premium: boolean
    role: string
    dailyEpisodesRead: number
    lastReadReset: Date | null
    lastEpisodeUnlockTime: Date | null
  } | null = null
  let accessRestricted: { reason: "DAILY_LIMIT" | "WAIT_TIMER" | null; nextUnlockTime: Date | null } | null = null
  let hasCoinUnlock = false
  let walletBalance = 0

  if (session?.user && !isAuthor) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, premium: true, role: true, isVIP: true, dailyEpisodesRead: true, lastReadReset: true, lastEpisodeUnlockTime: true, walletBalance: true },
    })
    if (user) {
      isPremium = user.premium
      bypassAll = (user.role === "SUPER_ADMIN")
      walletBalance = user.walletBalance
      userAccessFields = {
        isVIP: user.isVIP,
        premium: user.premium,
        role: user.role,
        dailyEpisodesRead: user.dailyEpisodesRead,
        lastReadReset: user.lastReadReset,
        lastEpisodeUnlockTime: user.lastEpisodeUnlockTime,
      }
    }
  }

  const canAccess = isAuthor || isFree || isPremium || bypassAll

  if (!canAccess && session?.user) {
    const unlock = await prisma.chapterUnlock.findUnique({
      where: { userId_chapterId: { userId: session.user.id, chapterId } },
    })
    if (unlock) hasCoinUnlock = true
  }

  const isUnlocked = canAccess || hasCoinUnlock

  if (isUnlocked && !isPremium && !isAuthor && !bypassAll && userAccessFields) {
    const access = checkEpisodeAccess(userAccessFields, chapter.number)
    if (!access.allowed) {
      accessRestricted = {
        reason: access.reason ?? null,
        nextUnlockTime: userAccessFields.lastEpisodeUnlockTime,
      }
    }
  }

  if (!isUnlocked) {
    if (story.accessType === "PREMIUM") {
      redirect("/premium")
    } else if (!session?.user) {
      redirect("/login?redirect=/stories/" + storyId)
    }
  }

  const [storyCharacters, worldEntries] = await Promise.all([
    prisma.character.findMany({
      where: { storyId },
      select: { id: true, name: true, age: true, gender: true, personality: true, appearance: true, species: true, background: true, imageUrl: true },
    }),
    prisma.worldBuildingEntry.findMany({
      where: { storyId, type: { in: ["location", "kingdom", "city", "village", "dungeon", "realm", "continent", "region", "landmark"] } },
      select: { id: true, type: true, title: true, content: true, metadata: true, imageUrl: true },
    }),
  ])

  const prevChapter = chapter.story.chapters[chapterIndex - 1] ?? null
  const nextChapter = chapter.story.chapters[chapterIndex + 1] ?? null

  const totalChapters = story._count.chapters
  const isLastFreeChapter = !isAuthor && !isPremium && !bypassAll &&
    story.accessType !== "FREE" && chapterIndex === story.freePreviewChapters - 1 &&
    nextChapter !== null

  const remainingChapters = nextChapter ? totalChapters - chapterIndex - 1 : 0

  let initialSaved = false
  if (session?.user) {
    initialSaved = await isSaved(storyId)
  }

  const showLockedOverlay = !isUnlocked && !!session?.user && story.accessType !== "PREMIUM"

  return (
    <PremiumReaderLayout
      storyId={storyId}
      storyTitle={story.title}
      chapterId={chapterId}
      initialSaved={initialSaved}
    >
      {accessRestricted && (
        <ReaderAccessOverlay
          reason={accessRestricted.reason}
          nextUnlockTime={accessRestricted.nextUnlockTime}
          chapterNumber={chapter.number}
          storyId={storyId}
        />
      )}
      {showLockedOverlay && (
        <LockedChapterOverlay
          storyId={storyId}
          chapterId={chapterId}
          chapterTitle={chapter.title}
          coinCost={chapter.coinCost}
          balance={walletBalance}
          isPremium={isPremium}
          onUnlocked={() => {}}
        />
      )}
      {!showLockedOverlay && (
        <>
          <ChapterHeader
            storyTitle={story.title}
            chapterNumber={chapter.number}
            totalChapters={totalChapters}
            chapterTitle={chapter.title}
            wordCount={chapter.wordCount}
          />

          {isUnlocked ? (
            <ReaderContent content={chapter.content} />
          ) : (
            <p className="text-sm text-zinc-500 text-center py-20">
              This chapter is locked. Upgrade to premium to continue reading.
            </p>
          )}

          <ChapterReactions chapterId={chapter.id} />

          <div className="mt-12" style={{ borderTop: "1px solid #EAEAEA" }}>
            <h2 className="mb-6 mt-8 text-base font-semibold" style={{ color: "#2C2C2C" }}>Comments</h2>
            <CommentSection storyId={storyId} chapterId={chapterId} />
          </div>

          {isLastFreeChapter && nextChapter ? (
            <PremiumTransition
              storyId={storyId}
              nextChapterNumber={nextChapter.number}
              nextChapterTitle={nextChapter.title}
              remainingChapters={remainingChapters}
            />
          ) : (
            <ChapterNavigation
              storyId={storyId}
              prevChapter={prevChapter}
              nextChapter={nextChapter}
              isLastFreeChapter={isLastFreeChapter}
            />
          )}

          <ReaderAmbience tags={story.tags} />
          <ReaderCompanion
            characters={storyCharacters}
            worldEntries={worldEntries}
            storyTitle={story.title}
          />
        </>
      )}
    </PremiumReaderLayout>
  )
}
