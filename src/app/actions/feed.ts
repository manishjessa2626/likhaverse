"use server"

import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getErrorMessage } from "@/lib/errors"
import { syncPostToFirestore, syncNotificationToFirestore } from "@/lib/firestore-sync"

export async function createPost(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return { error: "Please log in to create a post" }

  const type = formData.get("type") as string || "text"
  const content = formData.get("content") as string
  const mediaUrls = formData.get("mediaUrls") as string || "[]"
  const bookId = formData.get("bookId") as string || null

  if (!content?.trim()) return { error: "Post content is required" }

  try {
    const post = await prisma.post.create({
      data: {
        type,
        content: content.trim(),
        mediaUrls,
        bookId,
        userId: session.user.id,
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    })

    syncPostToFirestore({
      id: post.id,
      content: post.content,
      userId: post.userId,
      createdAt: post.createdAt,
      type: post.type,
      mediaUrls: post.mediaUrls,
      bookId: post.bookId,
    })

    revalidatePath("/feed")
    return { error: null, post }
  } catch (e) {
    return { error: getErrorMessage(e, "Failed to create post") }
  }
}

export async function getFeed(cursor?: string, limit = 10) {
  const session = await getServerSession(authOptions)

  const where = cursor ? { createdAt: { lt: new Date(cursor) } } : {}

  const posts = await prisma.post.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    include: {
      user: { select: { id: true, name: true, avatar: true } },
      likes: { select: { userId: true } },
      saves: { select: { userId: true } },
      comments: {
        take: 2,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true, avatar: true } },
        },
      },
      _count: { select: { likes: true, comments: true, saves: true } },
    },
  })

  const hasMore = posts.length > limit
  const items = hasMore ? posts.slice(0, limit) : posts
  const nextCursor = hasMore ? items[items.length - 1].createdAt.toISOString() : null

  const likedPostIds = session?.user
    ? items.filter((p) => p.likes.some((l) => l.userId === session.user.id)).map((p) => p.id)
    : []

  const savedPostIds = session?.user
    ? items.filter((p) => p.saves?.some((s) => s.userId === session.user.id)).map((p) => p.id)
    : []

  const postsData = items.map(({ likes, saves, ...rest }) => ({
    ...rest,
    isLiked: likedPostIds.includes(rest.id),
    isSaved: savedPostIds.includes(rest.id),
  }))

  const followingIds = session?.user
    ? (await prisma.follow.findMany({
        where: { followerId: session.user.id },
        select: { followingId: true },
      })).map((f) => f.followingId)
    : []

  const sorted = postsData.sort((a, b) => {
    const aFollowed = followingIds.includes(a.userId) ? 1 : 0
    const bFollowed = followingIds.includes(b.userId) ? 1 : 0
    return bFollowed - aFollowed
  })

  return { posts: sorted, nextCursor, hasMore }
}

export async function togglePostLike(postId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return { error: "Please log in" }

  try {
    const existing = await prisma.postLike.findUnique({
      where: { postId_userId: { postId, userId: session.user.id } },
      include: { post: { select: { userId: true } } },
    })

    if (existing) {
      await prisma.postLike.delete({ where: { id: existing.id } })
    } else {
      const like = await prisma.postLike.create({
        data: { postId, userId: session.user.id },
        include: { post: { select: { userId: true } } },
      })

      if (like.post.userId !== session.user.id) {
        const notif = await prisma.notification.create({
          data: {
            type: "POST_LIKE",
            message: `${session.user.name} liked your post`,
            link: `/feed`,
            userId: like.post.userId,
            actorId: session.user.id,
          },
        })
        syncNotificationToFirestore({
          id: notif.id,
          type: notif.type,
          message: notif.message,
          link: notif.link,
          read: notif.read,
          userId: notif.userId,
          actorId: notif.actorId,
          createdAt: notif.createdAt,
        })
      }
    }

    revalidatePath("/feed")
    return { error: null }
  } catch (e) {
    return { error: getErrorMessage(e, "Failed to toggle like") }
  }
}

