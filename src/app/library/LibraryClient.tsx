"use client"

import { useState } from "react"
import Link from "next/link"
import { BookOpen, Pencil, Clapperboard, ExternalLink, Bell, BellOff, List, Heart, Plus, Sparkles, Lock, Film, ScrollText, Monitor, FileAudio, ChevronLeft } from "lucide-react"
import { toggleReminder } from "@/app/actions/library"
import { VoiceRecorder } from "@/components/studio/VoiceRecorder"
import { BackButton } from "@/components/ui/BackButton"

type Tab = "reading" | "writing" | "studio"

interface LibraryData {
  userId: string
  role: string
  canWrite: boolean
  canUseStudio: boolean
  continueReading: Array<{
    storyId: string; chapterId: string
    story: { id: string; title: string; cover: string | null; author: { id: string; name: string }; _count: { chapters: number } }
    chapter: { id: string; title: string; number: number }
  }>
  saves: Array<{
    id: string; storyId: string
    story: { id: string; title: string; cover: string | null; tags: string | null; status: string; wordCount: number; author: { id: string; name: string }; _count: { chapters: number; storyLikes: number; saves: number } }
  }>
  reminders: Array<{
    storyId: string
    story: { id: string; title: string; cover: string | null; author: { name: string } }
  }>
  authoredStories: Array<{
    id: string; title: string; cover: string | null; status: string; viewCount: number
    createdAt: string; updatedAt: string
    _count: { chapters: number; saves: number }
    author: { id: string; name: string; avatar: string | null }
  }>
}

const tabs: { key: Tab; label: string; icon: any }[] = [
  { key: "reading", label: "Reading", icon: BookOpen },
  { key: "writing", label: "Writing", icon: Pencil },
  { key: "studio", label: "Studio", icon: Clapperboard },
]

