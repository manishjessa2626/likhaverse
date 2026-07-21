import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getFeed, getMyDayStories, getReels } from "@/app/actions/feed"
import { FeedClient } from "./FeedClient"

export const metadata = { title: "Feed - LikhaVerse" }

export default async function FeedPage() {
  const session = await getServerSession(authOptions)
  const [feedData, myDayData, reelData] = await Promise.all([
    getFeed(),
    getMyDayStories(),
    getReels(),
  ])

  return (
    <FeedClient
      initialPosts={feedData.posts as any[]}
      initialNextCursor={feedData.nextCursor}
      initialHasMore={feedData.hasMore}
      initialMyDayStories={myDayData.stories as any[]}
      initialReels={reelData.reels as any[]}
      initialReelNextCursor={reelData.nextCursor}
      initialReelHasMore={reelData.hasMore}
      isAuthenticated={!!session?.user}
    />
  )
}