export async function addPostComment(postId: string, text: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return { error: "Please log in" }

  if (!text?.trim()) return { error: "Comment text is required" }

  try {
    const comment = await prisma.postComment.create({
      data: { postId, userId: session.user.id, text: text.trim() },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        post: { select: { userId: true } },
      },
    })

    if (comment.post.userId !== session.user.id) {
      const notif = await prisma.notification.create({
        data: {
          type: "POST_COMMENT",
          message: `${session.user.name} commented on your post: "${text.slice(0, 50)}${text.length > 50 ? "..." : ""}"`,
          link: `/feed`,
          userId: comment.post.userId,
          actorId: session.user.id,
        },
      })
      syncNotificationToFirestore({
        id: notif.id,
        type: notif.type,
        message: notif.message,
        link: notif.link,
        read: notif.read,
        userId: notif.userId,
        actorId: notif.actorId,
        createdAt: notif.createdAt,
      })
    }

    revalidatePath("/feed")
    return { error: null, comment }
  } catch (e) {
    return { error: getErrorMessage(e, "Failed to add comment") }
  }
}

export async function getPostComments(postId: string) {
  const comments = await prisma.postComment.findMany({
    where: { postId },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, avatar: true } },
    },
  })
  return { comments }
}

export async function deletePost(postId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return { error: "Please log in" }

  try {
    const post = await prisma.post.findUnique({ where: { id: postId } })
    if (!post) return { error: "Post not found" }
    if (post.userId !== session.user.id && session.user.role !== "SUPER_ADMIN") {
      return { error: "Not authorized" }
    }

    await prisma.post.delete({ where: { id: postId } })
    revalidatePath("/feed")
    return { error: null }
  } catch (e) {
    return { error: getErrorMessage(e, "Failed to delete post") }
  }
}

export async function createMyDayStory(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return { error: "Please log in" }

  const mediaUrl = formData.get("mediaUrl") as string
  const caption = formData.get("caption") as string || ""

  if (!mediaUrl) return { error: "Media URL is required" }

  try {
    const story = await prisma.myDayStory.create({
      data: {
        mediaUrl,
        caption: caption.trim() || null,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        userId: session.user.id,
      },
    })

    revalidatePath("/feed")
    return { error: null, story }
  } catch (e) {
    return { error: getErrorMessage(e, "Failed to create story") }
  }
}

export async function getMyDayStories() {
  const session = await getServerSession(authOptions)
  const now = new Date()

  const stories = await prisma.myDayStory.findMany({
    where: { expiresAt: { gt: now } },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, avatar: true } },
    },
  })

  if (!session?.user) return { stories: [] }

  const followingIds = (await prisma.follow.findMany({
    where: { followerId: session.user.id },
    select: { followingId: true },
  })).map((f) => f.followingId)

  const sorted = stories.sort((a, b) => {
    const aFollowed = followingIds.includes(a.userId) ? 1 : 0
    const bFollowed = followingIds.includes(b.userId) ? 1 : 0
    const aOwn = a.userId === session.user.id ? 2 : 0
    const bOwn = b.userId === session.user.id ? 2 : 0
    return Math.max(bFollowed, bOwn) - Math.max(aFollowed, aOwn)
  })

  return { stories: sorted }
}

export async function deleteExpiredMyDayStories() {
  const now = new Date()
  const { count } = await prisma.myDayStory.deleteMany({
    where: { expiresAt: { lte: now } },
  })
  return { deleted: count }
}

export async function togglePostSave(postId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return { error: "Please log in" }

  try {
    const existing = await prisma.postSave.findUnique({
      where: { postId_userId: { postId, userId: session.user.id } },
    })

    if (existing) {
      await prisma.postSave.delete({ where: { id: existing.id } })
    } else {
      await prisma.postSave.create({
        data: { postId, userId: session.user.id },
      })
    }

    revalidatePath("/feed")
    return { error: null, saved: !existing }
  } catch (e) {
    return { error: getErrorMessage(e, "Failed to toggle save") }
  }
}

