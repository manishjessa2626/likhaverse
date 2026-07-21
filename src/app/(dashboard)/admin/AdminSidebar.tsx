"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, Users, Flag, BookOpen, CreditCard, Repeat, BarChart3, Cpu, Shield, Megaphone, HeadphonesIcon, UserCog, ScrollText, ChevronLeft, ChevronRight,
} from "lucide-react"
import { useState } from "react"
import { Logo } from "@/components/brand/Logo"

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: <LayoutDashboard size={16} /> },
  { href: "/admin/users", label: "Users", icon: <Users size={16} /> },
  { href: "/admin/reports", label: "Reports", icon: <Flag size={16} /> },
  { href: "/admin/stories", label: "Stories", icon: <BookOpen size={16} /> },
  { href: "/admin/payments", label: "Payments", icon: <CreditCard size={16} /> },
  { href: "/admin/subscriptions", label: "Subscriptions", icon: <Repeat size={16} /> },
  { href: "/admin/analytics", label: "Analytics", icon: <BarChart3 size={16} /> },
  { href: "/admin/ai-usage", label: "AI Usage", icon: <Cpu size={16} /> },
  { href: "/admin/moderation", label: "Moderation", icon: <Shield size={16} /> },
  { href: "/admin/announcements", label: "Announcements", icon: <Megaphone size={16} /> },
  { href: "/admin/support", label: "Support", icon: <HeadphonesIcon size={16} /> },
  { href: "/admin/staff", label: "Staff", icon: <UserCog size={16} /> },
  { href: "/admin/logs", label: "Logs", icon: <ScrollText size={16} /> },
]

export function AdminSidebar({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside className={`flex flex-col border-r border-purple-200/60 bg-white/70 backdrop-blur-sm transition-all duration-200 dark:border-zinc-700/60 dark:bg-zinc-900/70 ${collapsed ? "w-16" : "w-56"}`}>
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b border-purple-200/60 px-3 dark:border-zinc-700/60">
        {!collapsed && (
          <Link href="/admin" className="flex items-center gap-2">
            <Logo size="sm" />
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:bg-purple-100 hover:text-purple-600 transition-colors dark:hover:bg-zinc-800"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-2 scrollbar-thin">
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-2.5 py-2 text-xs font-medium transition-all ${
                isActive
                  ? "bg-purple-100 text-purple-800 dark:bg-zinc-700 dark:text-zinc-100"
                  : "text-zinc-500 hover:bg-purple-50 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              }`}
              title={collapsed ? item.label : undefined}
            >
              <span className="shrink-0">{item.icon}</span>
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="border-t border-purple-200/60 p-3 text-[9px] text-zinc-400 dark:border-zinc-700/60">
          {isSuperAdmin ? "Super Admin" : "Admin"}
        </div>
      )}
    </aside>
  )
}
