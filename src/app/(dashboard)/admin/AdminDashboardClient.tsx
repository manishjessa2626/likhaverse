"use client"

import Link from "next/link"
import {
  Users, BookOpen, MessageSquare, Flag, Crown, Film, BarChart3, CreditCard, Cpu, Repeat, TrendingUp, AlertTriangle, ArrowRight, Clock, CheckCircle2, XCircle,
} from "lucide-react"

interface Stats {
  userCount: number; storyCount: number; chapterCount: number; commentCount: number
  reportCount: number; pendingReports: number; premiumCount: number; pendingStudio: number
  activeSubscriptions: number; aiGenCount: number; paymentCount: number; totalRevenue: number
  recentUsers: { id: string; name: string; email: string | null; role: string; createdAt: Date }[]
  recentReports: { id: string; reason: string; status: string; createdAt: Date; reporter: { name: string } }[]
}

function StatCard({ icon, label, value, accent, href }: { icon: React.ReactNode; label: string; value: string | number; accent?: string; href?: string }) {
  const card = (
    <div className={`rounded-xl border border-purple-200/60 bg-white/70 p-4 shadow-sm transition-all hover:shadow-md dark:border-zinc-700/60 dark:bg-zinc-800/70 ${href ? "cursor-pointer" : ""}`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`text-lg ${accent || "text-purple-600 dark:text-zinc-400"}`}>{icon}</span>
        <span className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">{value}</span>
      </div>
      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{label}</p>
    </div>
  )
  return href ? <Link href={href}>{card}</Link> : card
}

export function AdminDashboardClient({ stats, isSuperAdmin }: { stats: Stats; isSuperAdmin: boolean }) {
  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">
          {isSuperAdmin ? "Super Admin" : "Admin"} Dashboard
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">System overview and management center</p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-4 gap-3">
        <StatCard icon={<Users size={18} />} label="Total Users" value={stats.userCount} href="/admin/users" />
        <StatCard icon={<BookOpen size={18} />} label="Stories" value={stats.storyCount} href="/admin/stories" />
        <StatCard icon={<MessageSquare size={18} />} label="Comments" value={stats.commentCount} />
        <StatCard icon={<Flag size={18} />} label="Reports" value={stats.reportCount} accent={stats.pendingReports > 0 ? "text-red-500" : undefined} href="/admin/reports" />
        <StatCard icon={<CheckCircle2 size={18} />} label="Resolved Reports" value={stats.reportCount - stats.pendingReports} />
        <StatCard icon={<AlertTriangle size={18} />} label="Pending Reports" value={stats.pendingReports} accent={stats.pendingReports > 0 ? "text-red-500" : undefined} href="/admin/reports" />
        <StatCard icon={<Crown size={18} />} label="Premium Users" value={stats.premiumCount} accent="text-amber-500" href="/admin/subscriptions" />
        <StatCard icon={<Repeat size={18} />} label="Active Subs" value={stats.activeSubscriptions} href="/admin/subscriptions" />
        <StatCard icon={<Cpu size={18} />} label="AI Generations" value={stats.aiGenCount} href="/admin/ai-usage" />
        <StatCard icon={<CreditCard size={18} />} label="Payments" value={stats.paymentCount} href="/admin/payments" />
        <StatCard icon={<TrendingUp size={18} />} label="Revenue" value={`₱${stats.totalRevenue.toLocaleString()}`} accent="text-green-500" />
        <StatCard icon={<Film size={18} />} label="Studio Apps" value={stats.pendingStudio} accent={stats.pendingStudio > 0 ? "text-violet-500" : undefined} href="/admin/studio" />
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Users */}
        <div className="rounded-xl border border-purple-200/60 bg-white/70 p-4 dark:border-zinc-700/60 dark:bg-zinc-800/70">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5"><Users size={14} /> Recent Users</h3>
            <Link href="/admin/users" className="text-[10px] text-purple-600 hover:text-purple-500 flex items-center gap-0.5">View All <ArrowRight size={10} /></Link>
          </div>
          <div className="space-y-1.5">
            {stats.recentUsers.length === 0 ? (
              <p className="text-[11px] text-zinc-400">No users yet</p>
            ) : (
              stats.recentUsers.map((u) => (
                <div key={u.id} className="flex items-center justify-between rounded-lg bg-purple-50/50 px-2.5 py-1.5 dark:bg-zinc-800/50">
                  <div>
                    <p className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300">{u.name}</p>
                    <p className="text-[9px] text-zinc-400">{u.email || "—"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-zinc-200 px-1.5 py-0.5 text-[8px] font-medium text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400">{u.role}</span>
                    <span className="text-[8px] text-zinc-400">{new Date(u.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Reports */}
        <div className="rounded-xl border border-purple-200/60 bg-white/70 p-4 dark:border-zinc-700/60 dark:bg-zinc-800/70">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5"><Flag size={14} /> Recent Reports</h3>
            <Link href="/admin/reports" className="text-[10px] text-purple-600 hover:text-purple-500 flex items-center gap-0.5">View All <ArrowRight size={10} /></Link>
          </div>
          <div className="space-y-1.5">
            {stats.recentReports.length === 0 ? (
              <p className="text-[11px] text-zinc-400">No recent reports</p>
            ) : (
              stats.recentReports.map((r) => (
                <div key={r.id} className="flex items-center justify-between rounded-lg bg-purple-50/50 px-2.5 py-1.5 dark:bg-zinc-800/50">
                  <div>
                    <p className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300 line-clamp-1">{r.reason}</p>
                    <p className="text-[9px] text-zinc-400">by {r.reporter.name}</p>
                  </div>
                  <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-medium ${
                    r.status === "PENDING" ? "bg-amber-100 text-amber-700" :
                    r.status === "RESOLVED" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}>{r.status}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
