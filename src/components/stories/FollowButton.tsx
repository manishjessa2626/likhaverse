"use client"

import { toggleFollow, isFollowing, getFollowerCount } from "@/app/actions/follows"
import { useState, useEffect, useTransition } from "react"

export function FollowButton({ authorId }: { authorId: string }) {
  const [following, setFollowing] = useState(false)
  const [followerCount, setFollowerCount] = useState(0)
  const [error, setError] = useState("")
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    Promise.all([
      isFollowing(authorId),
      getFollowerCount(authorId),
    ]).then(([following, count]) => {
      setFollowing(following)
      setFollowerCount(count)
    })
  }, [authorId])

  function handleFollow() {
    const nextFollowing = !following
    const nextCount = nextFollowing ? followerCount + 1 : followerCount - 1
    setFollowing(nextFollowing)
    setFollowerCount(nextCount)
    setError("")
    startTransition(async () => {
      const result = await toggleFollow(authorId)
      if (result?.error) {
        setFollowing(following)
        setFollowerCount(followerCount)
        setError(result.error)
      }
    })
  }

  return (
    <div className="inline-flex flex-col items-center gap-1">
    <button
      onClick={handleFollow}
      disabled={pending}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
        following
          ? "bg-zinc-200 text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600"
          : "bg-blue-600 text-white hover:bg-blue-700"
      }`}
    >
      {following ? (
        <>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Following
        </>
      ) : (
        <>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Follow
        </>
      )}
      {followerCount > 0 && (
        <span className="ml-0.5 text-xs opacity-70">{followerCount}</span>
      )}
    </button>
    {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
