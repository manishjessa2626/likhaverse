"use server"

import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/permissions"
import { getErrorMessage } from "@/lib/errors"
import { syncMessageToFirestore, syncConversationToFirestore } from "@/lib/firestore-sync"
import { createNotification } from "@/lib/notifications"
import { eventBus } from "@/lib/realtime/event-bus"
import { z } from "zod"

const SendMessageSchema = z.object({
  receiverId: z.string().min(1),
  subject: z.string().max(500).trim().optional(),
  content: z.string().min(1, "Message cannot be empty").max(10000).trim(),
})

export async function sendMessage(prevState: unknown, formData: FormData) {
  const session = await getServerSession(authOptions)
  try {
    const user = requireAuth(session)

    const validated = SendMessageSchema.safeParse({
      receiverId: formData.get("receiverId"),
      subject: formData.get("subject"),
      content: formData.get("content"),
    })

    if (!validated.success) {
      return { error: validated.error.flatten().fieldErrors, message: "" }
    }

    const receiver = await prisma.user.findUnique({ where: { id: validated.data.receiverId } })
    if (!receiver) {
      return { error: null, message: "User not found" }
    }

    const conv = await getOrCreateConversationDb(user.id, validated.data.receiverId)

    const msg = await prisma.message.create({
      data: {
        senderId: user.id,
        receiverId: validated.data.receiverId,
        subject: validated.data.subject,
        content: validated.data.content,
        conversationId: conv.id,
      },
    })

    await prisma.conversation.update({
      where: { id: conv.id },
      data: {
        lastMessage: validated.data.content.slice(0, 100),
      },
    })

    await createNotification({
      userId: validated.data.receiverId,
      type: "MESSAGE",
      message: `${user.name} sent you a message`,
      link: "/messages",
      actorId: user.id,
    })

    eventBus.broadcast({
      type: "message",
      conversationId: conv.id,
      userIds: [user.id, validated.data.receiverId],
      message: {
        id: msg.id,
        content: validated.data.content,
        senderId: user.id,
        createdAt: msg.createdAt.toISOString(),
      },
    })

    revalidatePath("/messages")
    revalidatePath("/author/messages")
    return { error: null, message: "Message sent!" }
  } catch (e) {
    return { error: null, message: getErrorMessage(e) }
  }
}

export async function markMessageRead(messageId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return
  const message = await prisma.message.findUnique({ where: { id: messageId } })
  if (message && message.receiverId === session.user.id) {
    await prisma.message.update({ where: { id: messageId }, data: { read: true } })
    revalidatePath("/author/messages")
  }
}

export async function deleteMessage(messageId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return { error: null, message: "Not authenticated" }
  const message = await prisma.message.findUnique({ where: { id: messageId } })
  if (message && (message.senderId === session.user.id || message.receiverId === session.user.id)) {
    await prisma.message.delete({ where: { id: messageId } })
    revalidatePath("/author/messages")
    return { error: null, message: "Message deleted" }
  }
  return { error: null, message: "Not authorized" }
}

export async function getInbox() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return []
  return prisma.message.findMany({
    where: { receiverId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      sender: { select: { id: true, name: true, avatar: true } },
    },
  })
}

export async function getOutbox() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return []
  return prisma.message.findMany({
    where: { senderId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      receiver: { select: { id: true, name: true, avatar: true } },
    },
  })
}

export async function getUnreadCount() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return 0
  return prisma.message.count({
    where: { receiverId: session.user.id, read: false },
  })
}

async function getOrCreateConversationDb(userId: string, otherUserId: string) {
  const existing = await prisma.conversation.findFirst({
    where: {
      participants: {
        every: {
          userId: { in: [userId, otherUserId] },
        },
      },
      AND: [
        { participants: { some: { userId } } },
        { participants: { some: { userId: otherUserId } } },
      ],
    },
  })

  if (existing) return existing

  return prisma.conversation.create({
    data: {
      participants: {
        create: [
          { userId },
          { userId: otherUserId },
        ],
      },
    },
  })
}

