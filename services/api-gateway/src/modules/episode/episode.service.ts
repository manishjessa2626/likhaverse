import { Injectable, HttpException } from "@nestjs/common"

const SERVICE_URL = process.env.EPISODE_SERVICE_URL || "http://localhost:3005"

@Injectable()
export class EpisodeService {
  private async request(path: string, options?: RequestInit) {
    try {
      const res = await fetch(`${SERVICE_URL}${path}`, {
        headers: { "Content-Type": "application/json", ...options?.headers },
        ...options,
      })
      const data = await res.json()
      if (!res.ok) throw new HttpException(data.error || "Episode service error", res.status)
      return data
    } catch (err: any) {
      if (err instanceof HttpException) throw err
      throw new HttpException(err.message, 503)
    }
  }

  create(data: any) { return this.request("/episodes", { method: "POST", body: JSON.stringify(data) }) }
  getById(id: string) { return this.request(`/episodes/${id}`) }
  update(id: string, data: any) { return this.request(`/episodes/${id}`, { method: "PATCH", body: JSON.stringify(data) }) }
  delete(id: string) { return this.request(`/episodes/${id}`, { method: "DELETE" }) }
  listByStory(storyId: string) { return this.request(`/episodes/story/${storyId}`) }
  updateProgress(episodeId: string, userId: string, progress: number, completed?: boolean) {
    return this.request(`/episodes/${episodeId}/progress`, { method: "POST", body: JSON.stringify({ userId, progress, completed }) })
  }
  getProgress(episodeId: string, userId: string) { return this.request(`/episodes/${episodeId}/progress/${userId}`) }
  getUserProgress(storyId: string, userId: string) { return this.request(`/episodes/story/${storyId}/progress/${userId}`) }
  incrementView(id: string) { return this.request(`/episodes/${id}/view`, { method: "POST" }) }
}
