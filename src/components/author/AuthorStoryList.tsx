"use client"

import { useState } from "react"
import Link from "next/link"

interface Story {
  id: string
  title: string
  description: string | null
  cover: string | null
  status: string
  tags: string | null
  viewCount: number
  wordCount: number
  createdAt: string
  updatedAt: string
  studioBadge: boolean
  completedBadge: boolean
  _count: { chapters: number; saves: number }
}

export function AuthorStoryList({ stories }: { stories: Story[] }) {
  const [tab, setTab] = useState<"all" | "published" | "draft">("all")

  const filtered =
    tab === "all"
      ? stories
      : stories.filter((s) =>
          tab === "published"
            ? s.status === "PUBLISHED" || s.status === "COMPLETED"
            : s.status === "DRAFT",
        )

  return (
    <div>
      {/* === Tab Bar === */}
      <div className="flex border-b border-zinc-800 mb-5">
        <button
          onClick={() => setTab("all")}
          className={`pb-3 px-1 text-sm font-medium transition-colors mr-6 ${
            tab === "all"
              ? "border-b-2 border-blue-500 text-blue-400"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          All Stories ({stories.length})
        </button>
        <button
          onClick={() => setTab("published")}
          className={`pb-3 px-1 text-sm font-medium transition-colors mr-6 ${
            tab === "published"
              ? "border-b-2 border-blue-500 text-blue-400"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Published (
          {stories.filter((s) => s.status === "PUBLISHED" || s.status === "COMPLETED").length}
          )
        </button>
        <button
          onClick={() => setTab("draft")}
          className={`pb-3 px-1 text-sm font-medium transition-colors ${
            tab === "draft"
              ? "border-b-2 border-blue-500 text-blue-400"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Drafts ({stories.filter((s) => s.status === "DRAFT").length})
        </button>
      </div>

      {/* === Story List === */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-sm text-zinc-600">
            {tab === "draft"
              ? "No drafts yet"
              : tab === "published"
                ? "No published stories yet"
                : "No stories yet"}
          </p>
          {stories.length === 0 && (
            <Link
              href="/author/stories/new"
              className="mt-3 inline-block text-sm font-medium text-blue-500 hover:text-blue-400"
            >
              Create your first story
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((story) => (
            <Link
              key={story.id}
              href={"/author/stories/" + story.id + "/edit"}
              className="block rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 hover:bg-zinc-800/50 transition-colors group"
            >
              <div className="flex items-start gap-4">
                {/* Cover thumbnail */}
                <div className="w-14 h-20 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0">
                  {story.cover ? (
                    <img src={story.cover} alt={story.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
                      <span className="text-lg font-bold text-zinc-700">{story.title.charAt(0)}</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-zinc-200 group-hover:text-blue-400 transition-colors">
                      {story.title}
                    </h3>
                    {story.studioBadge && (
                      <span className="rounded bg-purple-900/50 px-1.5 py-0.5 text-[10px] font-medium text-purple-400 border border-purple-500/30">
                        Studio
                      </span>
                    )}
                    {story.completedBadge && (
                      <span className="rounded bg-blue-900/50 px-1.5 py-0.5 text-[10px] font-medium text-blue-400 border border-blue-500/30">
                        Complete
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-600 mt-0.5">
                    {story._count.chapters} chapters · {story.wordCount.toLocaleString()} words · {story.viewCount} views
                  </p>
                  {story.description && (
                    <p className="text-xs text-zinc-600 mt-1 line-clamp-1">{story.description}</p>
                  )}
                </div>

                {/* Status badge + arrow */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${
                      story.status === "PUBLISHED"
                        ? "bg-green-900/30 text-green-400 border border-green-500/30"
                        : story.status === "COMPLETED"
                          ? "bg-blue-900/30 text-blue-400 border border-blue-500/30"
                          : "bg-zinc-800 text-zinc-500 border border-zinc-700"
                    }`}
                  >
                    {story.status}
                  </span>
                  <svg className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
