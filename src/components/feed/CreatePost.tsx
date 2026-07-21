"use client"

import { useState, useRef } from "react"
import { useSession } from "next-auth/react"
import { Image, X } from "lucide-react"
import { createPost } from "@/app/actions/feed"

export function CreatePost({ onCreated }: { onCreated?: () => void }) {
  const { data: session } = useSession()
  const [content, setContent] = useState("")
  const [mediaUrls, setMediaUrls] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showForm, setShowForm] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!session?.user) return null

  async function handleSubmit() {
    if (!content.trim()) return
    setLoading(true)
    setError("")

    const fd = new FormData()
    fd.set("type", mediaUrls.length > 0 ? "image" : "text")
    fd.set("content", content)
    fd.set("mediaUrls", JSON.stringify(mediaUrls))

    const res = await createPost(fd)
    setLoading(false)

    if (res.error) {
      setError(res.error)
    } else {
      setContent("")
      setMediaUrls([])
      setShowForm(false)
      onCreated?.()
    }
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files) return
    for (const file of Array.from(files)) {
      const url = URL.createObjectURL(file)
      setMediaUrls((prev) => [...prev, url])
    }
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50">
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="flex w-full items-center gap-3 px-4 py-3 text-left"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-600 to-purple-700 text-sm font-bold text-white">
            {session.user.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="flex-1 rounded-full bg-zinc-800/50 px-4 py-2.5 text-sm text-zinc-500 hover:bg-zinc-800 transition-colors text-left">
            What&apos;s on your mind, {session.user.name?.split(" ")[0]}?
          </div>
        </button>
      ) : (
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-600 to-purple-700 text-sm font-bold text-white">
              {session.user.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-zinc-100">{session.user.name}</p>
            </div>
            <button
              onClick={() => { setShowForm(false); setMediaUrls([]); setContent("") }}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
            >
              <X size={18} />
            </button>
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`What's on your mind, ${session.user.name?.split(" ")[0]}?`}
            className="w-full resize-none bg-transparent px-1 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none min-h-[100px]"
            rows={3}
            autoFocus
          />

          {mediaUrls.length > 0 && (
            <div className="grid grid-cols-2 gap-2 rounded-lg bg-zinc-800/30 p-2">
              {mediaUrls.map((url, i) => (
                <div key={i} className="relative">
                  <img
                    src={url}
                    alt=""
                    className="w-full h-32 rounded-lg object-cover"
                  />
                  <button
                    onClick={() => setMediaUrls((p) => p.filter((_, j) => j !== i))}
                    className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex items-center justify-between border-t border-zinc-800 pt-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-green-500 hover:bg-zinc-800 transition-colors"
            >
              <Image size={16} />
              Photo
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileUpload}
            />
            <button
              onClick={handleSubmit}
              disabled={loading || !content.trim()}
              className="rounded-lg bg-amber-500 px-6 py-2 text-sm font-semibold text-black hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Posting..." : "Post"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
