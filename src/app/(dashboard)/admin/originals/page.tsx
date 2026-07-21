"use client"

import { useState, useEffect } from "react"
import { getAllStoriesForOriginals, toggleOriginal } from "@/app/actions/originals"
import { Button } from "@/components/ui/Button"
import { BackButton } from "@/components/ui/BackButton"

interface Story {
  id: string; title: string; original: boolean; status: string; viewCount: number
  author: { name: string }
}

export default function OriginalsPage() {
  const [stories, setStories] = useState<Story[]>([])

  useEffect(() => {
    getAllStoriesForOriginals().then(setStories)
  }, [])

  async function handleToggle(storyId: string) {
    const result = await toggleOriginal(storyId)
    setStories((prev) =>
      prev.map((s) =>
        s.id === storyId ? { ...s, original: !s.original } : s
      )
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <BackButton fallbackHref="/admin" className="mb-4 inline-block" />
      <h1 className="text-2xl font-bold text-amber-700 dark:text-zinc-100">🎬 LikhaVerse Originals</h1>
      <p className="mt-1 text-zinc-500">Curate featured stories as LikhaVerse Originals. Only Super Admin can manage these.</p>

      <div className="mt-8 overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-zinc-500">Title</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-500">Author</th>
              <th className="px-4 py-3 text-center font-medium text-zinc-500">Status</th>
              <th className="px-4 py-3 text-right font-medium text-zinc-500">Views</th>
              <th className="px-4 py-3 text-center font-medium text-zinc-500">Original</th>
              <th className="px-4 py-3 text-center font-medium text-zinc-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {stories.map((story) => (
              <tr key={story.id} className={`hover:bg-zinc-50 ${story.original ? "bg-amber-50" : ""}`}>
                <td className="px-4 py-3 font-medium text-zinc-800">{story.title}</td>
                <td className="px-4 py-3 text-zinc-500">{story.author.name}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    story.status === "PUBLISHED" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                  }`}>{story.status}</span>
                </td>
                <td className="px-4 py-3 text-right text-zinc-500">{story.viewCount}</td>
                <td className="px-4 py-3 text-center">
                  {story.original ? (
                    <span className="text-amber-600 font-medium">🎬 Original</span>
                  ) : (
                    <span className="text-zinc-300">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <Button
                    size="sm"
                    variant={story.original ? "secondary" : "primary"}
                    onClick={() => handleToggle(story.id)}
                  >
                    {story.original ? "Remove" : "Make Original"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