export function LibraryClient({ data }: { data: LibraryData }) {
  const [tab, setTab] = useState<Tab>("reading")
  const [showReadingList, setShowReadingList] = useState(false)
  const [showFavorites, setShowFavorites] = useState(false)
  const [showSaved, setShowSaved] = useState(false)

  const favorites = data.saves.filter((s) => s.story._count.storyLikes > 0)

  return (
    <main className="min-h-screen bg-black">
      <div className="mx-auto max-w-5xl px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link
            href="/profile"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200 transition-all"
          >
            <ChevronLeft size={18} />
          </Link>
          <h1 className="text-xl font-bold text-zinc-100">Library</h1>
        </div>

        {/* 3D Tab Bar */}
        <div className="flex gap-2 mb-8">
          {tabs.map((t) => {
            const isActive = tab === t.key
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`relative flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-b from-amber-500/20 to-amber-500/5 text-amber-400 shadow-[inset_0_1px_0_0_rgba(251,191,36,0.3),0_4px_12px_rgba(251,191,36,0.1)] border border-amber-500/30"
                    : "bg-zinc-900/50 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 border border-zinc-800 hover:border-zinc-700"
                }`}
              >
                <t.icon size={16} className={isActive ? "text-amber-400" : ""} />
                {t.label}
                {isActive && (
                  <span className="absolute -bottom-px left-1/2 -translate-x-1/2 w-12 h-0.5 bg-amber-500 rounded-full" />
                )}
              </button>
            )
          })}
        </div>

        {/* READING TAB */}
        {tab === "reading" && (
          <div className="space-y-8 animate-fadeIn">
            {/* Continue Reading - Horizontal Scroll */}
            <section>
              <h2 className="text-lg font-semibold text-zinc-200 mb-4">Continue Reading</h2>
              {data.continueReading.length === 0 ? (
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 text-center">
                  <BookOpen size={36} className="mx-auto mb-3 text-zinc-700" />
                  <p className="text-zinc-400">No stories in progress</p>
                  <Link href="/stories" className="mt-3 inline-block text-sm text-amber-500 hover:text-amber-400">
                    Browse Stories
                  </Link>
                </div>
              ) : (
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory">
                  {data.continueReading.map((item) => (
                    <Link
                      key={item.storyId}
                      href={`/stories/${item.storyId}/chapter/${item.chapterId}`}
                      className="group flex-shrink-0 w-40 snap-start"
                    >
                      <div className="aspect-[3/4] rounded-xl bg-zinc-800 overflow-hidden mb-2">
                        {item.story.cover ? (
                          <img src={item.story.cover} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-zinc-700 text-sm">No Cover</div>
                        )}
                      </div>
                      <p className="text-sm font-medium text-zinc-200 truncate group-hover:text-amber-400 transition-colors">{item.story.title}</p>
                      <p className="text-xs text-zinc-600 truncate">Ch. {item.chapter.number}</p>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            {/* My Reading List */}
            <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-zinc-200">My Reading List</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setShowSaved(true); setShowFavorites(false) }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      showSaved ? "bg-amber-500/20 text-amber-400 border border-amber-500/40" : "text-zinc-500 hover:text-zinc-300 border border-zinc-800"
                    }`}
                  >
                    Saved
                  </button>
                  <button
                    onClick={() => { setShowFavorites(true); setShowSaved(false) }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
                      showFavorites ? "bg-amber-500/20 text-amber-400 border border-amber-500/40" : "text-zinc-500 hover:text-zinc-300 border border-zinc-800"
                    }`}
                  >
                    Favorites ❤️
                  </button>
                </div>
              </div>

              {showSaved && (
                <div className="space-y-3">
                  {data.saves.length === 0 ? (
                    <p className="text-sm text-zinc-500 text-center py-6">No saved stories yet</p>
                  ) : (
                    data.saves.map((s) => (
                      <div key={s.id} className="flex items-center gap-4 rounded-lg bg-zinc-800/40 p-3">
                        <div className="w-12 h-16 shrink-0 rounded-lg bg-zinc-700 overflow-hidden">
                          {s.story.cover ? <img src={s.story.cover} alt="" className="w-full h-full object-cover" /> : null}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link href={`/stories/${s.story.id}`} className="text-sm font-medium text-zinc-200 hover:text-amber-400 truncate block">
                            {s.story.title}
                          </Link>
                          <p className="text-xs text-zinc-500">{s.story.author.name} · {s.story._count.chapters} chapters</p>
                        </div>
                        <button
                          onClick={async () => { await toggleReminder(s.story.id); window.location.reload() }}
                          className={`shrink-0 transition-colors ${
                            data.reminders.some((r) => r.storyId === s.story.id)
                              ? "text-amber-500 hover:text-amber-400"
                              : "text-zinc-600 hover:text-zinc-400"
                          }`}
                          title={data.reminders.some((r) => r.storyId === s.story.id) ? "Reminder ON" : "Enable reminder"}
                        >
                          {data.reminders.some((r) => r.storyId === s.story.id) ? <Bell size={16} /> : <BellOff size={16} />}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}

              {showFavorites && (
                <div className="space-y-3">
                  {favorites.length === 0 ? (
                    <p className="text-sm text-zinc-500 text-center py-6">No favorites yet</p>
                  ) : (
                    favorites.map((s) => (
                      <div key={s.id} className="flex items-center gap-4 rounded-lg bg-zinc-800/40 p-3">
                        <div className="w-12 h-16 shrink-0 rounded-lg bg-zinc-700 overflow-hidden">
                          {s.story.cover ? <img src={s.story.cover} alt="" className="w-full h-full object-cover" /> : null}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link href={`/stories/${s.story.id}`} className="text-sm font-medium text-zinc-200 hover:text-amber-400 truncate block">
                            {s.story.title}
                          </Link>
                          <p className="text-xs text-zinc-500">{s.story.author.name}</p>
                        </div>
                        <span className="shrink-0 text-sm">❤️</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </section>
          </div>
        )}

        {/* WRITING TAB */}
        {tab === "writing" && (
          <div className="space-y-8 animate-fadeIn">
            {/* Your Stories */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-zinc-200">Your Stories</h2>
                <Link
                  href="/write/new"
                  className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-black hover:bg-amber-400 transition-colors"
                >
                  <Plus size={14} />
                  Create New Story
                </Link>
              </div>

              {data.authoredStories.length === 0 ? (
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 text-center">
                  <Pencil size={36} className="mx-auto mb-3 text-zinc-700" />
                  <p className="text-zinc-400">You haven't created any stories yet</p>
                  <Link href="/write/new" className="mt-3 inline-block text-sm text-amber-500 hover:text-amber-400">
                    Write your first story
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {data.authoredStories.map((s) => (
                    <Link
                      key={s.id}
                      href={`/write/${s.id}`}
                      className="flex items-center gap-4 rounded-lg border border-zinc-800 bg-zinc-900/30 p-3 hover:border-zinc-700 hover:bg-zinc-800/50 transition-all"
                    >
                      <div className="w-10 h-14 shrink-0 rounded bg-zinc-700 overflow-hidden">
                        {s.cover ? <img src={s.cover} alt="" className="w-full h-full object-cover" /> : <div className="flex h-full items-center justify-center text-zinc-600 text-xs">NC</div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-200 truncate">{s.title}</p>
                        <p className="text-xs text-zinc-500">{s._count.chapters} chapters · {s._count.saves} saves</p>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${
                        s.status === "PUBLISHED" ? "bg-green-900/50 text-green-400" :
                        s.status === "DRAFT" ? "bg-zinc-800 text-zinc-400" :
                        "bg-blue-900/50 text-blue-400"
                      }`}>{s.status}</span>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            {/* Writing Tools */}
            <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
              <div className="flex items-center gap-2 mb-5">
                <h2 className="text-lg font-semibold text-zinc-200">Writing Tools</h2>
                {!data.canWrite && <Lock size={14} className="text-zinc-600" />}
              </div>

              {data.canWrite ? (
                <div className="space-y-3">
                  <Link
                    href="/write/new?tool=ai"
                    className="flex items-center gap-4 rounded-lg border border-zinc-700 bg-zinc-800/40 p-4 hover:border-amber-500/40 hover:bg-zinc-800 transition-all"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/20 shrink-0">
                      <Sparkles size={20} className="text-amber-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-200">AI Writer</p>
                      <p className="text-xs text-zinc-500">Let AI help write your story</p>
                    </div>
                  </Link>
                  <Link
                    href="/write/new?tool=idea"
                    className="flex items-center gap-4 rounded-lg border border-zinc-700 bg-zinc-800/40 p-4 hover:border-amber-500/40 hover:bg-zinc-800 transition-all"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20 shrink-0">
                      <Sparkles size={20} className="text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-200">Idea Generator</p>
                      <p className="text-xs text-zinc-500">Generate story ideas and plots</p>
                    </div>
                  </Link>
                </div>
              ) : (
                <div className="rounded-lg bg-zinc-800/30 p-6 text-center">
                  <Lock size={28} className="mx-auto mb-3 text-zinc-600" />
                  <p className="text-sm text-zinc-500 mb-1">VIP GOLD Feature</p>
                  <p className="text-xs text-zinc-600 mb-4">Upgrade to unlock AI Writing Tools</p>
                  <Link href="/settings/accounts" className="inline-block rounded-lg bg-amber-500 px-5 py-2 text-sm font-medium text-black hover:bg-amber-400 transition-colors">
                    Upgrade Now
                  </Link>
                </div>
              )}
            </section>
          </div>
        )}

        {/* STUDIO TAB */}
        {tab === "studio" && (
          <div className="space-y-6 animate-fadeIn">
            {data.canUseStudio ? (
              <>
                {/* AI Tools Section */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
                  <h3 className="text-base font-semibold text-zinc-200 mb-4">AI Studio Tools</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button className="flex items-center gap-3 rounded-lg border border-zinc-700 bg-zinc-800/50 p-4 hover:border-amber-500/40 hover:bg-zinc-800 transition-colors text-left">
                      <Sparkles size={20} className="text-amber-500 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-zinc-200">AI Script Generator</p>
                        <p className="text-xs text-zinc-500">Generate film scripts with AI</p>
                      </div>
                    </button>
                    <button className="flex items-center gap-3 rounded-lg border border-zinc-700 bg-zinc-800/50 p-4 hover:border-amber-500/40 hover:bg-zinc-800 transition-colors text-left">
                      <Film size={20} className="text-purple-500 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-zinc-200">AI Scenario Generator</p>
                        <p className="text-xs text-zinc-500">Create scenarios for your films</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Existing Studio sections */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
                  <h3 className="text-base font-semibold text-zinc-200 mb-4">Production Tools</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button className="flex items-center gap-3 rounded-lg border border-zinc-700 bg-zinc-800/50 p-4 hover:border-amber-500/40 hover:bg-zinc-800 transition-colors text-left">
                      <Monitor size={20} className="text-blue-500 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-zinc-200">Screen Recorder</p>
                        <p className="text-xs text-zinc-500">Record your screen for tutorials</p>
                      </div>
                    </button>
                    <button className="flex items-center gap-3 rounded-lg border border-zinc-700 bg-zinc-800/50 p-4 hover:border-amber-500/40 hover:bg-zinc-800 transition-colors text-left">
                      <FileAudio size={20} className="text-green-500 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-zinc-200">Voice Recorder</p>
                        <p className="text-xs text-zinc-500">Record audio narration</p>
                      </div>
                    </button>
                  </div>
                </div>

                <VoiceRecorder />
              </>
            ) : (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-12 text-center">
                <Lock size={40} className="mx-auto mb-4 text-zinc-700" />
                <p className="text-lg font-medium text-zinc-400 mb-2">Studio Access Restricted</p>
                <p className="text-sm text-zinc-600 mb-6">Only Administrators can access the Studio</p>
                <p className="text-xs text-zinc-700">Contact an admin to request access</p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
