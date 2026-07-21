import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { PremiumClient } from "./PremiumClient"

export default async function PremiumPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      premium: true,
      premiumSince: true,
      isVIP: true,
      role: true,
      walletBalance: true,
      subscriptionStatus: true,
      subscriptionExpiry: true,
    },
  })

  return <PremiumClient user={user} />
}
