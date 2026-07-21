"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export type ActivityItem = {
  id: string
  type: "post_like" | "post_comment" | "story_like" | "follow" | "save" | "post_create"
  message: string
  link: string | null
  createdAt: string
}

export async function getActivity(limit = 20): Promise<ActivityItem[]> {
  const session = await getServerSession(authOptions)
  if (!session?.user) return []

  const userId = session.user.id

  const [postLikes, postComments, storyLikes, follows, saves, posts] = await Promise.all([
    prisma.postLike.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { post: { select: { content: true } } },
    }),
    prisma.postComment.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { post: { select: { content: true } } },
    }),
    prisma.storyLike.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { story: { select: { title: true } } },
    }),
    prisma.follow.findMany({
      where: { followerId: userId },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { following: { select: { name: true } } },
    }),
    prisma.save.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { story: { select: { title: true } } },
    }),
    prisma.post.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    }),
  ])

  const items: ActivityItem[] = [
    ...postLikes.map((l) => ({
      id: `pl_${l.id}`,
      type: "post_like" as const,
      message: `You liked a post${l.post.content ? `: "${l.post.content.slice(0, 60)}${l.post.content.length > 60 ? "..." : ""}"` : ""}`,
      link: "/feed",
      createdAt: l.createdAt.toISOString(),
    })),
    ...postComments.map((c) => ({
      id: `pc_${c.id}`,
      type: "post_comment" as const,
      message: `You commented: "${c.text.slice(0, 60)}${c.text.length > 60 ? "..." : ""}"`,
      link: "/feed",
      createdAt: c.createdAt.toISOString(),
    })),
    ...storyLikes.map((l) => ({
      id: `sl_${l.id}`,
      type: "story_like" as const,
      message: `You liked "${l.story.title}"`,
      link: `/stories/${l.storyId}`,
      createdAt: l.createdAt.toISOString(),
    })),
    ...follows.map((f) => ({
      id: `fl_${f.id}`,
      type: "follow" as const,
      message: `You followed ${f.following.name}`,
      link: `/profile/${f.followingId}`,
      createdAt: f.createdAt.toISOString(),
    })),
    ...saves.map((s) => ({
      id: `sv_${s.id}`,
      type: "save" as const,
      message: `You saved "${s.story.title}"`,
      link: `/stories/${s.storyId}`,
      createdAt: s.createdAt.toISOString(),
    })),
    ...posts.map((p) => ({
      id: `po_${p.id}`,
      type: "post_create" as const,
      message: `You created a post${p.content ? `: "${p.content.slice(0, 60)}${p.content.length > 60 ? "..." : ""}"` : ""}`,
      link: "/feed",
      createdAt: p.createdAt.toISOString(),
    })),
  ]

  return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, limit)
}
