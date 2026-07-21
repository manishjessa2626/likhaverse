"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getErrorMessage } from "@/lib/errors"

function isValidUUID(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s)
}

export async function getLinkedProviders() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return []

  const accounts = await prisma.userAccount.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
  })

  return accounts.map((a) => ({
    id: a.id,
    provider: a.provider,
    providerId: a.providerId.slice(0, 8) + "...",
    createdAt: a.createdAt.toISOString(),
  }))
}

export async function unlinkProvider(accountId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return { error: "Not authenticated" }
  if (!isValidUUID(accountId)) return { error: "Invalid account ID" }

  try {
    const account = await prisma.userAccount.findUnique({ where: { id: accountId } })
    if (!account || account.userId !== session.user.id) {
      return { error: "Account not found" }
    }

    const count = await prisma.userAccount.count({ where: { userId: session.user.id } })
    if (count <= 1) {
      return { error: "Cannot unlink your only sign-in method" }
    }

    await prisma.userAccount.delete({ where: { id: accountId } })
    return { error: null, message: `${account.provider} account unlinked` }
  } catch (e) {
    return { error: getErrorMessage(e, "Failed to unlink account") }
  }
}
