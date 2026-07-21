"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export interface PremiumFeature {
  name: string
  free: string | boolean
  basic: string | boolean
  pro: string | boolean
  studio: string | boolean
}

export const PREMIUM_TIERS = {
  FREE: { label: "Free", price: "₱0", color: "from-zinc-500 to-zinc-600" },
  BASIC: { label: "Reader", price: "₱149/mo", color: "from-purple-500 to-purple-600" },
  PRO: { label: "Creator", price: "₱299/mo", color: "from-violet-500 to-indigo-600" },
  STUDIO: { label: "Studio", price: "₱499/mo", color: "from-amber-500 to-orange-600" },
}

export const PREMIUM_FEATURES: PremiumFeature[] = [
  { name: "AI Generations (monthly)", free: "5", basic: "30", pro: "100", studio: "Unlimited" },
  { name: "Illustration Quality", free: "Standard", basic: "HD", pro: "2K", studio: "4K" },
  { name: "Story Analytics", free: false, basic: "Basic", pro: "Advanced", studio: "Full Suite" },
  { name: "Voice Narration", free: false, basic: false, pro: "✓", studio: "✓" },
  { name: "Film Studio Access", free: false, basic: false, pro: "✓", studio: "✓" },
  { name: "Team Collaboration", free: false, basic: false, pro: "1 collaborator", studio: "Unlimited" },
  { name: "Cloud Storage", free: "100 MB", basic: "1 GB", pro: "5 GB", studio: "25 GB" },
  { name: "Early Access Features", free: false, basic: false, pro: "✓", studio: "✓" },
  { name: "Ad-Free Reading", free: false, basic: "✓", pro: "✓", studio: "✓" },
  { name: "Custom Domain", free: false, basic: false, pro: false, studio: "✓" },
  { name: "Priority Support", free: false, basic: false, pro: "Email", studio: "24/7 Priority" },
  { name: "Writing Analytics", free: "Basic", basic: "Basic", pro: "Advanced", studio: "Full Suite" },
  { name: "Advanced Export", free: "TXT", basic: "TXT/PDF", pro: "TXT/PDF/EPUB", studio: "All formats" },
  { name: "Beta Features", free: false, basic: false, pro: "✓", studio: "✓" },
]

export type PremiumTier = "FREE" | "BASIC" | "PRO" | "STUDIO"

export async function getCurrentTier(user: { premium?: boolean; isVIP?: boolean; role?: string } | null): Promise<PremiumTier> {
  if (!user) return "FREE"
  if (user.role === "SUPER_ADMIN" || user.role === "ADMIN") return "STUDIO"
  if (user.isVIP) return "PRO"
  if (user.premium) return "BASIC"
  return "FREE"
}

export async function getUserTier(): Promise<PremiumTier> {
  const session = await getServerSession(authOptions)
  if (!session?.user) return "FREE"
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { premium: true, isVIP: true, role: true } })
  return getCurrentTier(user)
}

export async function upgradeTier(tier: PremiumTier) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Not authenticated")
  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user) throw new Error("User not found")

  if (tier === "BASIC") {
    await prisma.user.update({ where: { id: user.id }, data: { premium: true, isVIP: false, subscriptionStatus: "active", subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } })
  } else if (tier === "PRO") {
    await prisma.user.update({ where: { id: user.id }, data: { premium: true, isVIP: true, subscriptionStatus: "active", subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } })
  } else if (tier === "STUDIO") {
    await prisma.user.update({ where: { id: user.id }, data: { premium: true, isVIP: true, role: "PREMIUM_CREATOR", subscriptionStatus: "active", subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } })
  }
}

export async function canAccessFeature(tier: PremiumTier, featureValue: string | boolean): Promise<boolean> {
  if (typeof featureValue === "boolean") return featureValue
  return true
}

export async function getTierForRole(role?: string): Promise<PremiumTier> {
  if (role === "SUPER_ADMIN" || role === "ADMIN") return "STUDIO"
  if (role === "PREMIUM_CREATOR") return "STUDIO"
  if (role === "VIP_GOLD") return "PRO"
  return "BASIC"
}
