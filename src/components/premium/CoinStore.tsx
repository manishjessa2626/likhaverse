"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { COIN_PACKAGES, PAYMENT_METHODS } from "@/lib/plans"
import type { PaymentMethod, CoinPackageId } from "@/lib/plans"
import { Coins, Check, Loader2, X } from "lucide-react"

interface CoinStoreProps {
  balance: number
  onClose: () => void
}

export function CoinStore({ balance, onClose }: CoinStoreProps) {
  const router = useRouter()
  const [selected, setSelected] = useState<CoinPackageId | null>(null)
  const [showPayment, setShowPayment] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("gcash")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<{ coins: number; amount: number } | null>(null)
  const [error, setError] = useState("")

  const pkg = COIN_PACKAGES.find((p) => p.id === selected)

  const handlePurchase = async () => {
    if (!pkg) return
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/payments/buy-coins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId: pkg.id, method: paymentMethod }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Purchase failed")
      setSuccess({ coins: pkg.coins, amount: pkg.price })
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Purchase failed")
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-purple-900/30 backdrop-blur-sm p-4">
        <div className="w-full max-w-sm rounded-2xl bg-white/90 p-8 text-center shadow-2xl">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <Check size={32} className="text-green-500" />
          </div>
          <h2 className="text-xl font-bold text-zinc-800">Purchase Successful! 🎉</h2>
          <p className="mt-2 text-4xl font-black text-amber-500">+{success.coins}</p>
          <p className="mt-1 text-sm text-zinc-500">coins added to your wallet</p>
          <button
            onClick={onClose}
            className="mt-6 w-full rounded-xl bg-purple-600 py-3 text-sm font-bold text-white hover:bg-purple-500 transition-colors"
          >
            Continue Reading
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-purple-900/30 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white/90 p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Coins size={20} className="text-amber-500" />
            <span className="font-semibold text-zinc-800">{balance} coins</span>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <h2 className="text-lg font-bold text-zinc-800">Buy Coins</h2>
        <p className="text-sm text-zinc-500 mb-4">Pumili ng package na swak sa &apos;yo</p>

        {error && (
          <p className="mb-3 text-xs text-red-500 text-center">{error}</p>
        )}

        {!showPayment ? (
          <div className="space-y-2.5">
            {COIN_PACKAGES.map((pkg) => (
              <button
                key={pkg.id}
                onClick={() => setSelected(pkg.id)}
                className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-all ${
                  selected === pkg.id
                    ? "border-purple-300 bg-purple-50"
                    : "border-zinc-200 bg-white hover:border-purple-200"
                }`}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-100">
                  <Coins size={20} className="text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-zinc-800">
                    {pkg.coins} Coins
                    {pkg.badge && (
                      <span className="ml-2 text-[10px] font-semibold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-full">
                        {pkg.badge}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-zinc-500">₱{pkg.price}</p>
                </div>
                {selected === pkg.id && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-600">
                    <Check size={14} className="text-white" />
                  </div>
                )}
              </button>
            ))}
            <button
              onClick={() => selected && setShowPayment(true)}
              disabled={!selected}
              className="w-full rounded-xl bg-purple-600 py-3.5 text-sm font-bold text-white hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-2"
            >
              Continue to Payment
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="rounded-xl bg-purple-50 p-4 text-center">
              <p className="text-sm text-zinc-500">{pkg?.coins} Coins</p>
              <p className="text-2xl font-bold text-purple-700">₱{pkg?.price}</p>
            </div>

            <p className="text-sm font-medium text-zinc-700">Choose payment:</p>
            {PAYMENT_METHODS.map((m) => (
              <button
                key={m.id}
                onClick={() => setPaymentMethod(m.id)}
                className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-all ${
                  paymentMethod === m.id
                    ? "border-purple-300 bg-purple-50"
                    : "border-zinc-200 bg-white hover:border-purple-200"
                }`}
              >
                <span className="text-lg">{m.icon}</span>
                <span className="text-sm font-medium text-zinc-800">{m.label}</span>
                {paymentMethod === m.id && (
                  <span className="ml-auto text-purple-600">
                    <Check size={16} />
                  </span>
                )}
              </button>
            ))}

            <div className="flex gap-2 mt-2">
              <button
                onClick={() => setShowPayment(false)}
                className="flex-1 rounded-xl border border-zinc-200 py-3 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handlePurchase}
                disabled={loading}
                className="flex-1 rounded-xl bg-purple-600 py-3 text-sm font-bold text-white hover:bg-purple-500 disabled:opacity-50 transition-colors"
              >
                {loading ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Buy Now"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
