export interface Plan {
  id: string
  name: string
  price: number
  interval: "month" | "year"
  description: string
  badge?: string
}

export const SUBSCRIPTION_PLANS: Plan[] = [
  {
    id: "monthly",
    name: "Monthly",
    price: 149,
    interval: "month",
    description: "Unlimited chapters, cinematic mode, early access",
  },
  {
    id: "yearly",
    name: "Yearly",
    price: 999,
    interval: "year",
    description: "Full access + 2 months free",
    badge: "Best Value ⭐",
  },
]

export const COIN_PACKAGES = [
  { id: "50", coins: 50, price: 19, badge: "" },
  { id: "120", coins: 120, price: 49, badge: "Popular 🔥" },
  { id: "300", coins: 300, price: 99, badge: "Best Value ⭐" },
  { id: "700", coins: 700, price: 199, badge: "" },
] as const

export type CoinPackageId = (typeof COIN_PACKAGES)[number]["id"]

export const TOP_UP_AMOUNTS = [50, 100, 200, 500]

export type PaymentMethod = "gcash" | "card" | "apple_pay"

export const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: string }[] = [
  { id: "gcash", label: "GCash", icon: "📱" },
  { id: "card", label: "Credit / Debit Card", icon: "💳" },
  { id: "apple_pay", label: "Apple Pay", icon: "🍎" },
]
