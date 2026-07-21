"use client"

import { useState, useCallback, memo, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Rss, Video } from "lucide-react"
import { CreatePost } from "@/components/feed/CreatePost"
import { PostCard } from "@/components/feed/PostCard"
import { MyDayBar } from "@/components/feed/MyDayBar"
import { ReelViewer } from "@/components/feed/ReelViewer"
import { getFeed, getMyDayStories, getReels } from "@/app/actions/feed"
import { useFeedListener } from "@/hooks/useFirestore"
import { usePolling } from "@/hooks/usePolling"

interface PostUser { id: string; name: string; avatar: string | null }
interface Comment { id: string; text: string; createdAt: string | Date; user: PostUser }
interface PostData {
  id: string; type: string; content: string; mediaUrls: string | null; bookId: string | null
  createdAt: string | Date; userId: string; user: PostUser
  isLiked: boolean; isSaved: boolean
  _count: { likes: number; comments: number; saves: number }
  comments: Comment[]
}
interface StoryUser { id: string; name: string; avatar: string | null }
interface StoryItem { id: string; mediaUrl: string; caption: string | null; createdAt: string | Date; userId: string; user: StoryUser }
interface ReelUser { id: string; name: string; avatar: string | null }
interface ReelItem {
  id: string; videoUrl: string; caption: string | null; musicUrl: string | null; viewCount: number
  createdAt: string | Date; userId: string; user: ReelUser; isLiked: boolean
  _count: { likes: number; comments: number }
}

type Tab = "feed" | "reels"

const TabBar = memo(function TabBar({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  return (
    <div className="sticky top-14 z-30 border-b border-zinc-800 bg-black/80 backdrop-blur-xl">
      <div className="flex items-center max-w-2xl mx-auto">
        <button
          onClick={() => setTab("feed")}
          className={`flex items-center justify-center gap-2 flex-1 py-3 text-sm font-medium transition-colors duration-200 ${
            tab === "feed"
              ? "border-b-2 border-amber-500 text-amber-400"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Rss size={16} />
          Feed
        </button>
        <button
          onClick={() => setTab("reels")}
          className={`flex items-center justify-center gap-2 flex-1 py-3 text-sm font-medium transition-colors duration-200 ${
            tab === "reels"
              ? "border-b-2 border-amber-500 text-amber-400"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Video size={16} />
          Reels
        </button>
      </div>
    </div>
  )
})

export function FeedClient({
  initialPosts, initialNextCursor, initialHasMore,
  initialMyDayStories,
  initialReels, initialReelNextCursor, initialReelHasMore,
}: {
  initialPosts: PostData[]; initialNextCursor: string | null; initialHasMore: boolean
  initialMyDayStories: StoryItem[]
  initialReels: ReelItem[]; initialReelNextCursor: string | null; initialReelHasMore: boolean
  isAuthenticated: boolean
}) {
  const { data: session } = useSession()
  const [tab, setTab] = useState<Tab>("feed")
  const [posts, setPosts] = useState(initialPosts)
  const [nextCursor, setNextCursor] = useState(initialNextCursor)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [loading, setLoading] = useState(false)
  const [myDayStories, setMyDayStories] = useState(initialMyDayStories)
  const [reels, setReels] = useState(initialReels)
  const [reelNextCursor, setReelNextCursor] = useState(initialReelNextCursor)
  const [reelHasMore, setReelHasMore] = useState(initialReelHasMore)
  const { posts: livePosts } = useFeedListener()

  useEffect(() => {
    if (livePosts.length > 0) {
      setPosts((prev) => {
        const existingIds = new Set(prev.map((p) => p.id))
        const newPosts = livePosts.filter((p: any) => !existingIds.has(p.id))
        return newPosts.length > 0 ? [...newPosts, ...prev] : prev
      })
    }
  }, [livePosts])

  const refreshFeed = useCallback(async () => {
    const [feedData, myDayData] = await Promise.all([getFeed(), getMyDayStories()])
    setPosts(feedData.posts as any)
    setNextCursor(feedData.nextCursor)
    setHasMore(feedData.hasMore)
    setMyDayStories(myDayData.stories as any)
  }, [])

  const refreshReels = useCallback(async () => {
    const data = await getReels()
    setReels(data.reels as any)
    setReelNextCursor(data.nextCursor)
    setReelHasMore(data.hasMore)
  }, [])

  // Poll feed every 30s when on posts tab
  usePolling(refreshFeed, 30000, tab === "feed")

  async function loadMorePosts() {
    if (!nextCursor || loading) return
    setLoading(true)
    const data = await getFeed(nextCursor)
    setPosts((prev) => [...prev, ...(data.posts as any)])
    setNextCursor(data.nextCursor)
    setHasMore(data.hasMore)
    setLoading(false)
  }

  async function loadMoreReels() {
    if (!reelNextCursor) return
    const data = await getReels(reelNextCursor)
    setReels((prev) => [...prev, ...(data.reels as any)])
    setReelNextCursor(data.nextCursor)
    setReelHasMore(data.hasMore)
  }

  return (
    <div className="min-h-screen bg-black">
      <TabBar tab={tab} setTab={setTab} />


      <div className="animate-fadeIn">
        {tab === "feed" && (
          <div className="mx-auto max-w-2xl px-4 py-6 animate-fadeIn">
            {session?.user && (
              <div className="mb-6">
                <CreatePost onCreated={refreshFeed} />
              </div>
            )}
            <div className="space-y-4">
              {posts.length === 0 ? (
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 text-center">
                  <p className="text-zinc-400">No posts yet. Be the first to share something!</p>
                </div>
              ) : (
                posts.map((post) => (
                  <PostCard key={post.id} post={post as any} onUpdate={refreshFeed} />
                ))
              )}
              {hasMore && (
                <div className="flex justify-center py-4">
                  <button onClick={loadMorePosts} disabled={loading} className="rounded-lg bg-zinc-800 px-6 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-700 disabled:opacity-50 transition-colors">
                    {loading ? "Loading..." : "Load More"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "reels" && (
          <div className="mx-auto max-w-lg px-4 py-4 animate-fadeIn">
            <ReelViewer reels={reels as any} onLoadMore={loadMoreReels} hasMore={reelHasMore} />
          </div>
        )}
      </div>
    </div>
  )
}
