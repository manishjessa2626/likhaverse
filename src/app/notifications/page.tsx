import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Bell, BookOpen, MessageCircle, UserPlus, Film } from "lucide-react"
import { BackButton } from "@/components/ui/BackButton"
import { NotificationsList } from "./NotificationsList"

const MAIN_TYPES = ["FOLLOW", "STORY_UPDATE", "STORY_COMMENT", "STUDIO_EVENT", "STORY_LIKE"]

const categories = [
  { icon: BookOpen, label: "New Chapter Released" },
  { icon: MessageCircle, label: "Comments on your story" },
  { icon: UserPlus, label: "New follower" },
  { icon: Film, label: "Studio updates" },
]

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")

  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: session.user.id, type: { in: MAIN_TYPES } },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        actor: { select: { id: true, name: true, avatar: true } },
      },
    }),
    prisma.notification.count({ where: { userId: session.user.id, read: false, type: { in: MAIN_TYPES } } }),
  ])

  const serialized = notifications.map((n) => ({
    ...n,
    createdAt: n.createdAt.toISOString(),
  }))

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <BackButton className="mb-6 text-sm text-zinc-400 hover:text-white transition-colors inline-block" />

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 mb-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20">
            <Bell size={20} className="text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-100">Story Notifications</h1>
            <p className="text-xs text-zinc-500">
              {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-3">
          {categories.map((cat) => (
            <div key={cat.label} className="flex items-center gap-2 text-sm text-zinc-400">
              <cat.icon size={14} className="text-zinc-600" />
              <span>{cat.label}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-zinc-800 pt-4 mt-4" />
      </div>

      <NotificationsList notifications={serialized} category="main" />
    </main>
  )
}
