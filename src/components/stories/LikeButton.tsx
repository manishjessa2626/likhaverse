"use client"

import { hasLikedStory, getStoryLikeCount, toggleStoryLike } from "@/app/actions/likes"
import { useState, useEffect, useTransition } from "react"

export function LikeButton({ storyId }: { storyId: string }) {
  const [liked, setLiked] = useState(false)
  const [count, setCount] = useState(0)
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    Promise.all([
      hasLikedStory(storyId),
      getStoryLikeCount(storyId),
    ]).then(([liked, count]) => {
      setLiked(liked)
      setCount(count)
    })
  }, [storyId])

  function handleLike() {
    const nextLiked = !liked
    const nextCount = nextLiked ? count + 1 : count - 1
    setLiked(nextLiked)
    setCount(nextCount)
    startTransition(async () => {
      const result = await toggleStoryLike(storyId)
      if (result?.error) {
        setLiked(liked)
        setCount(count)
      }
    })
  }

  return (
    <button
      onClick={handleLike}
      disabled={pending}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
        liked
          ? "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400"
          : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
      }`}
    >
      <svg
        className="h-4 w-4"
        fill={liked ? "currentColor" : "none"}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      {count > 0 && <span>{count}</span>}
      <span className="sr-only">Like</span>
    </button>
  )
}
