"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu, X, Bell, BookOpen, PenSquare, Settings, LogOut, LogIn, UserPlus, Search, Rss, ChevronRight, Activity, Heart, MessageCircle, UserPlus as UserPlusIcon, Bookmark, FileText, Film, Users } from "lucide-react"
import { getActivity, type ActivityItem } from "@/app/actions/activity"
import { Logo } from "@/components/brand/Logo"
import { ThemeToggle } from "@/components/ui/ThemeToggle"
import { useRealtime } from "@/lib/realtime/RealtimeContext"

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return "just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return date.toLocaleDateString()
}

function NavLink({
  href,
  icon,
  label,
  onClick,
  active,
}: {
  href: string
  icon: React.ReactNode
  label: string
  onClick: () => void
  active: boolean
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
        active
          ? "bg-purple-200/60 text-purple-800"
          : "text-zinc-600 hover:bg-purple-100/50 hover:text-purple-700"
      }`}
    >
      <span className="flex h-5 w-5 items-center justify-center">{icon}</span>
      {label}
    </Link>
  )
}

const activityIcons: Record<ActivityItem["type"], React.ReactNode> = {
  post_like: <Heart size={14} className="text-red-400" />,
  post_comment: <MessageCircle size={14} className="text-blue-400" />,
  story_like: <Heart size={14} className="text-pink-400" />,
  follow: <UserPlusIcon size={14} className="text-green-400" />,
  save: <Bookmark size={14} className="text-amber-400" />,
  post_create: <FileText size={14} className="text-violet-400" />,
}

function ActivityRow({ item }: { item: ActivityItem }) {
  return (
    <Link
      href={item.link ?? "#"}
      className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-zinc-900/50"
    >
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center">
        {activityIcons[item.type]}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-zinc-300 leading-relaxed">{item.message}</p>
        <p className="mt-0.5 text-[10px] text-zinc-600">{timeAgo(new Date(item.createdAt))}</p>
      </div>
    </Link>
  )
}

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [creatorOpen, setCreatorOpen] = useState(false)
  const [activityOpen, setActivityOpen] = useState(false)
  const [activityItems, setActivityItems] = useState<ActivityItem[]>([])
  const [activityLoading, setActivityLoading] = useState(false)
  const { unreadCount: notifMainCount } = useRealtime()
  const { data: session } = useSession()
  const pathname = usePathname()
  const router = useRouter()

  const closeMenu = useCallback(() => { setMenuOpen(false); setCreatorOpen(false); setActivityOpen(false) }, [])

  useEffect(() => {
    closeMenu()
  }, [pathname, closeMenu])

  useEffect(() => {
    if (menuOpen || activityOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [menuOpen, activityOpen])

  useEffect(() => {
    if (!activityOpen || !session?.user) return
    let cancelled = false
    setActivityLoading(true)
    getActivity(30).then((items) => {
      if (!cancelled) {
        setActivityItems(items)
        setActivityLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [activityOpen, session])

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 border-b border-purple-200/60 bg-white/70 dark:border-zinc-700/60 dark:bg-zinc-900/70 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <Link href="/" onClick={closeMenu}>
            <Logo size="md" />
          </Link>

          {/* Center nav tabs — hidden on mobile, shown inline when logged in */}
          {session?.user && (
            <div className="hidden md:flex items-center gap-1">
              <Link
                href="/"
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                  pathname === "/"
                    ? "bg-purple-200 text-purple-900"
                    : "text-zinc-600 hover:text-purple-700 hover:bg-purple-100/50"
                }`}
              >
                Reading
              </Link>
              <Link
                href="/write"
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                  pathname.startsWith("/write")
                    ? "bg-purple-200 text-purple-900"
                    : "text-zinc-600 hover:text-purple-700 hover:bg-purple-100/50"
                }`}
              >
                Writing
              </Link>
              <Link
                href="/studio"
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                  pathname.startsWith("/studio")
                    ? "bg-purple-200 text-purple-900"
                    : "text-zinc-600 hover:text-purple-700 hover:bg-purple-100/50"
                }`}
              >
                Studio
              </Link>
              <Link
                href="/film"
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                  pathname.startsWith("/film")
                    ? "bg-purple-200 text-purple-900"
                    : "text-zinc-600 hover:text-purple-700 hover:bg-purple-100/50"
                }`}
              >
                Film
              </Link>
              <Link
                href="/community"
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                  pathname.startsWith("/community")
                    ? "bg-purple-200 text-purple-900"
                    : "text-zinc-600 hover:text-purple-700 hover:bg-purple-100/50"
                }`}
              >
                Community
              </Link>
            </div>
          )}

          <div className="flex items-center gap-1">
            <ThemeToggle />
            {session?.user ? (
              <>
                <div className="hidden md:block">
                  <form action="/stories" method="GET" className="relative">
                    <input
                      name="q"
                      type="text"
                      placeholder="Search stories, authors..."
                      autoComplete="off"
                      className="w-44 rounded-lg border border-purple-200 bg-white/60 pl-3 pr-7 py-1.5 text-sm text-zinc-800 placeholder-zinc-400 transition-all focus:w-60 focus:border-purple-300 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-zinc-500 dark:focus:bg-zinc-800"
                    />
                    <Search size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  </form>
                </div>

                <Link
                  href="/notifications"
                  className="relative flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 hover:bg-purple-100 hover:text-purple-700 transition-colors"
                  title="Notifications"
                >
                  <Bell size={18} />
                  {notifMainCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                      {notifMainCount > 9 ? "9+" : notifMainCount}
                    </span>
                  )}
                </Link>

                <Link
                  href="/profile"
                  className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-xs font-bold text-white ring-2 ring-purple-200 hover:ring-purple-400 transition-all"
                >
                  {session.user.name?.charAt(0).toUpperCase() || "U"}
                </Link>
              </>
            ) : (
              <Link
                href="/login"
                className="rounded-lg bg-purple-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-purple-500 transition-colors"
              >
                Log In
              </Link>
            )}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 hover:bg-purple-100 hover:text-purple-700 transition-colors"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      <div className="h-14" />

      <div
        className={`fixed inset-0 top-14 z-50 bg-purple-900/20 dark:bg-zinc-900/60 backdrop-blur-sm transition-opacity duration-300 ${
          menuOpen || activityOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeMenu}
      />

      <aside
        className={`fixed top-14 right-0 z-50 max-h-[calc(100vh-3.5rem)] w-72 overflow-y-auto rounded-bl-2xl border border-purple-200/60 bg-white/90 dark:border-zinc-700/60 dark:bg-zinc-900/90 shadow-xl transition-all duration-300 ease-out origin-top-right ${
          menuOpen ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex flex-col">
          <div className="border-b border-purple-200/60 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">Menu</span>
              <button
                onClick={closeMenu}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-purple-100 hover:text-purple-700 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {session?.user ? (
            <div className="border-b border-purple-200/60 p-4">
              <Link href="/profile" onClick={closeMenu} className="flex items-center gap-3 group">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-lg font-bold text-white ring-2 ring-purple-200 group-hover:ring-purple-400 transition-all">
                  {session.user.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-zinc-800 group-hover:text-purple-700 transition-colors">
                    {session.user.name}
                  </p>
                  <p className="text-xs text-zinc-500">
                    @{session.user.name?.toLowerCase().replace(/\s+/g, "")}
                  </p>
                </div>
              </Link>
            </div>
          ) : (
            <div className="border-b border-purple-200/60 p-4">
              <Link
                href="/login"
                onClick={closeMenu}
                className="mb-2 flex w-full items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-purple-500 transition-colors"
              >
                <LogIn size={16} />
                Log In
              </Link>
              <Link
                href="/register"
                onClick={closeMenu}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-purple-200 dark:border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-purple-50 dark:hover:bg-zinc-800 transition-colors"
              >
                <UserPlus size={16} />
                Register
              </Link>
            </div>
          )}

          {session?.user && (
            <nav className="flex-1 space-y-1 p-3">
              {/* Navigation */}
              <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Navigation</p>
              <NavLink href="/library" icon={<BookOpen size={18} />} label="Library" onClick={closeMenu} active={pathname === "/library"} />

              {/* Creator with sub-menu */}
              <div>
                <button
                  onClick={() => setCreatorOpen(!creatorOpen)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                    pathname.startsWith("/write")
                      ? "bg-purple-200/60 text-purple-800"
                      : "text-zinc-600 hover:bg-purple-100/50 hover:text-purple-700"
                  }`}
                >
                  <span className="flex h-5 w-5 items-center justify-center">
                    <PenSquare size={18} />
                  </span>
                  <span className="flex-1 text-left">Creator</span>
                  <ChevronRight size={14} className={`transition-transform duration-200 ${creatorOpen ? "rotate-90" : ""}`} />
                </button>
                {creatorOpen && (
                  <div className="ml-6 mt-1 space-y-1 border-l border-zinc-800 pl-3 animate-fadeIn">
                    <NavLink href="/write" icon={<BookOpen size={14} />} label="My Stories" onClick={closeMenu} active={pathname.startsWith("/write")} />
                    <NavLink href="/write/new" icon={<PenSquare size={14} />} label="Drafts" onClick={closeMenu} active={pathname === "/write/new"} />
                  </div>
                )}
              </div>

              <NavLink href="/feed" icon={<Rss size={18} />} label="Newsfeed" onClick={closeMenu} active={pathname === "/feed"} />
              <NavLink href="/film" icon={<Film size={18} />} label="Filmmaker Studio" onClick={closeMenu} active={pathname.startsWith("/film")} />
              <NavLink href="/community" icon={<Users size={18} />} label="Community" onClick={closeMenu} active={pathname.startsWith("/community")} />

              <button
                onClick={() => { setMenuOpen(false); setActivityOpen(!activityOpen) }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  activityOpen ? "bg-purple-200/60 text-purple-800" : "text-zinc-600 hover:bg-purple-100/50 hover:text-purple-700"
                }`}
              >
                <span className="flex h-5 w-5 items-center justify-center">
                  <Activity size={18} />
                </span>
                Activity
              </button>

              {/* Settings */}
              <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-600 pt-4">Settings</p>
              <NavLink href="/settings/accounts" icon={<Settings size={18} />} label="Settings" onClick={closeMenu} active={pathname.startsWith("/settings")} />
              <NavLink href="/premium" icon={<span className="text-amber-400">💎</span>} label="Go VIP" onClick={closeMenu} active={pathname === "/premium"} />

              {/* Account */}
              <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-600 pt-4">Account</p>
              <button
                onClick={async () => { closeMenu(); await signOut({ redirect: false }); window.location.href = "/" }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-100/60 transition-all"
              >
                <LogOut size={18} />
                Logout
              </button>
            </nav>
          )}
        </div>
      </aside>

      {/* Activity Overlay */}
      <aside
        className={`fixed top-14 right-0 z-50 max-h-[calc(100vh-3.5rem)] w-72 overflow-y-auto rounded-bl-2xl border border-purple-200/60 bg-white/90 shadow-xl transition-all duration-300 ease-out origin-top-right ${
          activityOpen ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex flex-col">
          <div className="border-b border-zinc-800 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">Activity</span>
              <button
                onClick={() => setActivityOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>
          {activityLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-600 border-t-amber-500" />
            </div>
          ) : activityItems.length === 0 ? (
            <div className="p-6 text-center">
              <Activity size={40} className="mx-auto mb-3 text-zinc-700" />
              <p className="text-zinc-500 text-sm">No activity yet</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/60">
              {activityItems.map((item) => (
                <ActivityRow key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
