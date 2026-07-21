"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { unlockChapterWithCoins, claimDailyReward } from "@/app/actions/unlocks"
import { CoinStore } from "@/components/premium/CoinStore"
import { Coins, Crown, Sparkles, ShoppingCart, Loader2 } from "lucide-react"

interface LockedChapterOverlayProps {
  storyId: string
  chapterId: string
  chapterTitle: string
  coinCost: number
  balance: number
  isPremium: boolean
  onUnlocked: () => void
}

export function LockedChapterOverlay({
  storyId,
  chapterId,
  chapterTitle,
  coinCost,
  balance,
  isPremium,
  onUnlocked,
}: LockedChapterOverlayProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [showDaily, setShowDaily] = useState(false)
  const [dailyAmount, setDailyAmount] = useState(0)
  const [showCoinStore, setShowCoinStore] = useState(false)
  const router = useRouter()

  const handleCoinUnlock = async () => {
    setLoading("coins")
    setError("")
    const result = await unlockChapterWithCoins(storyId, chapterId)
    if (result.success) {
      onUnlocked()
      router.refresh()
    } else {
      setError(result.error || "Failed to unlock")
    }
    setLoading(null)
  }

  const handleDailyReward = async () => {
    setLoading("daily")
    const result = await claimDailyReward()
    if (result.success) {
      setDailyAmount(result.amount)
      setShowDaily(true)
    } else {
      setError(result.error || "Na-claim mo na today! Balik ka bukas.")
    }
    setLoading(null)
  }

  if (showDaily) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-purple-900/30 backdrop-blur-sm p-4">
        <div className="w-full max-w-sm rounded-2xl bg-white/90 p-8 text-center shadow-2xl">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
            <Coins size={32} className="text-amber-500" />
          </div>
          <h2 className="text-xl font-bold text-zinc-800">Daily Reward Claimed!</h2>
          <p className="mt-2 text-4xl font-black text-amber-500">+{dailyAmount}</p>
          <p className="mt-1 text-sm text-zinc-500">coins added to your wallet</p>
          <button
            onClick={() => setShowDaily(false)}
            className="mt-6 w-full rounded-xl bg-purple-600 py-3 text-sm font-bold text-white hover:bg-purple-500 transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    )
  }

  if (showCoinStore) {
    return (
      <CoinStore balance={balance} onClose={() => setShowCoinStore(false)} />
    )
  }

  const canAfford = balance >= coinCost

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-purple-900/30 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white/90 p-6 shadow-2xl">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-purple-100">
          <span className="text-2xl">📖</span>
        </div>

        <h2 className="text-center text-lg font-bold text-zinc-800">Continue the Story</h2>
        <p className="mt-1 text-center text-sm text-zinc-500">
          I-unlock &ldquo;{chapterTitle}&rdquo;
        </p>

        <div className="mt-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-3 text-center">
          <p className="text-sm italic text-zinc-600">
            &ldquo;And then&hellip; she opened the door.&rdquo;
          </p>
        </div>

        {error && (
          <p className="mt-3 text-center text-xs text-red-500">{error}</p>
        )}

        <div className="mt-5 space-y-3">
          {/* Coin unlock */}
          <button
            onClick={handleCoinUnlock}
            disabled={loading !== null || !canAfford}
            className="flex w-full items-center gap-3 rounded-xl border border-purple-200 bg-purple-50 px-4 py-3.5 text-left transition-all hover:border-purple-300 hover:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-100">
              <Coins size={22} className="text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-zinc-800">
                {loading === "coins" ? "Unlocking..." : `Unlock for ${coinCost} Coins`}
              </p>
              <p className="text-xs text-zinc-500">
                {canAfford ? `Balance: ${balance} coins` : `Kulang ng ${coinCost - balance} coins`}
              </p>
            </div>
            {loading === "coins" ? (
              <Loader2 size={18} className="animate-spin text-purple-600 shrink-0" />
            ) : (
              <span className="shrink-0 text-xs font-medium text-purple-600">Unlock</span>
            )}
          </button>

          {/* Premium */}
          <a
            href="/premium"
            className="flex w-full items-center gap-3 rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 px-4 py-3.5 text-left transition-all hover:border-amber-300 hover:from-amber-100 hover:via-orange-100"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-100">
              <Crown size={22} className="text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-zinc-800">Mag-Premium Na!</p>
              <p className="text-xs text-zinc-500">Walang limit &middot; Cinematic mode</p>
            </div>
            <span className="shrink-0 text-xs font-bold text-amber-600">View Plans</span>
          </a>
        </div>

        {/* Buy coins CTA */}
        <div className="mt-3 flex gap-2">
          <button
            onClick={handleDailyReward}
            disabled={loading !== null}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-dashed border-amber-200 py-2.5 text-sm font-medium text-amber-700 hover:bg-amber-50 transition-colors disabled:opacity-50"
          >
            {loading === "daily" ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Sparkles size={16} />
            )}
            Daily Reward
          </button>
          <button
            onClick={() => setShowCoinStore(true)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-dashed border-purple-200 py-2.5 text-sm font-medium text-purple-700 hover:bg-purple-50 transition-colors"
          >
            <ShoppingCart size={16} />
            Buy Coins
          </button>
        </div>

        <p className="mt-4 text-center text-[10px] text-zinc-400">
          First 2–3 chapters are always free. Mura pero sulit! 🎉
        </p>
      </div>
    </div>
  )
}
