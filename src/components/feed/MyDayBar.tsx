"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Plus, Camera } from "lucide-react"
import { createMyDayStory } from "@/app/actions/feed"
import { X, ChevronLeft, ChevronRight } from "lucide-react"

interface StoryUser {
  id: string
  name: string
  avatar: string | null
}

interface StoryItem {
  id: string
  mediaUrl: string
  caption: string | null
  createdAt: string | Date
  userId: string
  user: StoryUser
}

export function MyDayBar({
  stories,
  onUpdate,
}: {
  stories: StoryItem[]
  onUpdate?: () => void
}) {
  const { data: session } = useSession()
  const [viewingIndex, setViewingIndex] = useState<number | null>(null)
  const [showUpload, setShowUpload] = useState(false)
  const [uploadUrl, setUploadUrl] = useState("")
  const [uploadCaption, setUploadCaption] = useState("")
  const [uploading, setUploading] = useState(false)

  async function handleUpload() {
    if (!uploadUrl.trim()) return
    setUploading(true)
    const fd = new FormData()
    fd.set("mediaUrl", uploadUrl.trim())
    fd.set("caption", uploadCaption)
    await createMyDayStory(fd)
    setUploadUrl("")
    setUploadCaption("")
    setShowUpload(false)
    setUploading(false)
    onUpdate?.()
  }

  const userStoryIndex = stories.findIndex((s) => s.userId === session?.user?.id)
  const validStories = stories.filter((s) => s.userId !== session?.user?.id)

  function getGroupedStories() {
    const grouped: { user: StoryUser; stories: StoryItem[] }[] = []
    const map = new Map<string, StoryItem[]>()
    for (const s of stories) {
      if (!map.has(s.userId)) map.set(s.userId, [])
      map.get(s.userId)!.push(s)
    }
    for (const [, items] of map) {
      grouped.push({ user: items[0].user, stories: items })
    }
    return grouped
  }

  const grouped = getGroupedStories()

  return (
    <>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none]">
        {session?.user && (
          <div className="flex flex-col items-center gap-1 shrink-0">
            <button
              onClick={() => setShowUpload(!showUpload)}
              className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-zinc-600 bg-zinc-800 hover:bg-zinc-700 transition-colors"
            >
              <Plus size={24} className="text-amber-500" />
            </button>
            <span className="text-[10px] text-zinc-500">Add Story</span>
          </div>
        )}

        {grouped.map((group) => (
          <button
            key={group.user.id}
            onClick={() => {
              const idx = stories.findIndex((s) => s.userId === group.user.id)
              if (idx >= 0) setViewingIndex(idx)
            }}
            className="flex flex-col items-center gap-1 shrink-0"
          >
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-amber-500 to-orange-600 p-0.5">
              <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-zinc-900">
                {group.user.avatar ? (
                  <img src={group.user.avatar} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-sm font-bold text-white">
                    {group.user.name?.charAt(0).toUpperCase() || "U"}
                  </span>
                )}
              </div>
            </div>
            <span className="text-[10px] text-zinc-400 truncate max-w-16 text-center">
              {group.user.name?.split(" ")[0]}
            </span>
          </button>
        ))}
      </div>

      {showUpload && (
        <div className="mb-4 rounded-lg border border-zinc-700 bg-zinc-800/50 p-3">
          <p className="mb-2 text-xs font-semibold text-zinc-400">Add to My Day</p>
          <input
            value={uploadUrl}
            onChange={(e) => setUploadUrl(e.target.value)}
            placeholder="Image URL..."
            className="mb-2 w-full rounded-lg bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none ring-1 ring-zinc-700 focus:ring-amber-500"
          />
          <input
            value={uploadCaption}
            onChange={(e) => setUploadCaption(e.target.value)}
            placeholder="Caption (optional)"
            className="mb-2 w-full rounded-lg bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none ring-1 ring-zinc-700 focus:ring-amber-500"
          />
          <button
            onClick={handleUpload}
            disabled={uploading || !uploadUrl.trim()}
            className="w-full rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-black hover:bg-amber-400 disabled:opacity-50 transition-colors"
          >
            {uploading ? "Adding..." : "Add to My Day"}
          </button>
        </div>
      )}

      {viewingIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={() => setViewingIndex(null)}>
          <div className="relative max-w-lg w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setViewingIndex(null)} className="absolute -top-10 right-0 text-white/70 hover:text-white"><X size={24} /></button>
            {viewingIndex > 0 && (
              <button onClick={() => setViewingIndex(viewingIndex - 1)} className="absolute left-2 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"><ChevronLeft size={32} /></button>
            )}
            {viewingIndex < stories.length - 1 && (
              <button onClick={() => setViewingIndex(viewingIndex + 1)} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"><ChevronRight size={32} /></button>
            )}
            <img src={stories[viewingIndex].mediaUrl} alt="" className="w-full rounded-lg object-cover max-h-[80vh]" />
            <p className="mt-2 text-center text-sm text-white/80">{stories[viewingIndex].caption}</p>
          </div>
        </div>
      )}
    </>
  )
}
