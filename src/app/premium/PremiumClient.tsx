"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Crown, Sparkles, CheckCircle2, XCircle, ArrowLeft, Loader2, Star, Zap, Gem, Rocket } from "lucide-react"
import { PREMIUM_TIERS, PREMIUM_FEATURES, upgradeTier } from "@/app/actions/premium-plans"
import type { PremiumTier } from "@/app/actions/premium-plans"

interface UserData {
  premium: boolean
  isVIP: boolean
  premiumSince: Date | null
  role: string
  walletBalance: number
  subscriptionStatus: string
  subscriptionExpiry: Date | null
}

function getTierFromUser(user: UserData | null): PremiumTier {
  if (!user) return "FREE"
  if (user.role === "SUPER_ADMIN" || user.role === "ADMIN" || user.role === "PREMIUM_CREATOR") return "STUDIO"
  if (user.isVIP) return "PRO"
  if (user.premium) return "BASIC"
  return "FREE"
}

const TIER_DETAILS: Record<PremiumTier, { icon: React.ReactNode; desc: string; highlight: string }> = {
  FREE: { icon: <Star size={20} />, desc: "Get started with basic reading", highlight: "Perfect for trying out" },
  BASIC: { icon: <Zap size={20} />, desc: "Ad-free reading & more", highlight: "Best for readers" },
  PRO: { icon: <Gem size={20} />, desc: "Full creative toolkit for creators", highlight: "Most popular" },
  STUDIO: { icon: <Rocket size={20} />, desc: "Everything unlocked for power users", highlight: "Maximum power" },
}

