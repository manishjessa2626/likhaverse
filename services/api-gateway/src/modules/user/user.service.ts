import { Injectable, HttpException } from "@nestjs/common"

const SERVICE_URL = process.env.USER_SERVICE_URL || "http://localhost:3003"

@Injectable()
export class UserService {
  private async request(path: string, options?: RequestInit) {
    try {
      const res = await fetch(`${SERVICE_URL}${path}`, {
        headers: { "Content-Type": "application/json", ...options?.headers },
        ...options,
      })
      const data = await res.json()
      if (!res.ok) throw new HttpException(data.error || "User service error", res.status)
      return data
    } catch (err: any) {
      if (err instanceof HttpException) throw err
      throw new HttpException(err.message, 503)
    }
  }

  getProfile(id: string) { return this.request(`/users/${id}`) }
  updateProfile(id: string, data: any) { return this.request(`/users/${id}`, { method: "PATCH", body: JSON.stringify(data) }) }
  getFollowers(id: string, page = 1, limit = 20) { return this.request(`/users/${id}/followers?page=${page}&limit=${limit}`) }
  getFollowing(id: string, page = 1, limit = 20) { return this.request(`/users/${id}/following?page=${page}&limit=${limit}`) }
  follow(userId: string, followingId: string) { return this.request(`/users/${userId}/follow`, { method: "POST", body: JSON.stringify({ followingId }) }) }
  unfollow(userId: string, followingId: string) { return this.request(`/users/${userId}/follow/${followingId}`, { method: "DELETE" }) }
  getStories(id: string, page = 1, limit = 20) { return this.request(`/users/${id}/stories?page=${page}&limit=${limit}`) }
}
