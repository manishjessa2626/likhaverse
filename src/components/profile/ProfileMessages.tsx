"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useSession } from "next-auth/react"
import { MessageSquare, Send, Check, CheckCheck, ChevronLeft, Mail, Inbox } from "lucide-react"
import { getOrCreateConversation, sendConversationMessage, getConversationMessages, getConversations } from "@/app/actions/messages"
import { useMessagesListener, useConversationsListener } from "@/hooks/useFirestore"

function formatTime(iso: string) {
  const date = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1) return "now"
  if (mins < 60) return `${mins}m`
  if (hours < 24) return `${hours}h`
  if (days < 7) return `${days}d`
  return date.toLocaleDateString([], { month: "short", day: "numeric" })
}

export function ProfileMessages({
  isOwner, profileUserId, profileName, compact,
}: {
  isOwner: boolean
  profileUserId: string
  profileName: string
  compact?: boolean
}) {
  const { data: session } = useSession()
  const [convId, setConvId] = useState<string | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showInput, setShowInput] = useState(false)
  const [convos, setConvos] = useState<any[]>([])
  const [msgTab, setMsgTab] = useState<"inbox" | "unread">("inbox")
  const [view, setView] = useState<"list" | "chat">("list")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { messages: liveMessages } = useMessagesListener(convId)
  const { conversations: liveConvos } = useConversationsListener(session?.user?.id)

  const displayMessages = liveMessages.length > 0 ? liveMessages : messages

  useEffect(() => {
    liveConvos.length > 0 && setConvos((prev) => {
      const merged = [...prev]
      for (const lc of liveConvos) {
        const idx = merged.findIndex((c) => c.id === lc.id)
        if (idx >= 0) merged[idx] = { ...merged[idx], updatedAt: lc.updatedAt }
      }
      return merged
    })
  }, [liveConvos])

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => { scrollToBottom() }, [displayMessages, scrollToBottom])

  useEffect(() => {
    async function init() {
      if (!session?.user?.id) return
      if (isOwner) {
        const convs = await getConversations()
        setConvos(convs)
        if (convs.length > 0) {
          setConvId(convs[0].id)
          const msgs = await getConversationMessages(convs[0].id)
          setMessages(msgs)
        }
      } else {
        const conv = await getOrCreateConversation(profileUserId)
        if (conv) {
          setConvId(conv.id)
          const msgs = await getConversationMessages(conv.id)
          setMessages(msgs)
        }
      }
      setLoading(false)
    }
    init()
  }, [session?.user?.id, profileUserId, isOwner])

  async function handleSend() {
    if (!input.trim() || !convId || sending) return
    setSending(true)
    const result = await sendConversationMessage(convId, input.trim())
    if (!result.error) setInput("")
    setSending(false)
  }

  async function handleSelectConversation(cid: string) {
    setConvId(cid)
    setView("chat")
    const msgs = await getConversationMessages(cid)
    setMessages(msgs)
  }

  if (!session?.user) {
    return (
      <div className="py-16 text-center">
        <MessageSquare size={40} className="mx-auto mb-3 text-zinc-700" />
        <p className="text-zinc-500 text-sm">Log in to send messages</p>
      </div>
    )
  }

  // Compact mode for visitors
  if (compact && !isOwner) {
    return (
      <div>
        {!showInput ? (
          <button
            onClick={() => setShowInput(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-black hover:bg-amber-400 transition-colors"
          >
            <MessageSquare size={14} />
            Send Message
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend() } }}
              placeholder="Type a message..."
              className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-500 outline-none focus:border-amber-500 transition-colors"
              autoFocus
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || sending}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500 text-black hover:bg-amber-400 disabled:opacity-50 transition-all"
            >
              <Send size={14} />
            </button>
          </div>
        )}
      </div>
    )
  }

  // Owner full messages view with 2 tabs
  if (isOwner) {
    const filteredConvos = msgTab === "unread"
      ? convos.filter((c: any) => c.unreadCount > 0)
      : convos

    const activeConv = convos.find((c: any) => c.id === convId)

    if (loading) {
      return <div className="py-16 text-center"><p className="text-zinc-500 text-sm">Loading messages...</p></div>
    }

    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
        {view === "list" ? (
          <>
            {/* Header with tabs */}
            <div className="border-b border-zinc-800">
              <div className="flex items-center justify-between px-4 pt-3 pb-2">
                <h3 className="text-sm font-semibold text-zinc-200">Messages</h3>
              </div>
              <div className="flex gap-0 px-4">
                <button
                  onClick={() => setMsgTab("inbox")}
                  className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
                    msgTab === "inbox"
                      ? "border-amber-500 text-amber-400"
                      : "border-transparent text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <Inbox size={14} className="inline mr-1.5 -mt-0.5" />
                  Inbox
                </button>
                <button
                  onClick={() => setMsgTab("unread")}
                  className={`pb-2 text-sm font-medium border-b-2 transition-colors ml-5 ${
                    msgTab === "unread"
                      ? "border-amber-500 text-amber-400"
                      : "border-transparent text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <Mail size={14} className="inline mr-1.5 -mt-0.5" />
                  Unread
                </button>
              </div>
            </div>

            {/* Conversation list */}
            <div className="max-h-[400px] overflow-y-auto">
              {filteredConvos.length === 0 ? (
                <div className="py-12 text-center">
                  <MessageSquare size={32} className="mx-auto mb-2 text-zinc-700" />
                  <p className="text-sm text-zinc-500">
                    {msgTab === "unread" ? "No unread messages" : "No conversations yet"}
                  </p>
                </div>
              ) : (
                filteredConvos.map((conv: any) => (
                  <button
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv.id)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-zinc-800/50 transition-colors"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-600 to-purple-700 text-sm font-bold text-white">
                      {conv.otherUser?.name?.charAt(0).toUpperCase() ?? "?"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="truncate text-sm font-medium text-zinc-200">
                          {conv.otherUser?.name ?? "Unknown"}
                        </p>
                        {conv.lastMessage && (
                          <span className="shrink-0 text-[11px] text-zinc-500">
                            {formatTime(conv.lastMessage.createdAt)}
                          </span>
                        )}
                      </div>
                      <p className="truncate text-sm text-zinc-500">
                        {conv.lastMessage?.content ?? "Start a conversation"}
                      </p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-amber-500 px-1.5 text-[10px] font-bold text-black">
                        {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </>
        ) : (
          /* Chat view */
          <>
            <div className="flex items-center gap-3 border-b border-zinc-800 px-4 py-3">
              <button
                onClick={() => setView("list")}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-600 to-purple-700 text-sm font-bold text-white">
                {activeConv?.otherUser?.name?.charAt(0).toUpperCase() ?? "?"}
              </div>
              <p className="text-sm font-medium text-zinc-200">
                {activeConv?.otherUser?.name ?? "Unknown"}
              </p>
            </div>

            <div className="h-[340px] overflow-y-auto px-4 py-4 space-y-3">
              {displayMessages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-zinc-600">No messages yet. Say hello!</p>
                </div>
              ) : (
                displayMessages.map((msg: any) => {
                  const isMe = msg.senderId === session.user.id
                  return (
                    <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                        isMe ? "bg-amber-500 text-black rounded-br-md" : "bg-zinc-800 text-zinc-200 rounded-bl-md"
                      }`}>
                        <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                        <div className={`mt-1 flex items-center justify-end gap-1 ${isMe ? "text-black/50" : "text-zinc-500"}`}>
                          <span className="text-[10px]">{formatTime(msg.createdAt)}</span>
                          {isMe && (
                            msg.read ? <CheckCheck size={12} className="text-blue-400" /> : <Check size={12} />
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-zinc-800 px-4 py-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                  placeholder="Type a message..."
                  className="flex-1 rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-500 outline-none focus:border-amber-500 transition-colors"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || sending}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-black hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    )
  }

  // Visitor full chat view
  if (loading) {
    return <div className="py-16 text-center"><p className="text-zinc-500 text-sm">Loading messages...</p></div>
  }

  if (!convId) {
    return (
      <div className="py-16 text-center">
        <MessageSquare size={40} className="mx-auto mb-3 text-zinc-700" />
        <p className="text-zinc-500 text-sm">Could not start conversation</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[400px] rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
      <div className="flex items-center gap-3 border-b border-zinc-800 px-4 py-3">
        <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-600 to-purple-700 text-sm font-bold text-white">
          {profileName.charAt(0).toUpperCase()}
        </div>
        <p className="text-sm font-medium text-zinc-200">{profileName}</p>
        <p className="text-xs text-zinc-500">Conversation</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {displayMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-zinc-600">No messages yet. Say hello!</p>
          </div>
        ) : (
          displayMessages.map((msg: any) => {
            const isMe = msg.senderId === session.user.id
            return (
              <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                  isMe ? "bg-amber-500 text-black rounded-br-md" : "bg-zinc-800 text-zinc-200 rounded-bl-md"
                }`}>
                  <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                  <div className={`mt-1 flex items-center justify-end gap-1 ${isMe ? "text-black/50" : "text-zinc-500"}`}>
                    <span className="text-[10px]">{formatTime(msg.createdAt)}</span>
                    {isMe && (
                      msg.read ? <CheckCheck size={12} className="text-blue-400" /> : <Check size={12} />
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-zinc-800 px-4 py-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend() } }}
            placeholder="Type a message..."
            className="flex-1 rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-500 outline-none focus:border-amber-500 transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-black hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
