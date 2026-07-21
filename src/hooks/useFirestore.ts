"use client"

import { useState, useEffect } from "react"
import { db } from "@/lib/firebase"
import {
  collection, query, where, orderBy, limit,
  onSnapshot, doc, getDoc, Timestamp, Unsubscribe,
} from "firebase/firestore"
import { getApps } from "firebase/app"

function isFirebaseReady() {
  return getApps().length > 0 && typeof window !== "undefined"
}

interface FirestoreMessage {
  id: string
  content: string
  senderId: string
  receiverId: string
  conversationId: string | null
  createdAt: Timestamp
  read: boolean
}

interface FirestoreNotification {
  id: string
  type: string
  message: string
  link: string | null
  read: boolean
  userId: string
  actorId: string | null
  createdAt: Timestamp
}

interface FirestorePost {
  id: string
  content: string
  type: string
  userId: string
  createdAt: Timestamp
  mediaUrls: string | null
  bookId: string | null
}

export function useMessagesListener(conversationId: string | null) {
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isFirebaseReady() || !conversationId) {
      setLoading(false)
      return
    }

    const q = query(
      collection(db, "messages"),
      where("conversationId", "==", conversationId),
      orderBy("createdAt", "asc"),
      limit(100)
    )

    const unsub = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((d) => {
        const data = d.data() as FirestoreMessage
        return {
          id: d.id,
          content: data.content,
          senderId: data.senderId,
          receiverId: data.receiverId,
          conversationId: data.conversationId,
          read: data.read,
          createdAt: data.createdAt?.toDate()?.toISOString() || new Date().toISOString(),
        }
      })
      setMessages(msgs)
      setLoading(false)
    }, () => { setLoading(false) })

    return () => unsub()
  }, [conversationId])

  return { messages, loading }
}

export function useNotificationsListener(userId: string | undefined, limitCount = 20) {
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isFirebaseReady() || !userId) {
      setLoading(false)
      return
    }

    const q = query(
      collection(db, "notifications"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    )

    const unsub = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map((d) => {
        const data = d.data() as FirestoreNotification
        return {
          id: d.id,
          type: data.type,
          message: data.message,
          link: data.link,
          read: data.read,
          actorId: data.actorId,
          userId: data.userId,
          createdAt: data.createdAt?.toDate()?.toISOString() || new Date().toISOString(),
        }
      })
      setNotifications(notifs)
      setUnreadCount(notifs.filter((n) => !n.read).length)
      setLoading(false)
    }, () => { setLoading(false) })

    return () => unsub()
  }, [userId, limitCount])

  return { notifications, unreadCount, loading }
}

export function useFeedListener() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isFirebaseReady()) {
      setLoading(false)
      return
    }

    const q = query(
      collection(db, "posts"),
      orderBy("createdAt", "desc"),
      limit(20)
    )

    const unsub = onSnapshot(q, (snapshot) => {
      const allPosts = snapshot.docs.map((d) => {
        const data = d.data() as FirestorePost
        return {
          id: d.id,
          content: data.content,
          type: data.type,
          userId: data.userId,
          mediaUrls: data.mediaUrls,
          bookId: data.bookId,
          createdAt: data.createdAt?.toDate()?.toISOString() || new Date().toISOString(),
        }
      })
      setPosts(allPosts)
      setLoading(false)
    }, () => { setLoading(false) })

    return () => unsub()
  }, [])

  return { posts, loading }
}

export function useConversationsListener(userId: string | undefined) {
  const [conversations, setConversations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isFirebaseReady() || !userId) {
      setLoading(false)
      return
    }

    const q = query(
      collection(db, "conversations"),
      where("participantIds", "array-contains", userId),
      orderBy("updatedAt", "desc"),
      limit(30)
    )

    const unsub = onSnapshot(q, (snapshot) => {
      const convos = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        updatedAt: d.data().updatedAt?.toDate()?.toISOString(),
      }))
      setConversations(convos)
      setLoading(false)
    }, () => { setLoading(false) })

    return () => unsub()
  }, [userId])

  return { conversations, loading }
}
