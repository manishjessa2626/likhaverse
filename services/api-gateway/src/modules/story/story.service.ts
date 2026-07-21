import { Injectable, HttpException } from "@nestjs/common"

const SERVICE_URL = process.env.STORY_SERVICE_URL || "http://localhost:3004"

@Injectable()
export class StoryService {
  private async request(path: string, options?: RequestInit) {
    try {
      const res = await fetch(`${SERVICE_URL}${path}`, {
        headers: { "Content-Type": "application/json", ...options?.headers },
        ...options,
      })
      const data = await res.json()
      if (!res.ok) throw new HttpException(data.error || "Story service error", res.status)
      return data
    } catch (err: any) {
      if (err instanceof HttpException) throw err
      throw new HttpException(err.message, 503)
    }
  }

  create(data: any) { return this.request("/stories", { method: "POST", body: JSON.stringify(data) }) }
  update(id: string, data: any) { return this.request(`/stories/${id}`, { method: "PATCH", body: JSON.stringify(data) }) }
  delete(id: string) { return this.request(`/stories/${id}`, { method: "DELETE" }) }
  getById(id: string) { return this.request(`/stories/${id}`) }
  list(params: Record<string, string>) {
    const qs = new URLSearchParams(params).toString()
    return this.request(`/stories?${qs}`)
  }
  getByAuthor(authorId: string, page = 1, limit = 20) {
    return this.request(`/stories/author/${authorId}?page=${page}&limit=${limit}`)
  }
  incrementView(id: string) { return this.request(`/stories/${id}/view`, { method: "POST" }) }
}