export async function createReel(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return { error: "Please log in" }

  const videoUrl = formData.get("videoUrl") as string
  const caption = formData.get("caption") as string || ""
  const musicUrl = formData.get("musicUrl") as string || null
  const audioUrl = formData.get("audioUrl") as string || null

  if (!videoUrl?.trim()) return { error: "Video URL is required" }

  try {
    const reel = await prisma.reel.create({
      data: {
        videoUrl: videoUrl.trim(),
        caption: caption.trim() || null,
        musicUrl,
        audioUrl,
        userId: session.user.id,
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    })

    revalidatePath("/feed")
    return { error: null, reel }
  } catch (e) {
    return { error: getErrorMessage(e, "Failed to create reel") }
  }
}

export async function getReels(cursor?: string, limit = 5) {
  const session = await getServerSession(authOptions)

  const where = cursor ? { createdAt: { lt: new Date(cursor) } } : {}

  const reels = await prisma.reel.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    include: {
      user: { select: { id: true, name: true, avatar: true } },
      likes: { select: { userId: true } },
      _count: { select: { likes: true, comments: true } },
    },
  })

  const hasMore = reels.length > limit
  const items = hasMore ? reels.slice(0, limit) : reels
  const nextCursor = hasMore ? items[items.length - 1].createdAt.toISOString() : null

  const likedReelIds = session?.user
    ? items.filter((r) => r.likes.some((l) => l.userId === session.user.id)).map((r) => r.id)
    : []

  const reelsData = items.map(({ likes, ...rest }) => ({
    ...rest,
    isLiked: likedReelIds.includes(rest.id),
  }))

  return { reels: reelsData, nextCursor, hasMore }
}

export async function toggleReelLike(reelId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return { error: "Please log in" }

  try {
    const existing = await prisma.reelLike.findUnique({
      where: { reelId_userId: { reelId, userId: session.user.id } },
    })

    if (existing) {
      await prisma.reelLike.delete({ where: { id: existing.id } })
    } else {
      await prisma.reelLike.create({ data: { reelId, userId: session.user.id } })

      const reel = await prisma.reel.findUnique({ where: { id: reelId }, select: { userId: true } })
      if (reel && reel.userId !== session.user.id) {
        const notif = await prisma.notification.create({
          data: {
            type: "REEL_LIKE",
            message: `${session.user.name} liked your reel`,
            link: `/feed`,
            userId: reel.userId,
            actorId: session.user.id,
          },
        })
        syncNotificationToFirestore({
          id: notif.id,
          type: notif.type,
          message: notif.message,
          link: notif.link,
          read: notif.read,
          userId: notif.userId,
          actorId: notif.actorId,
          createdAt: notif.createdAt,
        })
      }
    }

    revalidatePath("/feed")
    return { error: null }
  } catch (e) {
    return { error: getErrorMessage(e, "Failed to toggle reel like") }
  }
}

export async function addReelComment(reelId: string, text: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return { error: "Please log in" }

  if (!text?.trim()) return { error: "Comment text is required" }

  try {
    const comment = await prisma.reelComment.create({
      data: { reelId, userId: session.user.id, text: text.trim() },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    })

    const reel = await prisma.reel.findUnique({ where: { id: reelId }, select: { userId: true } })
    if (reel && reel.userId !== session.user.id) {
      const notif = await prisma.notification.create({
        data: {
          type: "REEL_COMMENT",
          message: `${session.user.name} commented on your reel: "${text.slice(0, 50)}${text.length > 50 ? "..." : ""}"`,
          link: `/feed`,
          userId: reel.userId,
          actorId: session.user.id,
        },
      })
      syncNotificationToFirestore({
        id: notif.id,
        type: notif.type,
        message: notif.message,
        link: notif.link,
        read: notif.read,
        userId: notif.userId,
        actorId: notif.actorId,
        createdAt: notif.createdAt,
      })
    }

    revalidatePath("/feed")
    return { error: null, comment }
  } catch (e) {
    return { error: getErrorMessage(e, "Failed to add reel comment") }
  }
}

export async function getReelComments(reelId: string) {
  const comments = await prisma.reelComment.findMany({
    where: { reelId },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, avatar: true } },
    },
  })
  return { comments }
}

export async function deleteReel(reelId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return { error: "Please log in" }

  try {
    const reel = await prisma.reel.findUnique({ where: { id: reelId } })
    if (!reel) return { error: "Reel not found" }
    if (reel.userId !== session.user.id && session.user.role !== "SUPER_ADMIN") {
      return { error: "Not authorized" }
    }

    await prisma.reel.delete({ where: { id: reelId } })
    revalidatePath("/feed")
    return { error: null }
  } catch (e) {
    return { error: getErrorMessage(e, "Failed to delete reel") }
  }
}
