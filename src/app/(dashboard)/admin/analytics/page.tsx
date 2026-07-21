import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getDashboardAnalytics, getGenerationUsage, getPremiumAnalytics } from "@/app/actions/analytics"
import { BackButton } from "@/components/ui/BackButton"

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions)
  if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) redirect("/login")

  const [analytics, genUsage, premium] = await Promise.all([
    getDashboardAnalytics(),
    getGenerationUsage(),
    getPremiumAnalytics(),
  ])

  if (!analytics) redirect("/login")

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <BackButton fallbackHref="/admin" className="mb-4 inline-block" />
      <h1 className="text-2xl font-bold text-amber-700 dark:text-zinc-100">Analytics Dashboard</h1>
      <p className="mt-1 text-zinc-500">Platform overview and statistics.</p>

      <div className="mt-8 grid grid-cols-4 gap-4">
        <div className="rounded-xl border bg-white p-4">
          <p className="text-2xl font-bold text-blue-600">{analytics.totalUsers.toLocaleString()}</p>
          <p className="text-xs text-zinc-500">Total Users</p>
          <p className="text-xs text-green-600">+{analytics.recentUsers} this month</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-2xl font-bold text-purple-600">{analytics.totalStories.toLocaleString()}</p>
          <p className="text-xs text-zinc-500">Total Stories</p>
          <p className="text-xs text-green-600">+{analytics.recentStories} this month</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-2xl font-bold text-amber-600">{analytics.totalPremium}</p>
          <p className="text-xs text-zinc-500">Premium Users</p>
          <p className="text-xs text-zinc-400">{((analytics.totalPremium / analytics.totalUsers) * 100).toFixed(1)}% conversion</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-2xl font-bold text-green-600">{analytics.totalViews.toLocaleString()}</p>
          <p className="text-xs text-zinc-500">Total Views</p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-4 gap-4">
        <div className="rounded-xl border bg-white p-4">
          <p className="text-xl font-bold">{analytics.totalChapters.toLocaleString()}</p>
          <p className="text-xs text-zinc-500">Chapters</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-xl font-bold">{analytics.totalComments.toLocaleString()}</p>
          <p className="text-xs text-zinc-500">Comments</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-xl font-bold">{analytics.totalReactions.toLocaleString()}</p>
          <p className="text-xs text-zinc-500">Reactions</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-xl font-bold">{analytics.totalAuthors}</p>
          <p className="text-xs text-zinc-500">Authors</p>
        </div>
      </div>

      {/* Top Stories */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Top Stories by Views</h2>
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Title</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Author</th>
                <th className="px-4 py-3 text-right font-medium text-zinc-500">Views</th>
                <th className="px-4 py-3 text-right font-medium text-zinc-500">Words</th>
                <th className="px-4 py-3 text-right font-medium text-zinc-500">Saves</th>
                <th className="px-4 py-3 text-right font-medium text-zinc-500">Comments</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {analytics.topStories.map((story) => (
                <tr key={story.id} className="hover:bg-zinc-50">
                  <td className="px-4 py-3 font-medium text-zinc-800">{story.title}</td>
                  <td className="px-4 py-3 text-zinc-500">{story.author.name}</td>
                  <td className="px-4 py-3 text-right">{story.viewCount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">{story.wordCount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">{story._count.saves}</td>
                  <td className="px-4 py-3 text-right">{story._count.comments}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Distribution */}
      {analytics.roleDistribution.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">User Role Distribution</h2>
          <div className="grid grid-cols-5 gap-4">
            {analytics.roleDistribution.map((r) => (
              <div key={r.role} className="rounded-xl border bg-white p-4 text-center">
                <p className="text-2xl font-bold text-blue-600">{r.count}</p>
                <p className="text-xs text-zinc-500">{r.role}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Generation Usage */}
      {genUsage && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">AI Generation Usage</h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="rounded-xl border bg-white p-4">
              <h3 className="font-medium mb-3">By Type</h3>
              <div className="space-y-2">
                {genUsage.byType.map((u) => (
                  <div key={u.type} className="flex items-center justify-between">
                    <span className="text-sm">{u.type}</span>
                    <span className="text-sm font-medium">{u.count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl border bg-white p-4">
              <h3 className="font-medium mb-3">Top Users</h3>
              <div className="space-y-2">
                {genUsage.topUsers.slice(0, 5).map((u, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm">{u.user}</span>
                    <span className="text-sm font-medium">{u.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Premium Analytics */}
      {premium && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Premium Growth</h2>
          <div className="rounded-xl border bg-white p-4">
            <p className="text-3xl font-bold text-amber-600">{premium.total}</p>
            <p className="text-sm text-zinc-500">Total premium members</p>
          </div>
        </div>
      )}
    </div>
  )
}
