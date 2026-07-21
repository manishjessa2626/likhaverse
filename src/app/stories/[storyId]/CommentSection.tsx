"use client"

import { useActionState } from "react"
import { useSession } from "next-auth/react"
import { addComment, getComments } from "@/app/actions/comments"
import { formatDate } from "@/lib/utils"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/Button"
import Link from "next/link"

interface Comment {
  id: string
  content: string
  createdAt: Date
  user: { id: string; name: string; avatar: string | null }
  replies: {
    id: string
    content: string
    createdAt: Date
    user: { id: string; name: string; avatar: string | null }
  }[]
}

export function CommentSection({ storyId, chapterId }: { storyId: string; chapterId?: string }) {
  const { data: session } = useSession()
  const [state, formAction, pending] = useActionState(
    addComment.bind(null, storyId, chapterId ?? null),
    undefined
  )
  const [comments, setComments] = useState<Comment[]>([])

  useEffect(() => {
    getComments(storyId, chapterId).then(setComments)
  }, [storyId, chapterId, state])

  return (
    <div>
      {!session?.user ? (
        <div className="mb-6 rounded-lg border bg-zinc-50 px-4 py-6 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400">
            Log in
          </Link>{" "}
          to leave a comment.
        </div>
      ) : (
      <form action={formAction} className="mb-6">
        <textarea
          name="content"
          rows={3}
          placeholder="Share your thoughts..."
          className="block w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          required
        />
        {state?.error?.content && (
          <p className="mt-1 text-xs text-red-500">{state.error.content}</p>
        )}
        <div className="mt-2 flex items-center justify-between">
          {state?.message && (
            <p className="text-xs text-green-600">{state.message}</p>
          )}
          <Button type="submit" disabled={pending} size="sm">
            {pending ? "Posting..." : "Post Comment"}
          </Button>
        </div>
      </form>
      )}

      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="rounded-lg border bg-white p-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-zinc-800">
                {comment.user.name}
              </span>
              <span className="text-xs text-zinc-400">
                {formatDate(comment.createdAt)}
              </span>
            </div>
            <p className="mt-1 text-sm text-zinc-700">{comment.content}</p>

            {comment.replies.length > 0 && (
              <div className="mt-3 ml-4 space-y-2 border-l-2 border-zinc-100 pl-4">
                {comment.replies.map((reply) => (
                  <div key={reply.id}>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-zinc-800">
                        {reply.user.name}
                      </span>
                      <span className="text-xs text-zinc-400">
                        {formatDate(reply.createdAt)}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-zinc-600">
                      {reply.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {comments.length === 0 && (
          <p className="text-center text-sm text-zinc-400 py-8">
            No comments yet. Be the first to share your thoughts!
          </p>
        )}
      </div>
    </div>
  )
}
