"use client"

import { useState } from "react"
import {
  Users,
  Trophy,
  Video,
  Calendar,
  Sparkles,
  Plus,
  X,
  Loader2,
  CheckCircle2,
  Clock,
  UsersRound,
} from "lucide-react"
import {
  createClub,
  joinClub,
  leaveClub,
  createChallenge,
  joinChallenge,
  createLiveSession,
  registerForEvent,
} from "@/app/actions/community"

// ─── Mini Modal ───

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl border border-purple-200/60 bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-zinc-800">{title}</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ─── Section Wrapper ───

function Section({ icon, title, action, children }: { icon: React.ReactNode; title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-purple-200/60 bg-white/70 p-4 shadow-sm dark:border-zinc-700/60 dark:bg-zinc-800/70">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-purple-600 dark:text-zinc-400">{icon}</span>
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100">{title}</h3>
        </div>
        {action}
      </div>
      {children}
    </div>
  )
}

// ─── Main ───

export function CommunityHub({ clubs, challenges, sessions, events, myClubs }: { clubs: any[]; challenges: any[]; sessions: any[]; events: any[]; myClubs: any[] }) {
  const [activeTab, setActiveTab] = useState("clubs")
  const [showCreate, setShowCreate] = useState(false)
  const [createType, setCreateType] = useState<"club" | "challenge" | "session">("club")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  // Create form state
  const [formName, setFormName] = useState("")
  const [formDesc, setFormDesc] = useState("")
  const [formPrompt, setFormPrompt] = useState("")
  const [formType, setFormType] = useState("WRITING")
  const [formDate, setFormDate] = useState("")
  const [formEndDate, setFormEndDate] = useState("")
  const [formDuration, setFormDuration] = useState("60")

  const handleCreate = async () => {
    setLoading(true)
    setMessage(null)
    try {
      if (createType === "club") {
        await createClub(formName, formDesc, formType)
      } else if (createType === "challenge") {
        if (!formDate || !formEndDate) { setMessage("Start and end dates required"); setLoading(false); return }
        await createChallenge(formName, formDesc, formPrompt || null, formType, formDate, formEndDate)
      } else if (createType === "session") {
        if (!formDate) { setMessage("Date required"); setLoading(false); return }
        await createLiveSession(formName, formDesc || null, formType, formDate, parseInt(formDuration))
      }
      setShowCreate(false)
      setFormName("")
      setFormDesc("")
      setFormPrompt("")
      setFormDate("")
      setFormEndDate("")
      setFormDuration("60")
    } catch (e: any) {
      setMessage(e.message)
    }
    setLoading(false)
  }

  const tabs = [
    { id: "clubs", label: "Writing Clubs", icon: <UsersRound size={14} />, count: clubs.length },
    { id: "challenges", label: "Challenges", icon: <Trophy size={14} />, count: challenges.length },
    { id: "sessions", label: "Live Sessions", icon: <Video size={14} />, count: sessions.length },
    { id: "events", label: "Events", icon: <Calendar size={14} />, count: events.length },
  ]

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 text-white shadow-md">
              <Users size={18} />
            </span>
            <div>
              <h1 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">Community</h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Connect with writers, readers, and creators</p>
            </div>
          </div>
          <button
            onClick={() => { setCreateType("club"); setShowCreate(true) }}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:from-purple-500 hover:to-violet-500"
          >
            <Plus size={16} />
            Create
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? "bg-purple-100 text-purple-800 dark:bg-zinc-700 dark:text-zinc-100"
                : "text-zinc-500 hover:bg-purple-50 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            {tab.icon}
            {tab.label}
            <span className="rounded-full bg-zinc-200 px-1.5 py-0.5 text-[9px] dark:bg-zinc-700">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Message */}
      {message && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-400">
          {message}
        </div>
      )}

      {/* ── CLUBS TAB ── */}
      {activeTab === "clubs" && (
        <div className="space-y-4">
          {/* My Clubs */}
          {myClubs.length > 0 && (
            <Section icon={<UsersRound size={16} />} title="My Clubs">
              <div className="grid gap-2 sm:grid-cols-2">
                {myClubs.map((club: any) => (
                  <ClubCard key={club.id} club={club} />
                ))}
              </div>
            </Section>
          )}

          {/* All Clubs */}
          <Section
            icon={<Sparkles size={16} />}
            title="Discover Clubs"
            action={
              <button onClick={() => { setCreateType("club"); setShowCreate(true) }} className="flex items-center gap-1 text-[10px] text-purple-600 hover:text-purple-500">
                <Plus size={10} /> New Club
              </button>
            }
          >
            {clubs.length === 0 ? (
              <p className="text-xs text-zinc-400 dark:text-zinc-500">No clubs yet. Be the first to create one!</p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {clubs.map((club: any) => (
                  <ClubCard key={club.id} club={club} />
                ))}
              </div>
            )}
          </Section>
        </div>
      )}

      {/* ── CHALLENGES TAB ── */}
      {activeTab === "challenges" && (
        <Section
          icon={<Trophy size={16} />}
          title="Writing Challenges"
          action={
            <button onClick={() => { setCreateType("challenge"); setShowCreate(true) }} className="flex items-center gap-1 text-[10px] text-purple-600 hover:text-purple-500">
              <Plus size={10} /> New Challenge
            </button>
          }
        >
          {challenges.length === 0 ? (
            <p className="text-xs text-zinc-400 dark:text-zinc-500">No active challenges right now</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {challenges.map((ch: any) => (
                <div key={ch.id} className="rounded-lg border border-purple-200/60 bg-white/50 p-3 dark:border-zinc-700/60 dark:bg-zinc-800/50">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-100">{ch.title}</h4>
                      <p className="mt-0.5 text-[10px] text-zinc-500 dark:text-zinc-400 line-clamp-2">{ch.description}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-medium ${
                      ch.type === "WRITING" ? "bg-purple-100 text-purple-700" :
                      ch.type === "READING" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"
                    }`}>{ch.type}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[9px] text-zinc-400 dark:text-zinc-500">
                      <span>by {ch.owner?.name}</span>
                      <span>·</span>
                      <span>{ch._count?.participants || 0} joined</span>
                    </div>
                    <button onClick={() => joinChallenge(ch.id)} className="rounded-lg bg-purple-600 px-2.5 py-1 text-[9px] font-semibold text-white hover:bg-purple-500">Join</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>
      )}

      {/* ── LIVE SESSIONS TAB ── */}
      {activeTab === "sessions" && (
        <Section
          icon={<Video size={16} />}
          title="Upcoming Live Sessions"
          action={
            <button onClick={() => { setCreateType("session"); setShowCreate(true) }} className="flex items-center gap-1 text-[10px] text-purple-600 hover:text-purple-500">
              <Plus size={10} /> Host Session
            </button>
          }
        >
          {sessions.length === 0 ? (
            <p className="text-xs text-zinc-400 dark:text-zinc-500">No upcoming live sessions</p>
          ) : (
            <div className="space-y-2">
              {sessions.map((s: any) => (
                <div key={s.id} className="flex items-center justify-between rounded-lg border border-purple-200/60 bg-white/50 p-3 dark:border-zinc-700/60 dark:bg-zinc-800/50">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-white text-xs">
                      <Video size={14} />
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-100">{s.title}</h4>
                      <p className="text-[9px] text-zinc-400 dark:text-zinc-500">
                        {new Date(s.scheduledAt).toLocaleDateString()} · {s.duration}min · by {s.host?.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-zinc-400">{s._count?.attendees || 0} attending</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>
      )}

      {/* ── EVENTS TAB ── */}
      {activeTab === "events" && (
        <Section icon={<Calendar size={16} />} title="Upcoming Events">
          {events.length === 0 ? (
            <p className="text-xs text-zinc-400 dark:text-zinc-500">No upcoming events</p>
          ) : (
            <div className="space-y-2">
              {events.map((e: any) => (
                <div key={e.id} className="flex items-center justify-between rounded-lg border border-purple-200/60 bg-white/50 p-3 dark:border-zinc-700/60 dark:bg-zinc-800/50">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white text-xs">
                      <Calendar size={14} />
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-100">{e.title}</h4>
                      <p className="text-[9px] text-zinc-400 dark:text-zinc-500">
                        {new Date(e.scheduledAt).toLocaleDateString()} · {e._count?.attendees || 0} attending · by {e.host?.name}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => registerForEvent(e.id)} className="rounded-lg bg-purple-600 px-3 py-1.5 text-[10px] font-semibold text-white hover:bg-purple-500">Register</button>
                </div>
              ))}
            </div>
          )}
        </Section>
      )}

      {/* ── Create Modal ── */}
      {showCreate && (
        <Modal title={`Create ${createType === "club" ? "Club" : createType === "challenge" ? "Challenge" : "Live Session"}`} onClose={() => setShowCreate(false)}>
          <div className="space-y-3">
            <input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Name" className="w-full rounded-xl border border-purple-200 bg-white/70 px-3 py-2 text-sm outline-none focus:border-purple-400" />
            <textarea value={formDesc} onChange={(e) => setFormDesc(e.target.value)} placeholder="Description" rows={3} className="w-full rounded-xl border border-purple-200 bg-white/70 px-3 py-2 text-sm outline-none focus:border-purple-400 resize-none" />
            <select value={formType} onChange={(e) => setFormType(e.target.value)} className="w-full rounded-xl border border-purple-200 bg-white/70 px-3 py-2 text-sm outline-none focus:border-purple-400">
              <option value="WRITING">Writing</option>
              <option value="READING">Reading</option>
              <option value="ART">Art</option>
            </select>
            {createType === "challenge" && (
              <>
                <textarea value={formPrompt} onChange={(e) => setFormPrompt(e.target.value)} placeholder="Challenge prompt (optional)" rows={2} className="w-full rounded-xl border border-purple-200 bg-white/70 px-3 py-2 text-sm outline-none focus:border-purple-400 resize-none" />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-medium text-zinc-500">Start Date</label>
                    <input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} className="w-full rounded-xl border border-purple-200 bg-white/70 px-3 py-2 text-sm outline-none focus:border-purple-400" />
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-zinc-500">End Date</label>
                    <input type="date" value={formEndDate} onChange={(e) => setFormEndDate(e.target.value)} className="w-full rounded-xl border border-purple-200 bg-white/70 px-3 py-2 text-sm outline-none focus:border-purple-400" />
                  </div>
                </div>
              </>
            )}
            {createType === "session" && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-medium text-zinc-500">Date & Time</label>
                  <input type="datetime-local" value={formDate} onChange={(e) => setFormDate(e.target.value)} className="w-full rounded-xl border border-purple-200 bg-white/70 px-3 py-2 text-sm outline-none focus:border-purple-400" />
                </div>
                <div>
                  <label className="text-[10px] font-medium text-zinc-500">Duration (min)</label>
                  <input type="number" value={formDuration} onChange={(e) => setFormDuration(e.target.value)} className="w-full rounded-xl border border-purple-200 bg-white/70 px-3 py-2 text-sm outline-none focus:border-purple-400" />
                </div>
              </div>
            )}
            <button
              onClick={handleCreate}
              disabled={loading || !formName}
              className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 py-2.5 text-sm font-semibold text-white shadow-md hover:from-purple-500 hover:to-violet-500 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              Create
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ─── Club Card ───

function ClubCard({ club }: { club: any }) {
  const [joined, setJoined] = useState(false)
  const [joining, setJoining] = useState(false)

  const handleJoin = async () => {
    setJoining(true)
    try {
      if (joined) {
        await leaveClub(club.id)
        setJoined(false)
      } else {
        await joinClub(club.id)
        setJoined(true)
      }
    } catch {}
    setJoining(false)
  }

  return (
    <div className="rounded-lg border border-purple-200/60 bg-white/50 p-3 transition-all hover:shadow-sm dark:border-zinc-700/60 dark:bg-zinc-800/50">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h4 className="text-xs font-bold text-zinc-800 truncate dark:text-zinc-100">{club.name}</h4>
          <p className="mt-0.5 text-[10px] text-zinc-500 dark:text-zinc-400 line-clamp-2">{club.description}</p>
        </div>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-medium ${
          club.type === "WRITING" ? "bg-purple-100 text-purple-700" :
          club.type === "READING" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"
        }`}>{club.type}</span>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[9px] text-zinc-400 dark:text-zinc-500">
          <UsersRound size={10} className="inline mr-1" />
          {club._count?.members || 0} members
        </span>
        <button
          onClick={handleJoin}
          disabled={joining}
          className={`rounded-lg px-2.5 py-1 text-[9px] font-semibold transition-colors ${
            joined
              ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400"
              : "bg-purple-600 text-white hover:bg-purple-500"
          }`}
        >
          {joining ? "..." : joined ? "Joined" : "Join"}
        </button>
      </div>
    </div>
  )
}
