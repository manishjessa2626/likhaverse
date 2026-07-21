import { Injectable, HttpException } from "@nestjs/common"

const SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || "http://localhost:3008"

@Injectable()
export class NotificationService {
  private async request(path: string, options?: RequestInit) {
    try {
      const res = await fetch(`${SERVICE_URL}${path}`, {
        headers: { "Content-Type": "application/json", ...options?.headers },
        ...options,
      })
      const data = await res.json()
      if (!res.ok) throw new HttpException(data.error || "Notification service error", res.status)
      return data
    } catch (err: any) {
      if (err instanceof HttpException) throw err
      throw new HttpException(err.message, 503)
    }
  }

  create(data: any) { return this.request("/notifications", { method: "POST", body: JSON.stringify(data) }) }
  getForUser(userId: string, page = 1, limit = 20) { return this.request(`/notifications/${userId}?page=${page}&limit=${limit}`) }
  markRead(id: string) { return this.request(`/notifications/${id}/read`, { method: "PATCH" }) }
  markAllRead(userId: string) { return this.request(`/notifications/user/${userId}/read-all`, { method: "PATCH" }) }
  getUnreadCount(userId: string) { return this.request(`/notifications/user/${userId}/unread-count`) }
  delete(id: string) { return this.request(`/notifications/${id}`, { method: "DELETE" }) }
}
