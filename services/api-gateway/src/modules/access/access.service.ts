import { Injectable, HttpException } from "@nestjs/common"

const SERVICE_URL = process.env.ACCESS_SERVICE_URL || "http://localhost:3006"

@Injectable()
export class AccessService {
  private async request(path: string, options?: RequestInit) {
    try {
      const res = await fetch(`${SERVICE_URL}${path}`, {
        headers: { "Content-Type": "application/json", ...options?.headers },
        ...options,
      })
      const data = await res.json()
      if (!res.ok) throw new HttpException(data.error || "Access service error", res.status)
      return data
    } catch (err: any) {
      if (err instanceof HttpException) throw err
      throw new HttpException(err.message, 503)
    }
  }

  checkAccess(userId: string, episodeId: string) {
    return this.request("/access/check", { method: "POST", body: JSON.stringify({ userId, episodeId }) })
  }
  getDailyLimit(userId: string) { return this.request(`/access/daily-limit/${userId}`) }
  getNextUnlock(userId: string) { return this.request(`/access/next-unlock/${userId}`) }
}
