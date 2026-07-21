import type { AIProvider, GenerationRequest, GenerationResult } from "./types"

const PLACEHOLDERS: Record<string, string> = {
  COVER: "https://placehold.co/600x800/8B4513/FFF?text=Book+Cover",
  CHARACTER: "https://placehold.co/600x800/2F4F4F/FFF?text=Character",
  SCENE: "https://placehold.co/1024x768/4A6741/FFF?text=Scene",
  ENVIRONMENT: "https://placehold.co/1024x768/4169E1/FFF?text=Environment",
  OBJECT: "https://placehold.co/600x600/8B008B/FFF?text=Object",
}

export const mockProvider: AIProvider = {
  name: "mock",

  async generateImage(req: GenerationRequest): Promise<GenerationResult> {
    await new Promise((r) => setTimeout(r, 800))

    const placeholder = PLACEHOLDERS[req.type] ?? PLACEHOLDERS.COVER
    const text = encodeURIComponent(req.prompt.slice(0, 30))
    const imageUrl = `${placeholder}&text=${text}`

    return {
      imageUrl,
      thumbnailUrl: imageUrl,
      provider: "mock",
      modelUsed: "mock-v1",
      durationMs: 800,
    }
  },
}
