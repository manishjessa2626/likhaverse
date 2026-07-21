"use client"

import { useState, useRef, useCallback, useEffect, memo } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Heart, MessageCircle, Music, ChevronUp, ChevronDown, X, Send, Volume2, VolumeX, Play, Pause } from "lucide-react"
import { toggleReelLike, addReelComment, getReelComments, deleteReel, createReel } from "@/app/actions/feed"
import { LazyImage } from "@/components/ui/LazyImage"

interface ReelUser { id: string; name: string; avatar: string | null }
interface ReelItem {
  id: string; videoUrl: string; caption: string | null; musicUrl: string | null
  audioUrl: string | null; viewCount: number; createdAt: string | Date
  userId: string; user: ReelUser; isLiked: boolean
  _count: { likes: number; comments: number }
}

function timeAgo(date: string | Date) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return "just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return new Date(date).toLocaleDateString()
}

const ReelCard = memo(function ReelCard({
  reel,
  isActive,
  isMuted,
  isPaused,
  volume,
  onToggleMute,
  onTogglePlay,
  onLike,
  onComment,
  onShare,
  onDelete,
  liked,
  likeCount,
  commentCount,
  sessionUserId,
  sessionUser,
  showControls,
}: {
  reel: ReelItem
  isActive: boolean
  isMuted: boolean
  isPaused: boolean
  volume: number
  onToggleMute: () => void
  onTogglePlay: () => void
  onLike: () => void
  onComment: () => void
  onShare: () => void
  onDelete: () => void
  liked: boolean
  likeCount: number
  commentCount: number
  sessionUserId?: string
  sessionUser?: any
  showControls: boolean
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (isActive && videoRef.current) {
      videoRef.current.play().catch(() => {})
      if (audioRef.current && reel.audioUrl && !isMuted) {
        audioRef.current.play().catch(() => {})
      }
    }
  }, [isActive, reel.id])

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted
      videoRef.current.volume = volume
    }
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume
    }
  }, [isMuted, volume])

  if (!isActive) return null

  return (
    <>
      <audio ref={audioRef} src={reel.audioUrl || undefined} loop className="hidden" preload="auto" />
      <video
        ref={videoRef}
        src={reel.videoUrl}
        className="h-full w-full object-contain cursor-pointer"
        autoPlay
        muted={isMuted}
        loop
        playsInline
        preload="auto"
        onClick={onTogglePlay}
      />
      {isPaused && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" onClick={onTogglePlay}>
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black/50">
            <Play size={32} className="text-white ml-1" />
          </div>
        </div>
      )}
      <div className={`absolute top-2 left-2 right-2 flex items-center gap-2 transition-opacity duration-200 ${showControls ? "opacity-100" : "opacity-0"}`}>
        <button onClick={(e) => { e.stopPropagation(); onToggleMute() }} className="flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors">
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      </div>
      {reel.audioUrl && !isMuted && (
        <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-xs text-amber-400">
          <Music size={12} /> <span>Voiceover</span>
        </div>
      )}
    </>
  )
})

