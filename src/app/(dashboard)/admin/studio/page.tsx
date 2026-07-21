"use client"

import { useState, useEffect } from "react"
import { getPendingApplications, getAllApplications, reviewApplication } from "@/app/actions/studio"
import { Button } from "@/components/ui/Button"
import { BackButton } from "@/components/ui/BackButton"

interface Application {
  id: string; genre: string; totalChapters: number; wordCount: number
  reason: string; visualStyle: string; status: string; createdAt: string
  reviewNotes: string | null; story: { id: string; title: string; cover: string | null }
  author: { id: string; name: string; email: string | null; avatar: string | null }
}

const statusStyles: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  ACCEPTED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  REVISION_REQUESTED: "bg-blue-100 text-blue-700",
}

export default function AdminStudioPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [tab, setTab] = useState<"pending" | "all">("pending")
  const [reviewingId, setReviewingId] = useState<string | null>(null)
  const [reviewNotes, setReviewNotes] = useState("")

  useEffect(() => {
    if (tab === "pending") {
      getPendingApplications().then((a) =>
        setApplications(a.map((app) => ({ ...app, createdAt: app.createdAt.toISOString() })))
      )
    } else {
      getAllApplications().then((a) =>
        setApplications(a.map((app) => ({ ...app, createdAt: app.createdAt.toISOString() })))
      )
    }
  }, [tab])

  async function handleReview(applicationId: string, status: "ACCEPTED" | "REJECTED" | "REVISION_REQUESTED") {
    setReviewingId(applicationId)
    await reviewApplication(applicationId, status, reviewNotes || undefined)
    setApplications((prev) => prev.filter((a) => a.id !== applicationId))
    setReviewingId(null)
    setReviewNotes("")
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <BackButton fallbackHref="/admin" className="mb-4 inline-block" />
      <h1 className="text-2xl font-bold text-amber-700 dark:text-zinc-100">LikhaVerse Studios</h1>
      <p className="mt-1 text-zinc-500">Review and manage cinematic adaptation applications. Super Admin only.</p>

      <div className="mt-6 flex gap-2 border-b pb-2">
        <button
          onClick={() => setTab("pending")}
          className={`px-3 py-1.5 text-sm font-medium ${
            tab === "pending" ? "border-b-2 border-blue-600 text-blue-600" : "text-zinc-500"
          }`}
        >
          Pending Review
        </button>
        <button
          onClick={() => setTab("all")}
          className={`px-3 py-1.5 text-sm font-medium ${
            tab === "all" ? "border-b-2 border-blue-600 text-blue-600" : "text-zinc-500"
          }`}
        >
          All Applications
        </button>
      </div>

      <div className="mt-6 space-y-4">
        {applications.length === 0 ? (
          <p className="text-center py-8 text-zinc-400">No applications.</p>
        ) : (
          applications.map((app) => (
            <div key={app.id} className="rounded-xl border bg-white p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  {app.story.cover && (
                    <img
                      src={app.story.cover}
                      alt=""
                      className="h-16 w-12 flex-shrink-0 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <h2 className="text-lg font-semibold text-zinc-800">{app.story.title}</h2>
                    <p className="text-sm text-zinc-500">
                      by {app.author.name} ({app.author.email})
                    </p>
                  </div>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[app.status] || "bg-zinc-100 text-zinc-600"}`}>
                  {app.status.replace("_", " ")}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-zinc-400">Genre</span>
                  <p className="font-medium">{app.genre}</p>
                </div>
                <div>
                  <span className="text-zinc-400">Visual Style</span>
                  <p className="font-medium">{app.visualStyle}</p>
                </div>
                <div>
                  <span className="text-zinc-400">Chapters</span>
                  <p className="font-medium">{app.totalChapters}</p>
                </div>
                <div>
                  <span className="text-zinc-400">Words</span>
                  <p className="font-medium">{app.wordCount.toLocaleString()}</p>
                </div>
              </div>

              <div className="mt-4">
                <span className="text-sm text-zinc-400">Vision</span>
                <p className="mt-1 text-sm text-zinc-700 whitespace-pre-wrap">{app.reason}</p>
              </div>

              {(app.status === "PENDING" || app.status === "REVISION_REQUESTED") && (
                <div className="mt-6 space-y-3 border-t pt-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Review Notes (optional)</label>
                    <textarea
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      rows={3}
                      className="block w-full rounded-lg border px-3 py-2 text-sm"
                      placeholder="Provide feedback to the author..."
                    />
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={() => handleReview(app.id, "ACCEPTED")}
                      disabled={reviewingId === app.id}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {reviewingId === app.id ? "Processing..." : "Accept"}
                    </Button>
                    <Button
                      onClick={() => handleReview(app.id, "REVISION_REQUESTED")}
                      disabled={reviewingId === app.id}
                      variant="secondary"
                    >
                      Request Revision
                    </Button>
                    <Button
                      onClick={() => handleReview(app.id, "REJECTED")}
                      disabled={reviewingId === app.id}
                      variant="danger"
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
