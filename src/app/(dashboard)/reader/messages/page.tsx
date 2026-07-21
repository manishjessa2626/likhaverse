import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { ComposeMessage } from "./ComposeMessage"
import { BackButton } from "@/components/ui/BackButton"

export default async function ReaderMessagesPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login")

  const users = await prisma.user.findMany({
    where: { id: { not: session.user.id } },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  })

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <BackButton fallbackHref="/reader" className="mb-4 inline-block" />
      <h1 className="text-2xl font-bold text-amber-700 dark:text-zinc-100">New Message</h1>
      <p className="mt-1 text-zinc-500">Send a message to another user.</p>

      <div className="mt-6">
        <ComposeMessage users={users} />
      </div>
    </div>
  )
}
