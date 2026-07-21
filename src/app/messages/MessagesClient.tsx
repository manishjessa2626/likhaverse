"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { BackButton } from "@/components/ui/BackButton"
import {
  getConversationMessages,
  sendConversationMessage,
  markConversationRead,
  getConversations,
  searchUsers,
  getOrCreateConversation,
} from "@/app/actions/messages"
import { useMessagesListener, useConversationsListener } from "@/hooks/useFirestore"
import {
  MessageSquare,
  Send,
  Search,
  Plus,
  ChevronLeft,
  Check,
  CheckCheck,
} from "lucide-react"

interface Conversation {
  id: string
  otherUser: { id: string; name: string; avatar: string | null } | null
  lastMessage: { content: string; createdAt: string; isFromMe: boolean; isUnread: boolean } | null
  unreadCount: number
  updatedAt: string
}

interface Message {
  id: string
  content: string
  senderId: string
  createdAt: string
  read: boolean
}

export function MessagesClient({
  conversations: initialConversations,
  userId,
  userName,
}: {
  conversations: Conversation[]
  userId: string
  userName: string
}) {
  const [convos, setConvos] = useState<Conversation[]>(initialConversations)
  const [activeConvId, setActiveConvId] = useState<string | null>(null)
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const [showNewMessage, setShowNewMessage] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<{ id: string; name: string; avatar: string | null }[]>([])
  const [searching, setSearching] = useState(false)
  const [mobileView, setMobileView] = useState<"list" | "chat">("list")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const { messages: liveMessages } = useMessagesListener(activeConvId)
  const { conversations: liveConvos } = useConversationsListener(userId)

  const [loadedMessages, setLoadedMessages] = useState<Message[]>([])

  // Blend live messages with loaded messages
  const messages = liveMessages.length > 0 ? liveMessages : loadedMessages

  // Blend live conversations with server conversations
  useEffect(() => {
    if (liveConvos.length > 0) {
      setConvos((prev) => {
        const merged = [...prev]
        for (const lc of liveConvos) {
          const idx = merged.findIndex((c) => c.id === lc.id)
          if (idx >= 0) {
            merged[idx] = {
              ...merged[idx],
              updatedAt: lc.updatedAt,
            }
          }
        }
        return merged
      })
    }
  }, [liveConvos])

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  useEffect(() => {
    if (activeConvId) {
      markConversationRead(activeConvId)
      setConvos((prev) =>
        prev.map((c) =>
          c.id === activeConvId ? { ...c, unreadCount: 0 } : c
        )
      )
    }
  }, [activeConvId])

  useEffect(() => {
    if (activeConvId) {
      getConversationMessages(activeConvId).then(setLoadedMessages)
    }
  }, [activeConvId])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }
    const timer = setTimeout(async () => {
      setSearching(true)
      const results = await searchUsers(searchQuery)
      setSearchResults(results)
      setSearching(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  async function handleSend() {
    if (!input.trim() || !activeConvId || sending) return
    setSending(true)
    const result = await sendConversationMessage(activeConvId, input.trim())
    if (!result.error) {
      setInput("")
    }
    setSending(false)
  }

  async function handleSelectConversation(convId: string) {
    setActiveConvId(convId)
    setMobileView("chat")
    const msgs = await getConversationMessages(convId)
    setLoadedMessages(msgs)
    markConversationRead(convId)
    setConvos((prev) =>
      prev.map((c) => (c.id === convId ? { ...c, unreadCount: 0 } : c))
    )
  }

  async function handleStartConversation(otherUserId: string) {
    const conv = await getOrCreateConversation(otherUserId)
    if (conv) {
      setShowNewMessage(false)
      setSearchQuery("")
      setSearchResults([])
      const updated = await getConversations()
      setConvos(updated)
      handleSelectConversation(conv.id)
    }
  }

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

  const activeConv = convos.find((c) => c.id === activeConvId)

  return (
    <div className="fixed inset-0 top-14 bg-black">
      <div className="mx-auto flex h-full max-w-5xl border-l border-r border-zinc-800">
        {/* Conversation List */}
        <div
          className={`${
            mobileView === "chat" ? "hidden md:flex" : "flex"
          } w-full md:w-80 lg:w-96 flex-col border-r border-zinc-800 bg-zinc-950`}
        >
          <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
            <h1 className="text-lg font-bold text-zinc-100">Messages</h1>
            <button
              onClick={() => setShowNewMessage(true)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
            >
              <Plus size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {convos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-zinc-600">
                <MessageSquare size={40} className="mb-3" />
                <p className="text-sm">No conversations yet</p>
                <button
                  onClick={() => setShowNewMessage(true)}
                  className="mt-3 text-sm text-amber-500 hover:text-amber-400 transition-colors"
                >
                  Send your first message
                </button>
              </div>
            ) : (
              convos.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv.id)}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-zinc-800/50 ${
                    activeConvId === conv.id ? "bg-zinc-800" : ""
                  }`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-600 to-purple-700 text-sm font-bold text-white">
                    {conv.otherUser?.avatar ? (
                      <img src={conv.otherUser.avatar} alt="" className="h-full w-full object-cover" />
                    ) : (
                      conv.otherUser?.name?.charAt(0).toUpperCase() ?? "?"
                    )}
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
                    <div className="flex items-center gap-1">
                      {conv.lastMessage && conv.lastMessage.isFromMe && (
                        <Check size={12} className="shrink-0 text-zinc-600" />
                      )}
                      <p className="truncate text-sm text-zinc-500">
                        {conv.lastMessage?.content ?? "Start a conversation"}
                      </p>
                    </div>
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
        </div>

        {/* Chat Window */}
        <div
          className={`${
            mobileView === "list" ? "hidden md:flex" : "flex"
          } flex-1 flex-col bg-zinc-900`}
        >
          {activeConv ? (
            <>
              <div className="flex items-center gap-3 border-b border-zinc-800 px-4 py-3">
                <button
                  onClick={() => setMobileView("list")}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 md:hidden"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-600 to-purple-700 text-sm font-bold text-white">
                  {activeConv.otherUser?.avatar ? (
                    <img src={activeConv.otherUser.avatar} alt="" className="h-full w-full object-cover" />
                  ) : (
                    activeConv.otherUser?.name?.charAt(0).toUpperCase() ?? "?"
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-200">
                    {activeConv.otherUser?.name ?? "Unknown"}
                  </p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                {messages.map((msg) => {
                  const isMe = msg.senderId === userId
                  return (
                    <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                          isMe
                            ? "bg-amber-500 text-black rounded-br-md"
                            : "bg-zinc-800 text-zinc-200 rounded-bl-md"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                        <div className={`mt-1 flex items-center justify-end gap-1 ${
                          isMe ? "text-black/50" : "text-zinc-500"
                        }`}>
                          <span className="text-[10px]">{formatTime(msg.createdAt)}</span>
                          {isMe && (
                            msg.read ? (
                              <CheckCheck size={12} className="text-blue-400" />
                            ) : (
                              <Check size={12} />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>

              <div className="border-t border-zinc-800 px-4 py-3">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSend()
                      }
                    }}
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
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center text-zinc-600">
                <MessageSquare size={48} className="mx-auto mb-4" />
                <p className="text-lg font-medium text-zinc-400">Select a conversation</p>
                <p className="mt-1 text-sm">Choose from your existing conversations or start a new one</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Message Modal */}
      {showNewMessage && (
        <div className="fixed inset-0 top-14 z-50 flex items-start justify-center bg-black/60 pt-16">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
              <h2 className="text-sm font-semibold text-zinc-200">New Message</h2>
              <button
                onClick={() => { setShowNewMessage(false); setSearchQuery(""); setSearchResults([]) }}
                className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                Cancel
              </button>
            </div>
            <div className="p-4">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users..."
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-800 py-2.5 pl-10 pr-4 text-sm text-zinc-200 placeholder-zinc-500 outline-none focus:border-amber-500 transition-colors"
                  autoFocus
                />
              </div>
              <div className="mt-3 max-h-60 overflow-y-auto space-y-1">
                {searching ? (
                  <p className="py-4 text-center text-sm text-zinc-500">Searching...</p>
                ) : searchResults.length > 0 ? (
                  searchResults.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => handleStartConversation(u.id)}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-zinc-800 transition-colors"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-600 to-purple-700 text-sm font-bold text-white">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <p className="text-sm font-medium text-zinc-200">{u.name}</p>
                    </button>
                  ))
                ) : searchQuery.trim() ? (
                  <p className="py-4 text-center text-sm text-zinc-500">No users found</p>
                ) : (
                  <p className="py-4 text-center text-sm text-zinc-500">Type a name to search</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
