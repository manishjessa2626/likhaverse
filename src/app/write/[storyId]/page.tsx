import { redirect, notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { StoryEditor } from "./StoryEditor"

export default async function StoryEditorPage({
  params,
}: {
  params: Promise<{ storyId: string }>
}) {
  const { storyId } = await params
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login?callbackUrl=/write/" + storyId)
  }

  const story = await prisma.story.findUnique({
    where: { id: storyId },
    include: {
      chapters: { orderBy: { number: "asc" } },
      seasons: { orderBy: { number: "asc" } },
      characters: { orderBy: { createdAt: "asc" } },
      _count: { select: { saves: true, comments: true } },
    },
  })

  if (!story || story.authorId !== session.user.id) {
    notFound()
  }

  return <StoryEditor story={story} />
}
