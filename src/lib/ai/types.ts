export type GenerationType = "COVER" | "CHARACTER" | "SCENE" | "ENVIRONMENT" | "OBJECT"

export type GenerationStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED"

export type ArtStyle =
  | "AUTO"
  | "FANTASY"
  | "ROMANCE"
  | "DARK_HORROR"
  | "SCI_FI"
  | "ANIME_MANGA"
  | "WATERCOLOR"
  | "MINIMALIST"
  | "VINTAGE_RETRO"

export const STYLE_MODIFIERS: Record<ArtStyle, string> = {
  AUTO: "",
  FANTASY: "fantasy art, magical lighting, epic details, cinematic atmosphere",
  ROMANCE: "romantic atmosphere, soft lighting, dreamy colors, emotional mood",
  DARK_HORROR: "dark atmosphere, shadows, horror aesthetic, eerie cinematic lighting",
  SCI_FI: "futuristic technology, neon lights, advanced world design, sci-fi aesthetic",
  ANIME_MANGA: "anime illustration, manga style, detailed character design, cel shading",
  WATERCOLOR: "watercolor painting, soft brush textures, artistic, painterly style",
  MINIMALIST: "clean composition, simple shapes, elegant design, minimalist aesthetic",
  VINTAGE_RETRO: "retro poster, aged paper texture, classic illustration, vintage style",
}

export const GENERATION_PROMPTS: Record<GenerationType, string> = {
  COVER: "professional book cover, vertical composition, high detail",
  CHARACTER: "character portrait, detailed face and expression, character design sheet style",
  SCENE: "cinematic scene illustration, wide shot, storytelling composition",
  ENVIRONMENT: "environment concept art, detailed world design, atmospheric perspective",
  OBJECT: "detailed object design, clean product shot, isolated on simple background",
}

export interface GenerationRequest {
  type: GenerationType
  prompt: string
  style?: ArtStyle
  storyId?: string
  characterId?: string
  negativePrompt?: string
  width?: number
  height?: number
  fields?: {
    name?: string
    age?: string
    gender?: string
    species?: string
    personality?: string
    appearance?: string
    clothing?: string
    background?: string
    artStyle?: string
  }
}

export interface GenerationResult {
  imageUrl: string
  thumbnailUrl?: string
  provider: string
  modelUsed?: string
  durationMs?: number
}

export interface AIProvider {
  name: string
  generateImage(req: GenerationRequest): Promise<GenerationResult>
}

export const GENERATION_LIMITS: Record<string, Record<string, number>> = {
  AUTHOR: {
    COVER: 5,
    CHARACTER: 10,
    SCENE: 3,
    ENVIRONMENT: 5,
    OBJECT: 5,
  },
  VIP_GOLD: {
    COVER: 50,
    CHARACTER: 999,
    SCENE: 20,
    ENVIRONMENT: 50,
    OBJECT: 50,
  },
  PREMIUM_CREATOR: {
    COVER: 50,
    CHARACTER: 999,
    SCENE: 20,
    ENVIRONMENT: 50,
    OBJECT: 50,
  },
}

export function getGenerationLimit(role: string, type: string): number {
  if (role === "SUPER_ADMIN") return 99999
  return GENERATION_LIMITS[role]?.[type as GenerationType] ?? 0
}

export function bypassesAllLimits(role: string): boolean {
  return role === "SUPER_ADMIN"
}