export async function getOrCreateConversation(otherUserId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return null

  const conv = await getOrCreateConversationDb(session.user.id, otherUserId)

  const messages = await prisma.message.findMany({
    where: { conversationId: conv.id },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      content: true,
      senderId: true,
      createdAt: true,
      read: true,
    },
  })

  const otherUser = await prisma.user.findUnique({
    where: { id: otherUserId },
    select: { id: true, name: true, avatar: true },
  })

  return {
    id: conv.id,
    otherUser,
    messages: messages.map((m) => ({
      ...m,
      createdAt: m.createdAt.toISOString(),
    })),
  }
}

export async function getConversations() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return []

  const userId = session.user.id

  const participants = await prisma.conversationParticipant.findMany({
    where: { userId },
    include: {
      conversation: {
        include: {
          participants: {
            include: {
              user: { select: { id: true, name: true, avatar: true } },
            },
          },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { content: true, createdAt: true, senderId: true, read: true, receiverId: true },
          },
        },
      },
    },
    orderBy: { conversation: { updatedAt: "desc" } },
  })

  const unreadCounts = await Promise.all(
    participants.map((p) =>
      prisma.message.count({
        where: {
          conversationId: p.conversationId,
          receiverId: userId,
          read: false,
        },
      })
    )
  )

  return participants.map((p, i) => {
    const conv = p.conversation
    const other = conv.participants.find((pp) => pp.userId !== userId)?.user ?? null
    const lastMsg = conv.messages[0] ?? null

    return {
      id: conv.id,
      otherUser: other,
      lastMessage: lastMsg ? {
        content: lastMsg.content.slice(0, 100),
        createdAt: lastMsg.createdAt.toISOString(),
        isFromMe: lastMsg.senderId === userId,
        isUnread: lastMsg.receiverId === userId && !lastMsg.read,
      } : null,
      unreadCount: unreadCounts[i],
      updatedAt: conv.updatedAt.toISOString(),
    }
  })
}

export async function getConversationMessages(conversationId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return []

  const participant = await prisma.conversationParticipant.findUnique({
    where: { userId_conversationId: { userId: session.user.id, conversationId } },
  })
  if (!participant) return []

  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      content: true,
      senderId: true,
      receiverId: true,
      createdAt: true,
      read: true,
    },
  })

  return messages.map((m) => ({
    ...m,
    createdAt: m.createdAt.toISOString(),
  }))
}

export async function sendConversationMessage(conversationId: string, content: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return { error: "Not authenticated" }

  const participant = await prisma.conversationParticipant.findUnique({
    where: { userId_conversationId: { userId: session.user.id, conversationId } },
    include: {
      conversation: {
        include: { participants: { select: { userId: true } } },
      },
    },
  })
  if (!participant) return { error: "Conversation not found" }

  const otherUserId = participant.conversation.participants.find(
    (p) => p.userId !== session.user.id
  )?.userId

  if (!otherUserId) return { error: "No other participant" }

  const msg = await prisma.message.create({
    data: {
      senderId: session.user.id,
      receiverId: otherUserId,
      content,
      conversationId,
    },
  })

  const conv = await prisma.conversation.update({
    where: { id: conversationId },
    data: { lastMessage: content.slice(0, 100) },
    include: { participants: { select: { userId: true } } },
  })

  syncMessageToFirestore({
    id: msg.id,
    content: msg.content,
    senderId: msg.senderId,
    receiverId: msg.receiverId,
    conversationId: msg.conversationId,
    createdAt: msg.createdAt,
    read: msg.read,
  })

  syncConversationToFirestore({
    id: conv.id,
    lastMessage: conv.lastMessage,
    participants: conv.participants,
    updatedAt: conv.updatedAt,
  })

  revalidatePath("/messages")
  return { error: null }
}

export async function markConversationRead(conversationId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return

  await prisma.message.updateMany({
    where: {
      conversationId,
      receiverId: session.user.id,
      read: false,
    },
    data: { read: true },
  })

  revalidatePath("/messages")
}

export async function getUnreadConversationCount() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return 0

  return prisma.message.count({
    where: {
      receiverId: session.user.id,
      read: false,
      conversationId: { not: null },
    },
  })
}

export async function searchUsers(query: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return []

  return prisma.user.findMany({
    where: {
      id: { not: session.user.id },
      name: { contains: query },
    },
    select: { id: true, name: true, avatar: true },
    take: 20,
  })
}
