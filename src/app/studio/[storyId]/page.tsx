import { redirect, notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { StudioDashboard } from "@/components/studio/StudioDashboard"

export default async function StoryStudioPage({
  params,
}: {
  params: Promise<{ storyId: string }>
}) {
  const { storyId } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    redirect("/login?callbackUrl=/studio")
  }

  const story = await prisma.story.findUnique({
    where: { id: storyId },
    select: {
      id: true,
      title: true,
      description: true,
      cover: true,
      tags: true,
      status: true,
      authorId: true,
    },
  })

  if (!story || story.authorId !== session.user.id) {
    notFound()
  }

  const [characters, worldEntries, environments, scenes, allStories] = await Promise.all([
    prisma.character.findMany({ where: { storyId } }),
    prisma.worldBuildingEntry.findMany({ where: { storyId } }),
    prisma.environmentStudio.findMany({
      where: { storyId },
      select: { id: true, name: true, mood: true, imageUrl: true },
    }),
    prisma.storyboardScene.findMany({
      where: { storyId },
      orderBy: { sceneNumber: "asc" },
      select: { id: true, title: true, sceneNumber: true },
    }),
    prisma.story.findMany({
      where: { authorId: session.user.id },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        cover: true,
        tags: true,
        status: true,
      },
    }),
  ])

  return (
    <StudioDashboard
      stories={allStories.map((s) => ({ id: s.id, title: s.title, cover: s.cover, tags: s.tags, status: s.status }))}
      activeStory={{ id: story.id, title: story.title, description: story.description, cover: story.cover, tags: story.tags }}
      characters={characters}
      worldEntries={worldEntries}
      environments={environments}
      scenes={scenes}
    />
  )
}
