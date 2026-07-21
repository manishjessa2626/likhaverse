import { Injectable, HttpException } from "@nestjs/common"

const SERVICE_URL = process.env.PAYMENT_SERVICE_URL || "http://localhost:3007"

@Injectable()
export class PaymentService {
  private async request(path: string, options?: RequestInit) {
    try {
      const res = await fetch(`${SERVICE_URL}${path}`, {
        headers: { "Content-Type": "application/json", ...options?.headers },
        ...options,
      })
      const data = await res.json()
      if (!res.ok) throw new HttpException(data.error || "Payment service error", res.status)
      return data
    } catch (err: any) {
      if (err instanceof HttpException) throw err
      throw new HttpException(err.message, 503)
    }
  }

  subscribe(userId: string, plan: string, method: string) {
    return this.request("/payments/subscribe", { method: "POST", body: JSON.stringify({ userId, plan, method }) })
  }
  topup(userId: string, amount: number, method: string) {
    return this.request("/payments/topup", { method: "POST", body: JSON.stringify({ userId, amount, method }) })
  }
  walletPurchase(userId: string) {
    return this.request("/payments/wallet-purchase", { method: "POST", body: JSON.stringify({ userId }) })
  }
  getHistory(userId: string, page = 1, limit = 20) {
    return this.request(`/payments/history/${userId}?page=${page}&limit=${limit}`)
  }
  getStatus(userId: string) { return this.request(`/payments/status/${userId}`) }
}
