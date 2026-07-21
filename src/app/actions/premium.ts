"use server"

import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { requireAuth, requireAdmin, isSuperAdmin } from "@/lib/permissions"
import { getErrorMessage } from "@/lib/errors"

export async function upgradeToPremium() {
  const session = await getServerSession(authOptions)
  try {
    const user = requireAuth(session)
    if (isSuperAdmin(session)) {
      return { error: null, message: "Super Admin already has full access." }
    }
    await prisma.user.update({
      where: { id: user.id },
      data: { premium: true, premiumSince: new Date() },
    })
    revalidatePath("/reader")
    revalidatePath("/author")
    return { error: null, message: "Welcome to LikhaVerse Premium!" }
  } catch (e) {
    return { error: null, message: getErrorMessage(e) }
  }
}

export async function cancelPremium() {
  const session = await getServerSession(authOptions)
  try {
    const user = requireAuth(session)
    if (isSuperAdmin(session)) {
      return { error: null, message: "Super Admin premium status cannot be cancelled." }
    }
    await prisma.user.update({
      where: { id: user.id },
      data: { premium: false, premiumSince: null },
    })
    revalidatePath("/reader")
    revalidatePath("/author")
    return { error: null, message: "Premium cancelled." }
  } catch (e) {
    return { error: null, message: getErrorMessage(e) }
  }
}

export async function setPremium(userId: string, premium: boolean) {
  const session = await getServerSession(authOptions)
  try {
    requireAdmin(session)
  } catch {
    return { error: null, message: "Not authorized" }
  }
  await prisma.user.update({
    where: { id: userId },
    data: {
      premium,
      premiumSince: premium ? new Date() : null,
    },
  })
  revalidatePath("/admin")
  return { error: null, message: `User premium set to ${premium}` }
}

export async function getPremiumUsers() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return []
  try { requireAdmin(session) } catch { return [] }
  return prisma.user.findMany({
    where: { premium: true },
    select: { id: true, name: true, email: true, premiumSince: true },
    orderBy: { premiumSince: "desc" },
  })
}

export async function checkPremium() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return false
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { premium: true } })
  return user?.premium ?? false
}
