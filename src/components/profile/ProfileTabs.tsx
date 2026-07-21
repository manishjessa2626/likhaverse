"use client"

import { useState } from "react"
import Link from "next/link"
import { Rss, BookOpen, MessageSquare, ExternalLink } from "lucide-react"
import { ProfileMessages } from "./ProfileMessages"
import { PostCard } from "@/components/feed/PostCard"

interface Story {
  id: string; title: string; cover: string | null; description: string | null
  tags: string | null; status: string; viewCount: number
  createdAt: string; updatedAt: string
  _count: { chapters: number; saves: number }
}

interface PostUser {
  id: string; name: string; avatar: string | null
}

interface PostCommentItem {
  id: string; text: string; createdAt: string | Date; user: PostUser
}

interface PostData {
  id: string; type: string; content: string; mediaUrls: string | null; bookId: string | null
  createdAt: string | Date; userId: string; user: PostUser
  isLiked: boolean; isSaved: boolean
  _count: { likes: number; comments: number; saves: number }
  comments: PostCommentItem[]
}

interface ContinueReadingItem {
  storyId: string; chapterId: string; scrollPosition: number | null; updatedAt: string
  story: { id: string; title: string; cover: string | null; author: { id: string; name: string }; _count: { chapters: number } }
  chapter: { id: string; title: string; number: number }
}

interface SavedItem {
  id: string; storyId: string; savedAt: string
  story: { id: string; title: string; cover: string | null; tags: string | null; status: string; wordCount: number; author: { id: string; name: string; avatar: string | null }; _count: { chapters: number; storyLikes: number } }
}

interface ProfileTabsProps {
  isOwner: boolean
  stories: { published: Story[]; drafts?: Story[] }
  continueReading?: ContinueReadingItem[]
  savedStories?: SavedItem[]
  userName: string
  userBio: string | null
  userEmail: string | null
  joinedAt: string
  canWrite: boolean
  canFilm: boolean
  userRole: string
  profileUserId: string
  profilePosts: PostData[]
}

export function ProfileTabs({
  isOwner, stories, continueReading, savedStories,
  userName, userBio, userEmail, joinedAt, canWrite, canFilm, userRole,
  profileUserId, profilePosts,
}: ProfileTabsProps) {
  const [tab, setTab] = useState<"posts" | "stories" | "messages">("stories")

  const tabs = [
    { key: "posts" as const, label: "Feed", icon: Rss },
    { key: "stories" as const, label: "Stories", icon: BookOpen },
    ...(isOwner ? [{ key: "messages" as const, label: "Messages", icon: MessageSquare }] : []),
  ]

  return (
    <div>
      <div className="flex border-b border-zinc-800 mb-6">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 flex-1 pb-3 text-sm font-medium transition-colors ${
              tab === t.key
                ? "border-b-2 border-amber-500 text-amber-400"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <t.icon size={16} />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "posts" && (
        <div className="space-y-4">
          {profilePosts.length === 0 ? (
            <div className="text-center py-16">
              <Rss size={40} className="mx-auto mb-3 text-zinc-700" />
              <p className="text-zinc-500 text-sm">{isOwner ? "You haven't posted anything yet" : "No posts yet"}</p>
            </div>
          ) : (
            profilePosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))
          )}
        </div>
      )}

      {tab === "stories" && (
        <div className="space-y-4">
          {stories.published.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen size={40} className="mx-auto mb-3 text-zinc-700" />
              <p className="text-zinc-500 text-sm">No stories yet</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-zinc-400">Published Stories</h3>
                <Link href="/library" className="text-xs text-amber-500 hover:text-amber-400 flex items-center gap-1">
                  Library <ExternalLink size={10} />
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {stories.published.map((s) => (
                  <Link
                    key={s.id}
                    href={`/stories/${s.id}`}
                    className="group rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden hover:border-zinc-700 transition-colors"
                  >
                    <div className="aspect-[3/4] bg-zinc-800 overflow-hidden">
                      {s.cover ? (
                        <img src={s.cover} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-zinc-700 text-sm">No Cover</div>
                      )}
                    </div>
                    <div className="p-2">
                      <p className="text-xs font-medium text-zinc-200 truncate">{s.title}</p>
                      <p className="text-[10px] text-zinc-600">{s._count.chapters} chapters</p>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {tab === "messages" && isOwner && (
        <ProfileMessages
          isOwner
          profileUserId={profileUserId}
          profileName={userName}
        />
      )}
    </div>
  )
}