export function ReelViewer({
  reels: initialReels,
  onLoadMore,
  hasMore,
}: {
  reels: ReelItem[]
  onLoadMore?: () => void
  hasMore?: boolean
}) {
  const { data: session } = useSession()
  const [reels, setReels] = useState(initialReels)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [likedSet, setLikedSet] = useState<Set<string>>(() => new Set(initialReels.filter((r) => r.isLiked).map((r) => r.id)))
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>(() =>
    Object.fromEntries(initialReels.map((r) => [r.id, r._count.likes]))
  )
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<any[]>([])
  const [commentText, setCommentText] = useState("")
  const [commentLoading, setCommentLoading] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [uploadVideoUrl, setUploadVideoUrl] = useState("")
  const [uploadCaption, setUploadCaption] = useState("")
  const [uploadMusic, setUploadMusic] = useState("")
  const [uploadAudio, setUploadAudio] = useState("")
  const [uploading, setUploading] = useState(false)
  const [muted, setMuted] = useState(true)
  const [paused, setPaused] = useState(false)
  const [volume, setVolume] = useState(1)
  const [showControls, setShowControls] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const controlsTimeout = useRef<ReturnType<typeof setTimeout>>(undefined)
  const touchStartY = useRef(0)
  const current = reels[currentIndex]

  useEffect(() => { setReels(initialReels) }, [initialReels])

  const goNext = useCallback(() => {
    if (currentIndex < reels.length - 1) {
      setCurrentIndex((i) => i + 1)
      setPaused(false)
    } else if (hasMore && onLoadMore) {
      onLoadMore()
    }
  }, [currentIndex, reels.length, hasMore, onLoadMore])

  const goPrev = useCallback(() => {
    if (currentIndex > 0) { setCurrentIndex((i) => i - 1); setPaused(false) }
  }, [currentIndex])

  const handleTouchStart = useCallback((e: React.TouchEvent) => { touchStartY.current = e.touches[0].clientY }, [])
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const diff = e.changedTouches[0].clientY - touchStartY.current
    if (diff < -50) goNext()
    else if (diff > 50) goPrev()
  }, [goNext, goPrev])
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.deltaY > 0) goNext()
    else if (e.deltaY < 0) goPrev()
  }, [goNext, goPrev])

  const toggleMute = useCallback(() => setMuted((m) => !m), [])
  const togglePlayPause = useCallback(() => setPaused((p) => !p), [])

  const handleTap = useCallback(() => {
    setShowControls(true)
    clearTimeout(controlsTimeout.current)
    controlsTimeout.current = setTimeout(() => setShowControls(false), 3000)
  }, [])

  const handleLike = useCallback(async () => {
    if (!session?.user || !current) return
    const id = current.id
    setLikedSet((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
    setLikeCounts((prev) => ({ ...prev, [id]: (prev[id] || 0) + (prev[id] ? -1 : 1) }))
    await toggleReelLike(id)
  }, [session?.user, current])

  const handleComment = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user || !commentText.trim() || !current) return
    setCommentLoading(true)
    const res = await addReelComment(current.id, commentText)
    if (!res.error && res.comment) setComments((prev) => [res.comment, ...prev])
    setCommentText("")
    setCommentLoading(false)
  }, [session?.user, commentText, current])

  const openComments = useCallback(async () => {
    if (!current) return
    setShowComments(true)
    const res = await getReelComments(current.id)
    setComments(res.comments)
  }, [current])

  const handleDelete = useCallback(async () => {
    if (!current || !confirm("Delete this reel?")) return
    await deleteReel(current.id)
    setReels((prev) => prev.filter((r) => r.id !== current.id))
    if (currentIndex >= reels.length - 1 && currentIndex > 0) setCurrentIndex((i) => i - 1)
  }, [current, currentIndex, reels.length])

  const handleShare = useCallback(async () => {
    const url = window.location.origin + "/feed"
    if (navigator.share) { try { await navigator.share({ title: `${current?.user.name}'s reel`, url }) } catch {} }
    else if (navigator.clipboard) { try { await navigator.clipboard.writeText(url) } catch {} }
  }, [current])

  const handleUpload = useCallback(async () => {
    if (!uploadVideoUrl.trim()) return
    setUploading(true)
    const fd = new FormData()
    fd.set("videoUrl", uploadVideoUrl.trim())
    fd.set("caption", uploadCaption)
    if (uploadMusic) fd.set("musicUrl", uploadMusic)
    if (uploadAudio) fd.set("audioUrl", uploadAudio)
    const res = await createReel(fd)
    if (!res.error && res.reel) {
      const { updatedAt, ...reelRest } = res.reel as any
      const newReel: ReelItem = { ...reelRest, audioUrl: null, isLiked: false, _count: { likes: 0, comments: 0 } }
      setReels((prev) => [newReel, ...prev])
      setCurrentIndex(0)
      setShowUpload(false)
      setUploadVideoUrl(""); setUploadCaption(""); setUploadMusic(""); setUploadAudio("")
    }
    setUploading(false)
  }, [uploadVideoUrl, uploadCaption, uploadMusic, uploadAudio])

  // Preload next video
  const nextReel = reels[currentIndex + 1]
  const prevReel = reels[currentIndex - 1]

  if (reels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Music size={48} className="mb-4 text-zinc-700" />
        <p className="text-lg font-medium text-zinc-400 mb-2">No reels yet</p>
        <p className="text-sm text-zinc-600 mb-6">Be the first to share a video</p>
        {session?.user && (
          <button onClick={() => setShowUpload(true)} className="rounded-lg bg-amber-500 px-6 py-3 text-sm font-bold text-black hover:bg-amber-400 transition-all">
            Create Reel
          </button>
        )}
      </div>
    )
  }

  if (!current) return null

  return (
    <>
      {nextReel && <link rel="prefetch" href={nextReel.videoUrl} />}
      {prevReel && <link rel="prefetch" href={prevReel.videoUrl} />}

      <div
        ref={containerRef}
        className="relative h-[calc(100vh-7rem)] overflow-hidden rounded-xl bg-black"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
        onClick={handleTap}
      >
        <div className="relative h-full w-full">
          <ReelCard
            reel={current}
            isActive={true}
            isMuted={muted}
            isPaused={paused}
            volume={volume}
            onToggleMute={toggleMute}
            onTogglePlay={togglePlayPause}
            onLike={handleLike}
            onComment={openComments}
            onShare={handleShare}
            onDelete={handleDelete}
            liked={likedSet.has(current.id)}
            likeCount={likeCounts[current.id] || 0}
            commentCount={current._count.comments}
            sessionUserId={session?.user?.id}
            sessionUser={session?.user}
            showControls={showControls}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

          <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-none">
            <div className="pointer-events-auto">
              <Link href={`/profile/${current.user.id}`} className="flex items-center gap-2 mb-2">
                <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-600 to-purple-700 text-xs font-bold text-white ring-2 ring-zinc-800">
                  {current.user.avatar ? <LazyImage src={current.user.avatar} alt="" className="h-full w-full" /> : current.user.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <span className="text-sm font-semibold text-white">{current.user.name}</span>
              </Link>
              {current.caption && <p className="text-sm text-zinc-200 mb-1 line-clamp-2">{current.caption}</p>}
              {current.musicUrl && <div className="flex items-center gap-1 text-xs text-zinc-400"><Music size={12} /><span>Original audio</span></div>}
              <p className="text-xs text-zinc-500 mt-1">{timeAgo(current.createdAt)}</p>
            </div>
          </div>

          <div className="absolute right-3 bottom-20 flex flex-col items-center gap-4 pointer-events-none">
            <div className="pointer-events-auto flex flex-col items-center gap-1">
              <button onClick={handleLike} className="flex flex-col items-center gap-0.5">
                <div className={`flex h-11 w-11 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm transition-colors ${likedSet.has(current.id) ? "text-red-500" : "text-white hover:text-red-400"}`}>
                  <Heart size={22} fill={likedSet.has(current.id) ? "currentColor" : "none"} />
                </div>
                <span className="text-xs text-white">{likeCounts[current.id] || 0}</span>
              </button>
            </div>
            <div className="pointer-events-auto flex flex-col items-center gap-1">
              <button onClick={openComments} className="flex flex-col items-center gap-0.5">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm text-white hover:text-amber-400 transition-colors"><MessageCircle size={22} /></div>
                <span className="text-xs text-white">{current._count.comments}</span>
              </button>
            </div>
            <div className="pointer-events-auto flex flex-col items-center gap-1">
              <button onClick={handleShare} className="flex h-11 w-11 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm text-white hover:text-blue-400 transition-colors">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" /></svg>
              </button>
            </div>
            {session?.user && session.user.id !== current.userId && (
              <div className="pointer-events-auto">
                <Link href="/messages" className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-500/80 backdrop-blur-sm text-white hover:bg-amber-500 transition-colors"><Send size={18} /></Link>
              </div>
            )}
            {session?.user && (session.user.id === current.userId || (session.user as any).role === "SUPER_ADMIN") && (
              <div className="pointer-events-auto">
                <button onClick={handleDelete} className="flex h-11 w-11 items-center justify-center rounded-full bg-red-500/60 backdrop-blur-sm text-white hover:bg-red-500 transition-colors"><X size={18} /></button>
              </div>
            )}
          </div>

          <div className="absolute top-2 right-2 flex items-center gap-1 text-xs text-zinc-400 bg-black/40 rounded-full px-2 py-1">
            <span>{currentIndex + 1}</span><span>/</span><span>{reels.length}</span>
          </div>
        </div>
      </div>

      {showComments && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60" onClick={() => setShowComments(false)}>
          <div className="w-full max-w-md rounded-t-2xl bg-zinc-900 border border-zinc-800 sm:rounded-2xl max-h-[70vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
              <h3 className="text-sm font-bold text-zinc-100">Comments</h3>
              <button onClick={() => setShowComments(false)} className="text-zinc-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
              {comments.length === 0 ? <p className="text-center text-sm text-zinc-500 py-8">No comments yet</p> : comments.map((c: any) => (
                <div key={c.id} className="flex gap-2">
                  <Link href={`/profile/${c.user.id}`}><div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-600 to-purple-700 text-xs font-bold text-white">{c.user.name?.charAt(0).toUpperCase() || "U"}</div></Link>
                  <div className="min-w-0 flex-1 rounded-lg bg-zinc-800/50 px-3 py-2">
                    <Link href={`/profile/${c.user.id}`} className="text-xs font-semibold text-zinc-100 hover:text-amber-400">{c.user.name}</Link>
                    <p className="text-sm text-zinc-300">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
            {session?.user && (
              <form onSubmit={handleComment} className="border-t border-zinc-800 p-3 flex gap-2">
                <input value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Add a comment..." className="flex-1 rounded-lg bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none ring-1 ring-zinc-700 focus:ring-amber-500" />
                <button type="submit" disabled={commentLoading || !commentText.trim()} className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-black hover:bg-amber-400 disabled:opacity-50">{commentLoading ? "..." : "Send"}</button>
              </form>
            )}
          </div>
        </div>
      )}

      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowUpload(false)}>
          <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-800 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-zinc-100">Create Reel</h3>
              <button onClick={() => setShowUpload(false)} className="text-zinc-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="space-y-3">
              <input value={uploadVideoUrl} onChange={(e) => setUploadVideoUrl(e.target.value)} placeholder="Video URL *" className="w-full rounded-lg bg-zinc-800 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 outline-none ring-1 ring-zinc-700 focus:ring-amber-500" />
              <input value={uploadCaption} onChange={(e) => setUploadCaption(e.target.value)} placeholder="Caption" className="w-full rounded-lg bg-zinc-800 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 outline-none ring-1 ring-zinc-700 focus:ring-amber-500" />
              <input value={uploadMusic} onChange={(e) => setUploadMusic(e.target.value)} placeholder="Music URL (optional)" className="w-full rounded-lg bg-zinc-800 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 outline-none ring-1 ring-zinc-700 focus:ring-amber-500" />
              <input value={uploadAudio} onChange={(e) => setUploadAudio(e.target.value)} placeholder="Voiceover Audio URL (optional)" className="w-full rounded-lg bg-zinc-800 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 outline-none ring-1 ring-zinc-700 focus:ring-amber-500" />
              <button onClick={handleUpload} disabled={uploading || !uploadVideoUrl.trim()} className="w-full rounded-lg bg-amber-500 py-3 text-sm font-bold text-black hover:bg-amber-400 disabled:opacity-50 transition-colors">{uploading ? "Uploading..." : "Post Reel"}</button>
            </div>
          </div>
        </div>
      )}

      {reels.length > 0 && (
        <button onClick={() => setShowUpload(true)} className="w-full mt-2 rounded-lg bg-amber-500/10 border border-amber-500/30 py-2 text-sm font-medium text-amber-400 hover:bg-amber-500/20 transition-colors">+ Create Reel</button>
      )}
    </>
  )
}
