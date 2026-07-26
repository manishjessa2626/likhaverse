import type { Genre, NarrationSegment, PlayerState } from "./types"
import { analyzeSentences } from "./sentence-analyzer"
import { getGenreProfile, computeDelivery } from "./pacing"
import type { NarrationProvider } from "./provider"

function mapTagsToGenre(tags?: string | null): Genre {
  if (!tags) return "default"
  const tagList = tags.toLowerCase().split(",").map((t) => t.trim()).filter(Boolean)
  const genreMap: Record<string, Genre> = {
    comedy: "comedy", humorous: "comedy",
    horror: "horror", scary: "horror", creepy: "horror",
    romance: "romance", romantic: "romance",
    action: "action", adventure: "adventure",
    mystery: "mystery", thriller: "thriller",
    fantasy: "fantasy", magical: "fantasy",
    drama: "drama", tragic: "drama",
    scifi: "scifi", "sci-fi": "scifi",
    "dark fantasy": "fantasy",
    "psychological horror": "horror",
    supernatural: "fantasy",
    "haunted mirror": "horror",
  }
  for (const tag of tagList) {
    const mapped = genreMap[tag]
    if (mapped) return mapped
  }
  return "default"
}

export function createInitialPlayerState(): PlayerState {
  return {
    isOpen: false,
    isPlaying: false,
    isPaused: false,
    currentSegment: 0,
    totalSegments: 0,
    segments: [],
    progress: 0,
    elapsed: 0,
    duration: 0,
    speed: 1,
    voice: null,
    pitch: 1,
    volume: 1,
    genre: "default",
  }
}

export class NarrationEngine {
  private provider: NarrationProvider
  private segments: NarrationSegment[] = []
  private currentIndex = 0
  private genre: Genre = "default"
  private tags: string | null = null
  private userSpeed = 1
  private userPitch = 1
  private onSegmentChange?: (index: number) => void
  private onComplete?: () => void

  constructor(provider: NarrationProvider) {
    this.provider = provider
  }

  setTags(tags: string | null) {
    this.tags = tags
    this.genre = mapTagsToGenre(tags)
  }

  setUserSpeed(speed: number) { this.userSpeed = speed }
  setUserPitch(pitch: number) { this.userPitch = pitch }

  setCallbacks(onSegmentChange?: (index: number) => void, onComplete?: () => void) {
    this.onSegmentChange = onSegmentChange
    this.onComplete = onComplete
  }

  getGenre(): Genre { return this.genre }
  getSegments(): NarrationSegment[] { return this.segments }
  getCurrentIndex(): number { return this.currentIndex }
  getProvider(): NarrationProvider { return this.provider }

  loadContent(content: string) {
    this.segments = analyzeSentences(content)
    this.currentIndex = 0
  }

  async play() {
    if (this.segments.length === 0) return

    this.provider.stop()

    const profile = getGenreProfile(this.genre)
    const chunks = this.segments.slice(this.currentIndex).map((seg) => {
      const delivery = computeDelivery(seg, profile, this.userSpeed, this.userPitch)
      return {
        text: seg.text,
        rate: delivery.rate,
        pitch: delivery.pitch,
        pauseAfterMs: delivery.pauseMs,
        onStart: () => {
          this.onSegmentChange?.(this.currentIndex)
        },
      }
    })

    await this.provider.speak(chunks)
    this.onSegmentChange?.(this.segments.length)
    this.currentIndex = this.segments.length
    this.onComplete?.()
  }

  pause() { this.provider.pause() }
  resume() { this.provider.resume() }
  stop() { this.provider.stop() }

  get isPlaying() { return this.provider.isSpeaking }
  get isPaused() { return this.provider.isPaused }
}

export { mapTagsToGenre }
