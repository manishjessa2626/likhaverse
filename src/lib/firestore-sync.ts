import { createLogger } from "./observability/logger"

const log = createLogger("firestore-sync")

export type SyncableModel = "notification" | "message" | "conversation" | "post"

function isFirebaseConfigured(): boolean {
  const projectId = process.env.FIREBASE_PROJECT_ID
  if (!projectId || projectId === "demo" || projectId === "") return false
  return true
}

async function getFirestore() {
  const { initializeApp, getApps } = await import("firebase/app")
  const { getFirestore: getFS } = await import("firebase/firestore")

  const app = getApps().length === 0
    ? initializeApp({
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCz7XixcIPTMfSB-phzyimax21gjLix1Og",
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "likhaverse.firebaseapp.com",
        projectId: process.env.FIREBASE_PROJECT_ID || "likhaverse",
      })
    : getApps()[0]

  return getFS(app)
}

export async function syncNotificationToFirestore(notification: {
  id: string
  type: string
  message: string
  link?: string | null
  read: boolean
  userId: string
  actorId?: string | null
  createdAt: Date
}) {
  if (!isFirebaseConfigured()) {
    log.debug("Firebase not configured — skipping Firestore sync")
    return
  }

  try {
    const { doc, setDoc } = await import("firebase/firestore")
    const db = await getFirestore()
    const collection = ["FOLLOW", "SYSTEM"].includes(notification.type) ? "notifications_main" : "notifications_feed"

    await setDoc(doc(db, collection, notification.id), {
      type: notification.type,
      message: notification.message,
      link: notification.link,
      read: notification.read,
      userId: notification.userId,
      actorId: notification.actorId,
      createdAt: notification.createdAt.toISOString(),
    })

    log.debug({ id: notification.id, type: notification.type }, "Notification synced to Firestore")
  } catch (error) {
    log.error({ err: error, id: notification.id }, "Failed to sync notification to Firestore")
  }
}

export async function syncMessageToFirestore(message: {
  id: string
  content: string
  conversationId: string | null
  senderId: string
  receiverId?: string | null
  read?: boolean
  createdAt: Date
}) {
  if (!isFirebaseConfigured()) return

  try {
    const { doc, setDoc } = await import("firebase/firestore")
    const db = await getFirestore()

    await setDoc(doc(db, "messages", message.id), {
      content: message.content,
      conversationId: message.conversationId,
      senderId: message.senderId,
      receiverId: message.receiverId ?? null,
      read: message.read ?? false,
      createdAt: message.createdAt.toISOString(),
    })

    log.debug({ id: message.id }, "Message synced to Firestore")
  } catch (error) {
    log.error({ err: error, id: message.id }, "Failed to sync message to Firestore")
  }
}

export async function syncConversationToFirestore(conversation: {
  id: string
  participants: { userId: string }[]
  lastMessage?: string | null
  updatedAt: Date
}) {
  if (!isFirebaseConfigured()) return

  try {
    const { doc, setDoc } = await import("firebase/firestore")
    const db = await getFirestore()

    await setDoc(doc(db, "conversations", conversation.id), {
      participantIds: conversation.participants.map((p) => p.userId),
      lastMessage: conversation.lastMessage || "",
      updatedAt: conversation.updatedAt.toISOString(),
    })

    log.debug({ id: conversation.id }, "Conversation synced to Firestore")
  } catch (error) {
    log.error({ err: error, id: conversation.id }, "Failed to sync conversation to Firestore")
  }
}

export async function syncPostToFirestore(post: {
  id: string
  content: string
  userId: string
  createdAt: Date
  type?: string
  mediaUrls?: string | null
  bookId?: string | null
}) {
  if (!isFirebaseConfigured()) return

  try {
    const { doc, setDoc } = await import("firebase/firestore")
    const db = await getFirestore()

    await setDoc(doc(db, "posts", post.id), {
      content: post.content,
      userId: post.userId,
      createdAt: post.createdAt.toISOString(),
      type: post.type ?? "text",
      mediaUrls: post.mediaUrls ?? null,
      bookId: post.bookId ?? null,
    })

    log.debug({ id: post.id }, "Post synced to Firestore")
  } catch (error) {
    log.error({ err: error, id: post.id }, "Failed to sync post to Firestore")
  }
}

export async function markNotificationReadFirestore(notificationId: string, category?: string) {
  if (!isFirebaseConfigured()) return
  try {
    const { doc, updateDoc } = await import("firebase/firestore")
    const db = await getFirestore()
    const collection = category === "system" ? "notifications_main" : "notifications_feed"
    await updateDoc(doc(db, collection, notificationId), { read: true })
    log.debug({ id: notificationId }, "Notification marked read in Firestore")
  } catch (error) {
    log.debug({ err: error, id: notificationId }, "Failed to mark notification read in Firestore")
  }
}

export async function markAllNotificationsReadFirestore(userId: string, category?: string) {
  if (!isFirebaseConfigured()) return
  try {
    const { collection, query, where, getDocs, writeBatch, doc } = await import("firebase/firestore")
    const db = await getFirestore()
    const colName = category === "system" ? "notifications_main" : "notifications_feed"
    const q = query(collection(db, colName), where("userId", "==", userId), where("read", "==", false))
    const snapshot = await getDocs(q)
    const batch = writeBatch(db)
    snapshot.forEach((d) => batch.update(doc(db, colName, d.id), { read: true }))
    await batch.commit()
    log.debug({ userId, count: snapshot.size }, "All notifications marked read in Firestore")
  } catch (error) {
    log.debug({ err: error, userId }, "Failed to mark all notifications read in Firestore")
  }
}

export async function syncToFirestore(model: SyncableModel, id: string): Promise<void> {
  if (!isFirebaseConfigured()) return

  const { prisma } = await import("./prisma")

  try {
    switch (model) {
      case "notification": {
        const notification = await prisma.notification.findUnique({ where: { id } })
        if (notification) await syncNotificationToFirestore(notification)
        break
      }
      case "message": {
        const message = await prisma.message.findUnique({ where: { id } })
        if (message) await syncMessageToFirestore(message)
        break
      }
      case "conversation": {
        const conversation = await prisma.conversation.findUnique({
          where: { id },
          include: { participants: { select: { userId: true } } },
        })
        if (conversation) {
          await syncConversationToFirestore({
            id: conversation.id,
            participants: conversation.participants,
            lastMessage: undefined,
            updatedAt: conversation.updatedAt,
          })
        }
        break
      }
      case "post": {
        const post = await prisma.post.findUnique({ where: { id } })
        if (post) await syncPostToFirestore(post)
        break
      }
    }
  } catch (error) {
    log.error({ err: error, model, id }, "Firestore sync failed")
  }
}
