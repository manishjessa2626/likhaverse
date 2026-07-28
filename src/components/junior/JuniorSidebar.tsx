"use client"

import Link from "next/link"
import { useParams, usePathname } from "next/navigation"
import { Home, BookOpen, PenLine, Trophy, BarChart3, Settings, Sparkles } from "lucide-react"

const items = [
  { href: "home", label: "Home", icon: Home },
  { href: "library", label: "Library", icon: BookOpen },
  { href: "write", label: "Write", icon: PenLine },
  { href: "achievements", label: "Achievements", icon: Trophy },
  { href: "progress", label: "Progress", icon: BarChart3 },
  { href: "settings", label: "Settings", icon: Settings },
]

export function JuniorSidebar() {
  const params = useParams()
  const pathname = usePathname()
  const id = params.id as string
  const base = `/junior/${id}`

  return (
    <>
      <nav className="hidden md:flex fixed left-0 top-0 bottom-0 w-56 flex-col border-r border-purple-200/60 bg-white/90 backdrop-blur-xl dark:border-zinc-700/60 dark:bg-zinc-900/90 z-40">
        <div className="flex items-center gap-2 border-b border-purple-200/60 px-5 py-4 dark:border-zinc-700/60">
          <Sparkles size={18} className="text-purple-500" />
          <span className="font-bold text-sm text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400">
            LikhaVerse Jr.
          </span>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {items.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === `${base}/${href}`
            return (
              <Link
                key={href}
                href={`${base}/${href}`}
                className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300"
                    : "text-zinc-600 hover:bg-purple-50 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            )
          })}
        </div>
      </nav>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-purple-200/60 bg-white/95 backdrop-blur-xl dark:border-zinc-700/60 dark:bg-zinc-900/95 safe-area-bottom">
        <div className="flex justify-around px-2 py-1.5">
          {items.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === `${base}/${href}`
            return (
              <Link
                key={href}
                href={`${base}/${href}`}
                className={`flex flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[10px] font-medium transition-all ${
                  isActive
                    ? "text-purple-600 dark:text-purple-400"
                    : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-500 dark:hover:text-zinc-300"
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
