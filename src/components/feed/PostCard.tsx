"use client"

import { useState, memo, useCallback } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Heart, MessageCircle, Share2, Trash2, Bookmark } from "lucide-react"
import { togglePostLike, addPostComment, deletePost, togglePostSave } from "@/app/actions/feed"
import { getPostComments } from "@/app/actions/feed"
import { LazyImage } from "@/components/ui/LazyImage"

interface PostUser {
  id: string
  name: string
  avatar: string | null
}

interface PostCommentItem {
  id: string
  text: string
  createdAt: string | Date
  user: PostUser
}

interface PostData {
  id: string
  type: string
  content: string
  mediaUrls: string | null
  bookId: string | null
  createdAt: string | Date
  userId: string
  user: PostUser
  isLiked: boolean
  isSaved: boolean
  _count: { likes: number; comments: number; saves: number }
  comments: PostCommentItem[]
}

function timeAgo(date: string | Date) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return "just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return new Date(date).toLocaleDateString()
}

const PostCard = memo(function PostCard({
  post,
  onUpdate,
}: {
  post: PostData
  onUpdate?: () => void
}) {
  const { data: session } = useSession()
  const [liked, setLiked] = useState(post.isLiked)
  const [likeCount, setLikeCount] = useState(post._count.likes)
  const [saved, setSaved] = useState(post.isSaved)
  const [saveCount, setSaveCount] = useState(post._count.saves)
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<PostCommentItem[]>(post.comments)
  const [commentText, setCommentText] = useState("")
  const [commentLoading, setCommentLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleLike = useCallback(async () => {
    if (!session?.user) return
    setLiked(!liked)
    setLikeCount((c) => (liked ? c - 1 : c + 1))
    await togglePostLike(post.id)
  }, [session?.user, liked, post.id])

  const handleSave = useCallback(async () => {
    if (!session?.user) return
    setSaved(!saved)
    setSaveCount((c) => (saved ? c - 1 : c + 1))
    await togglePostSave(post.id)
  }, [session?.user, saved, post.id])

  const handleComment = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user || !commentText.trim()) return
    setCommentLoading(true)
    const res = await addPostComment(post.id, commentText)
    if (!res.error && res.comment) {
      setComments((prev) => [res.comment, ...prev])
      setCommentText("")
    }
    setCommentLoading(false)
  }, [session?.user, commentText, post.id])

  const handleDelete = useCallback(async () => {
    if (!confirm("Delete this post?")) return
    setDeleting(true)
    await deletePost(post.id)
    onUpdate?.()
  }, [post.id, onUpdate])

  const loadAllComments = useCallback(async () => {
    if (comments.length < post._count.comments) {
      const res = await getPostComments(post.id)
      setComments(res.comments)
    }
  }, [comments.length, post._count.comments, post.id])

  const isOwner = session?.user?.id === post.userId

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <Link href={`/profile/${post.user.id}`} className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-600 to-purple-700 text-sm font-bold text-white ring-2 ring-zinc-800 group-hover:ring-amber-500 transition-all">
              {post.user.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-100 group-hover:text-amber-400 transition-colors">
                {post.user.name}
              </p>
              <p className="text-xs text-zinc-500">{timeAgo(post.createdAt)}</p>
            </div>
          </Link>

          {isOwner && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-red-900/20 hover:text-red-400 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>

        <p className="mt-3 text-sm text-zinc-200 whitespace-pre-wrap">{post.content}</p>

        <div className="mt-2 flex items-center gap-2">
          <button
            onClick={handleLike}
            className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium transition-colors ${
              liked ? "text-red-500" : "text-zinc-500 hover:text-red-400"
            }`}
          >
            <Heart size={12} fill={liked ? "currentColor" : "none"} />
            {likeCount > 0 && <span className="tabular-nums">{likeCount}</span>}
          </button>
        </div>

        {post.mediaUrls && (() => {
          try {
            const urls = JSON.parse(post.mediaUrls)
            if (urls.length > 0) {
              return (
                <div className={`mt-3 grid gap-2 ${urls.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
                  {urls.map((url: string, i: number) => (
                    <img
                      key={i}
                      src={url}
                      alt=""
                      className="w-full rounded-lg object-cover max-h-96"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
                    />
                  ))}
                </div>
              )
            }
          } catch {}
          return null
        })()}

        {post.bookId && (
          <div className="mt-3 rounded-lg border border-zinc-700 bg-zinc-800/50 p-3">
            <p className="text-xs text-zinc-500 mb-1">Shared Story</p>
            <Link
              href={`/stories/${post.bookId}`}
              className="text-sm font-medium text-amber-500 hover:text-amber-400 transition-colors"
            >
              View Story &rarr;
            </Link>
          </div>
        )}
      </div>

      <div className="flex items-center border-t border-zinc-800 px-2 py-0.5">
        <button
          onClick={() => { setShowComments(!showComments); if (!showComments) loadAllComments() }}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            showComments ? "text-amber-400" : "text-zinc-400 hover:text-amber-400 hover:bg-amber-900/10"
          }`}
        >
          <MessageCircle size={16} />
          <span>Comment</span>
          {post._count.comments > 0 && <span className="tabular-nums">{post._count.comments}</span>}
        </button>

        <button
          onClick={handleSave}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            saved ? "text-amber-500" : "text-zinc-400 hover:text-amber-400 hover:bg-amber-900/10"
          }`}
        >
          <Bookmark size={16} fill={saved ? "currentColor" : "none"} />
          <span>Save</span>
          {saveCount > 0 && <span className="tabular-nums">{saveCount}</span>}
        </button>

        <button
          onClick={async () => {
            const url = `${window.location.origin}/feed`
            if (navigator.share) {
              try { await navigator.share({ title: `${post.user.name}'s post`, url }) } catch {}
            } else if (navigator.clipboard) {
              try { await navigator.clipboard.writeText(url) } catch {}
            }
          }}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 hover:text-blue-400 hover:bg-blue-900/10 transition-colors"
        >
          <Share2 size={16} />
          <span>Share</span>
        </button>

      </div>

      {showComments && (
        <div className="border-t border-zinc-800 p-4">
          {session?.user && (
            <form onSubmit={handleComment} className="mb-4 flex gap-2">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 rounded-lg bg-zinc-800/50 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none ring-1 ring-zinc-700 focus:ring-amber-500"
              />
              <button
                type="submit"
                disabled={commentLoading || !commentText.trim()}
                className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-black hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {commentLoading ? "..." : "Send"}
              </button>
            </form>
          )}

          {comments.length === 0 ? (
            <p className="text-center text-sm text-zinc-500">No comments yet</p>
          ) : (
            <div className="space-y-3">
              {comments.map((c) => (
                <div key={c.id} className="flex gap-2">
                  <Link href={`/profile/${c.user.id}`}>
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-600 to-purple-700 text-xs font-bold text-white">
                      {c.user.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                  </Link>
                  <div className="min-w-0 flex-1 rounded-lg bg-zinc-800/50 px-3 py-2">
                    <Link
                      href={`/profile/${c.user.id}`}
                      className="text-xs font-semibold text-zinc-100 hover:text-amber-400"
                    >
                      {c.user.name}
                    </Link>
                    <p className="text-sm text-zinc-300">{c.text}</p>
                    <p className="mt-0.5 text-[10px] text-zinc-500">{timeAgo(c.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
})

export { PostCard }