export function PremiumClient({ user }: { user: UserData | null }) {
  const router = useRouter()
  const [loading, setLoading] = useState<PremiumTier | null>(null)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const currentTier = getTierFromUser(user)
  const tiers: PremiumTier[] = ["FREE", "BASIC", "PRO", "STUDIO"]

  const handleUpgrade = async (tier: PremiumTier) => {
    if (tier === currentTier || tier === "FREE") return
    setLoading(tier)
    setMessage(null)
    try {
      await upgradeTier(tier)
      setMessage({ type: "success", text: `Upgraded to ${PREMIUM_TIERS[tier].label}! 🎉` })
      router.refresh()
    } catch (e: any) {
      setMessage({ type: "error", text: e.message })
    }
    setLoading(null)
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <button onClick={() => router.back()} className="mb-4 flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 transition-colors">
        <ArrowLeft size={16} /> Back
      </button>

      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 text-white shadow-lg">
          <Crown size={28} />
        </div>
        <h1 className="text-3xl font-bold text-zinc-800 dark:text-zinc-100">
          Choose Your <span className="bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">Premium</span> Tier
        </h1>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400">Unlock tools that genuinely enhance your creativity</p>
      </div>

      {/* Current plan */}
      <div className="mb-8 rounded-xl border border-purple-200/60 bg-white/70 p-4 text-center dark:border-zinc-700/60 dark:bg-zinc-800/70">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Current Plan</p>
        <p className="text-lg font-bold text-zinc-800 dark:text-zinc-100">{PREMIUM_TIERS[currentTier].label}</p>
        {user?.subscriptionExpiry && currentTier !== "FREE" && (
          <p className="text-[10px] text-zinc-400">Valid until {new Date(user.subscriptionExpiry).toLocaleDateString()}</p>
        )}
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-6 rounded-xl border p-3 text-center text-sm ${
          message.type === "success"
            ? "border-green-200 bg-green-50 text-green-700 dark:border-green-900/50 dark:bg-green-950/30 dark:text-green-400"
            : "border-red-200 bg-red-50 text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400"
        }`}>
          {message.text}
        </div>
      )}

      {/* Pricing Cards */}
      <div className="mb-10 grid gap-4 md:grid-cols-4">
        {tiers.map((tier) => {
          const info = PREMIUM_TIERS[tier]
          const detail = TIER_DETAILS[tier]
          const isCurrent = currentTier === tier
          const isUpgrade = !isCurrent && tier !== "FREE"

          return (
            <div
              key={tier}
              className={`relative rounded-2xl border p-5 transition-all ${
                isCurrent
                  ? "border-purple-300 bg-white shadow-lg shadow-purple-200/20 dark:border-zinc-500 dark:bg-zinc-800"
                  : tier === "PRO"
                    ? "border-amber-200 bg-gradient-to-b from-amber-50/50 to-white/70 shadow-md dark:from-zinc-800 dark:to-zinc-800/70"
                    : "border-purple-200/60 bg-white/50 hover:shadow-md dark:border-zinc-700/60 dark:bg-zinc-800/50"
              }`}
            >
              {tier === "PRO" && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-3 py-0.5 text-[9px] font-bold text-white shadow-md">
                  MOST POPULAR
                </div>
              )}
              <div className="mb-3 flex items-center gap-2">
                <span className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${info.color} text-white text-xs shadow-sm`}>
                  {detail.icon}
                </span>
                <span className="text-sm font-bold text-zinc-800 dark:text-zinc-100">{info.label}</span>
              </div>
              <p className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">{info.price}</p>
              <p className="mt-1 text-[10px] text-zinc-400 dark:text-zinc-500">{detail.desc}</p>

              <div className="mt-4 space-y-1.5">
                {PREMIUM_FEATURES.slice(0, 4).map((f) => {
                  const val = f[tier.toLowerCase() as keyof typeof f]
                  const active = typeof val === "boolean" ? val : true
                  return (
                    <div key={f.name} className="flex items-center gap-1.5 text-[10px]">
                      {active ? (
                        <CheckCircle2 size={10} className="text-green-500 shrink-0" />
                      ) : (
                        <XCircle size={10} className="text-zinc-300 dark:text-zinc-600 shrink-0" />
                      )}
                      <span className={active ? "text-zinc-600 dark:text-zinc-300" : "text-zinc-400 dark:text-zinc-600"}>{f.name}: <strong>{typeof val === "boolean" ? (active ? "✓" : "✗") : String(val)}</strong></span>
                    </div>
                  )
                })}
              </div>

              {isCurrent ? (
                <div className="mt-4 w-full rounded-xl bg-purple-100 py-2 text-center text-xs font-semibold text-purple-700 dark:bg-zinc-700 dark:text-zinc-300">
                  Current Plan
                </div>
              ) : isUpgrade ? (
                <button
                  onClick={() => handleUpgrade(tier)}
                  disabled={loading === tier}
                  className={`mt-4 w-full rounded-xl py-2.5 text-xs font-bold text-white shadow-md transition-all flex items-center justify-center gap-1.5 ${
                    tier === "PRO"
                      ? "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500"
                      : "bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500"
                  } disabled:opacity-50`}
                >
                  {loading === tier ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                  Upgrade
                </button>
              ) : null}
            </div>
          )
        })}
      </div>

      {/* Full Feature Comparison Table */}
      <div className="rounded-xl border border-purple-200/60 bg-white/70 p-5 shadow-sm dark:border-zinc-700/60 dark:bg-zinc-800/70">
        <h2 className="mb-4 text-sm font-bold text-zinc-800 dark:text-zinc-100">Full Feature Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-purple-200/60 dark:border-zinc-700">
                <th className="py-2 pr-4 font-semibold text-zinc-600 dark:text-zinc-400">Feature</th>
                {tiers.map((t) => (
                  <th key={t} className="px-3 py-2 text-center font-semibold text-zinc-600 dark:text-zinc-400">{PREMIUM_TIERS[t].label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PREMIUM_FEATURES.map((f) => (
                <tr key={f.name} className="border-b border-purple-100/60 dark:border-zinc-700/50">
                  <td className="py-2.5 pr-4 text-zinc-700 dark:text-zinc-300">{f.name}</td>
                  {tiers.map((t) => {
                    const val = f[t.toLowerCase() as keyof typeof f]
                    const active = typeof val === "boolean" ? val : true
                    return (
                      <td key={t} className="px-3 py-2.5 text-center">
                        {typeof val === "boolean" ? (
                          active ? <CheckCircle2 size={14} className="mx-auto text-green-500" /> : <XCircle size={14} className="mx-auto text-zinc-300 dark:text-zinc-600" />
                        ) : (
                          <span className={`font-medium ${active ? "text-zinc-700 dark:text-zinc-300" : "text-zinc-400 dark:text-zinc-500"}`}>{val}</span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
