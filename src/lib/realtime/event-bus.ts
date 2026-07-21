import EventEmitter from "eventemitter3"

export type NotificationEvent = {
  type: "notification"
  userId: string
  notification: {
    id: string
    type: string
    message: string
    link?: string | null
    actorId?: string | null
    createdAt: string
  }
}

export type MessageEvent = {
  type: "message"
  conversationId: string
  userIds: string[]
  message: {
    id: string
    content: string
    senderId: string
    createdAt: string
  }
}

export type PresenceEvent = {
  type: "presence"
  userId: string
  status: "online" | "offline" | "away"
}

export type LiveSessionEvent = {
  type: "live-session"
  sessionId: string
  action: "started" | "ended" | "attendee-joined" | "attendee-left"
  userId: string
}

export type RealtimeEvent = NotificationEvent | MessageEvent | PresenceEvent | LiveSessionEvent

class RealtimeEventBus extends EventEmitter<{
  notification: (event: NotificationEvent) => void
  message: (event: MessageEvent) => void
  presence: (event: PresenceEvent) => void
  "live-session": (event: LiveSessionEvent) => void
}> {
  private static instance: RealtimeEventBus

  static getInstance(): RealtimeEventBus {
    if (!RealtimeEventBus.instance) {
      RealtimeEventBus.instance = new RealtimeEventBus()
    }
    return RealtimeEventBus.instance
  }

  broadcast(event: RealtimeEvent): void {
    this.emit(event.type, event as any)
  }
}

export const eventBus = RealtimeEventBus.getInstance()
