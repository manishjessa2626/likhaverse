import Link from "next/link"
import { formatDate } from "@/lib/utils"

interface StoryCardProps {
  story: {
    id: string
    title: string
    description: string | null
    cover: string | null
    tags: string | null
    wordCount: number
    createdAt: Date
    author: { id: string; name: string; role?: string }
    _count: { chapters: number; saves?: number }
  }
}

export function StoryCard({ story }: StoryCardProps) {
  const isFounder = story.author?.role === "SUPER_ADMIN"

  return (
    <Link
      href={"/stories/" + story.id}
      className="group block rounded-xl border border-indigo-100/50 bg-white dark:bg-zinc-800 dark:border-zinc-700 p-4 shadow-md shadow-indigo-100/30 dark:shadow-zinc-900/50 transition-all duration-200 hover:shadow-xl hover:shadow-indigo-200/40 dark:hover:shadow-zinc-900 hover:-translate-y-0.5"
    >
      <div className="aspect-[3/4] rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center text-zinc-400 dark:text-zinc-500 mb-3 overflow-hidden">
        {story.cover ? (
          <img src={story.cover} alt={story.title} className="h-full w-full object-cover" />
        ) : (
          <span className="text-3xl">{story.title.charAt(0)}</span>
        )}
      </div>

      <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400">
        {story.title}
      </h3>

      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
        by {story.author.name}
        {isFounder && <span className="ml-1" title="Founder">👑</span>}
      </p>

      {story.description && (
        <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500 line-clamp-2">
          {story.description}
        </p>
      )}

      <div className="mt-2 flex flex-wrap gap-1.5">
        {story.tags?.split(",").slice(0, 3).map((tag, i) => (
          <span
            key={tag}
            className={`rounded-md px-2 py-0.5 text-xs ${
              i % 3 === 0
                ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300"
                : i % 3 === 1
                  ? "bg-purple-50 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300"
                  : "bg-pink-50 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300"
            }`}
          >
            {tag.trim()}
          </span>
        ))}
      </div>

      <div className="mt-2 flex items-center gap-3 text-xs text-zinc-400 dark:text-zinc-500">
        <span>{story._count.chapters} chapters</span>
        <span>{formatDate(story.createdAt)}</span>
      </div>
    </Link>
  )
}
