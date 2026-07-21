import type { AIProvider, GenerationRequest, GenerationResult } from "./types"
import { downloadAndProcessImage } from "./image-processor"

let _openai: any = null

async function getOpenAI() {
  if (!_openai) {
    const key = process.env.OPENAI_API_KEY
    if (!key) throw new Error("OPENAI_API_KEY not configured. Set it in .env.local")
    const { OpenAI } = await import("openai")
    _openai = new OpenAI({ apiKey: key })
  }
  return _openai!
}

const DIMENSIONS: Record<string, { width: number; height: number; apiSize: "1024x1024" | "1792x1024" | "1024x1792" }> = {
  COVER: { width: 600, height: 800, apiSize: "1024x1792" },
  CHARACTER: { width: 600, height: 800, apiSize: "1024x1024" },
  SCENE: { width: 1024, height: 768, apiSize: "1792x1024" },
  ENVIRONMENT: { width: 1024, height: 768, apiSize: "1792x1024" },
  OBJECT: { width: 600, height: 600, apiSize: "1024x1024" },
}

export const openaiProvider: AIProvider = {
  name: "openai",

  async generateImage(req: GenerationRequest): Promise<GenerationResult> {
    const dims = DIMENSIONS[req.type] ?? DIMENSIONS.COVER
    const styleCode = req.style ?? "AUTO"
    let styleModifier = ""

    if (styleCode !== "AUTO") {
      const styleMap: Record<string, string> = {
        FANTASY: "fantasy art, magical lighting, epic details, cinematic atmosphere",
        ROMANCE: "romantic atmosphere, soft lighting, dreamy colors, emotional mood",
        DARK_HORROR: "dark atmosphere, shadows, horror aesthetic, eerie cinematic lighting",
        SCI_FI: "futuristic technology, neon lights, advanced world design, sci-fi aesthetic",
        ANIME_MANGA: "anime illustration, manga style, detailed character design, cel shading",
        WATERCOLOR: "watercolor painting, soft brush textures, artistic, painterly style",
        MINIMALIST: "clean composition, simple shapes, elegant design, minimalist aesthetic",
        VINTAGE_RETRO: "retro poster, aged paper texture, classic illustration, vintage style",
      }
      styleModifier = styleMap[styleCode] ?? ""
    }

    const openai = await getOpenAI()
    const startTime = Date.now()

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: [req.prompt, styleModifier].filter(Boolean).join(", "),
      n: 1,
      size: dims.apiSize,
      quality: "standard",
      response_format: "url",
    })

    const durationMs = Date.now() - startTime

    if (!response.data?.[0]?.url) {
      throw new Error("OpenAI returned no image URL")
    }

    const providerImageUrl = response.data[0].url

    const processed = await downloadAndProcessImage(providerImageUrl, "ai", Date.now().toString(), {
      width: dims.width,
      height: dims.height,
    })

    return {
      imageUrl: processed.url,
      thumbnailUrl: processed.thumbnailUrl,
      provider: "openai",
      modelUsed: "dall-e-3",
      durationMs,
    }
  },
}
