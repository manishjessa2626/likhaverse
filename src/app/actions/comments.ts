"use server"

import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { createNotification } from "@/lib/notifications"

const CommentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(2000).trim(),
})

export async function addComment(
  storyId: string,
  chapterId: string | null,
  prevState: unknown,
  formData: FormData
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return { error: null, message: "Please log in to comment" }

  const validated = CommentSchema.safeParse({
    content: formData.get("content"),
  })

  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors, message: "" }
  }

  try {
    const comment = await prisma.comment.create({
      data: {
        content: validated.data.content,
        userId: session.user.id,
        storyId,
        chapterId,
      },
      include: {
        story: { select: { authorId: true, title: true } },
      },
    })

    if (comment.story?.authorId && comment.story.authorId !== session.user.id) {
      await createNotification({
        userId: comment.story.authorId,
        type: "COMMENT",
        message: `${session.user.name} commented on "${comment.story.title}"`,
        link: `/stories/${storyId}${chapterId ? `/chapter/${chapterId}` : ""}`,
        actorId: session.user.id,
      })
    }

    revalidatePath("/stories/" + storyId)
    return { error: null, message: "Comment posted!" }
  } catch {
    return { error: null, message: "Failed to post comment" }
  }
}

export async function deleteComment(commentId: string, storyId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return

  const comment = await prisma.comment.findUnique({ where: { id: commentId } })
  if (!comment || comment.userId !== session.user.id) return

  await prisma.comment.delete({ where: { id: commentId } })
  revalidatePath("/stories/" + storyId)
}

export async function getComments(storyId: string, chapterId?: string) {
  return prisma.comment.findMany({
    where: { storyId, chapterId: chapterId ?? null, parentId: null },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, avatar: true } },
      replies: {
        orderBy: { createdAt: "asc" },
        include: {
          user: { select: { id: true, name: true, avatar: true } },
        },
      },
    },
  })
}
