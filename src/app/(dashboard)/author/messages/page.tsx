import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { MessageList } from "./MessageList"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { BackButton } from "@/components/ui/BackButton"

export default async function AuthorMessagesPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login")

  const [inbox, outbox] = await Promise.all([
    prisma.message.findMany({
      where: { receiverId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: { sender: { select: { id: true, name: true, avatar: true } } },
    }),
    prisma.message.findMany({
      where: { senderId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: { receiver: { select: { id: true, name: true, avatar: true } } },
    }),
  ])

  const inboxSerialized = inbox.map((m) => ({
    id: m.id,
    subject: m.subject,
    content: m.content,
    read: m.read,
    createdAt: m.createdAt.toISOString(),
    sender: m.sender,
  }))
  const outboxSerialized = outbox.map((m) => ({
    id: m.id,
    subject: m.subject,
    content: m.content,
    read: m.read,
    createdAt: m.createdAt.toISOString(),
    receiver: m.receiver,
  }))

  const unread = inbox.filter((m) => !m.read).length

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <BackButton fallbackHref="/author" className="mb-4 inline-block" />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-amber-700 dark:text-zinc-100">Messages</h1>
          <p className="mt-1 text-zinc-500">
            {unread > 0 ? `${unread} unread message${unread > 1 ? "s" : ""}` : "No unread messages"}
          </p>
        </div>
        <Link href="/reader/messages?compose=true">
          <Button>New Message</Button>
        </Link>
      </div>

      <MessageList inbox={inboxSerialized} outbox={outboxSerialized} />
    </div>
  )
}
