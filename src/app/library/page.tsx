import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { canAccessWritingTools, canAccessStudio } from "@/lib/permissions"
import { LibraryClient } from "./LibraryClient"

export const dynamic = "force-dynamic"

export default async function LibraryPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/")
  const userId = session.user.id
  const role = session.user.role ?? "READER"

  const canWrite = canAccessWritingTools(role)
  const canUseStudio = canAccessStudio(role)

  const [
    continueReading,
    saves,
    reminders,
    authoredStories,
  ] = await Promise.all([
    prisma.readingProgress.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: 20,
      include: {
        story: {
          select: {
            id: true, title: true, cover: true,
            author: { select: { id: true, name: true } },
            _count: { select: { chapters: true } },
          },
        },
        chapter: { select: { id: true, title: true, number: true } },
      },
    }),
    prisma.save.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        story: {
          select: {
            id: true, title: true, cover: true, tags: true, status: true, wordCount: true,
            author: { select: { id: true, name: true } },
            _count: { select: { chapters: true, storyLikes: true, saves: true } },
          },
        },
      },
    }),
    prisma.storyReminder.findMany({
      where: { userId, enabled: true },
      include: {
        story: {
          select: { id: true, title: true, cover: true, author: { select: { name: true } } },
        },
      },
    }),
    canWrite
      ? prisma.story.findMany({
          where: { authorId: userId },
          orderBy: { updatedAt: "desc" },
          include: {
            _count: { select: { chapters: true, saves: true } },
            author: { select: { id: true, name: true, avatar: true } },
          },
        })
      : Promise.resolve([]),
  ])

  const data = {
    userId,
    role,
    canWrite,
    canUseStudio,
    continueReading: continueReading.map((r) => ({
      storyId: r.storyId,
      chapterId: r.chapterId,
      story: r.story,
      chapter: r.chapter,
    })),
    saves: saves.map((s) => ({ id: s.id, storyId: s.storyId, story: s.story })),
    reminders: reminders.map((r) => ({ storyId: r.storyId, story: r.story })),
    authoredStories: authoredStories.map((s) => ({
      id: s.id,
      title: s.title,
      cover: s.cover,
      status: s.status,
      viewCount: s.viewCount,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
      _count: { chapters: s._count.chapters, saves: s._count.saves },
      author: { id: s.author.id, name: s.author.name, avatar: s.author.avatar },
    })),
  }

  return <LibraryClient data={data} />
}
