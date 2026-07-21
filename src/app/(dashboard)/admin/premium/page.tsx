import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { PremiumUserList } from "./PremiumUserList"
import { BackButton } from "@/components/ui/BackButton"

export default async function AdminPremiumPage() {
  const session = await getServerSession(authOptions)
  if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    redirect("/login")
  }

  const premiumUsers = await prisma.user.findMany({
    where: { premium: true },
    select: { id: true, name: true, email: true, premiumSince: true },
    orderBy: { premiumSince: "desc" },
  })

  const allUsers = await prisma.user.findMany({
    select: { id: true, name: true, email: true, premium: true, role: true },
    orderBy: { name: "asc" },
  })

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <BackButton fallbackHref="/admin" className="mb-4 inline-block" />
      <h1 className="text-2xl font-bold text-amber-700 dark:text-zinc-100">Premium Management</h1>
      <p className="mt-1 text-zinc-500">
        {premiumUsers.length} premium user{premiumUsers.length !== 1 ? "s" : ""}
      </p>

      <PremiumUserList users={allUsers} />
    </div>
  )
}
