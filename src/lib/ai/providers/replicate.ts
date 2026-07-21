import type { AIProvider, GenerationRequest, GenerationResult } from "../types"
import { downloadAndProcessImage } from "../image-processor"

const MODEL_MAP: Record<string, { model: string; aspect: string; cost: number }> = {
  COVER: {
    model: "black-forest-labs/flux-schnell",
    aspect: "3:4",
    cost: 0.003,
  },
  CHARACTER: {
    model: "black-forest-labs/flux-schnell",
    aspect: "3:4",
    cost: 0.003,
  },
  SCENE: {
    model: "black-forest-labs/flux-schnell",
    aspect: "16:9",
    cost: 0.003,
  },
  ENVIRONMENT: {
    model: "black-forest-labs/flux-schnell",
    aspect: "16:9",
    cost: 0.003,
  },
  OBJECT: {
    model: "black-forest-labs/flux-schnell",
    aspect: "1:1",
    cost: 0.003,
  },
}

const DIMENSIONS: Record<string, { width: number; height: number }> = {
  COVER: { width: 600, height: 800 },
  CHARACTER: { width: 600, height: 800 },
  SCENE: { width: 1024, height: 768 },
  ENVIRONMENT: { width: 1024, height: 768 },
  OBJECT: { width: 600, height: 600 },
}

let _replicate: any = null

async function getReplicate() {
  if (!_replicate) {
    const key = process.env.REPLICATE_API_TOKEN
    if (!key) throw new Error("REPLICATE_API_TOKEN not configured. Set it in .env.local")
    const Replicate = (await import("replicate")).default
    _replicate = new Replicate({ auth: key })
  }
  return _replicate!
}

function buildPrompt(req: GenerationRequest): string {
  const parts: string[] = [req.prompt]

  const styleMap: Record<string, string> = {
    FANTASY: "fantasy art, magical lighting, epic composition",
    ROMANCE: "romantic atmosphere, soft lighting, dreamy colors",
    DARK_HORROR: "dark atmosphere, shadows, horror aesthetic, eerie",
    SCI_FI: "futuristic, neon lights, advanced technology, sci-fi",
    ANIME_MANGA: "anime style, manga aesthetic, cel shaded, anime illustration",
    WATERCOLOR: "watercolor painting style, soft brush textures",
    MINIMALIST: "minimalist, clean composition, simple elegant design",
    VINTAGE_RETRO: "retro style, vintage, aged paper texture, classic illustration",
  }

  const modifier = req.style ? styleMap[req.style] : ""
  if (modifier) parts.push(modifier)

  return parts.join(", ")
}

export const replicateProvider: AIProvider = {
  name: "replicate",

  async generateImage(req: GenerationRequest): Promise<GenerationResult> {
    const cfg = MODEL_MAP[req.type] ?? MODEL_MAP.COVER
    const dims = DIMENSIONS[req.type] ?? DIMENSIONS.COVER
    const replicate = await getReplicate()
    const prompt = buildPrompt(req)
    const startTime = Date.now()

    const output = await replicate.run(cfg.model, {
      input: {
        prompt,
        aspect_ratio: cfg.aspect,
        output_format: "jpeg",
        num_outputs: 1,
      },
    } as any)

    const durationMs = Date.now() - startTime

    const imageUrl = Array.isArray(output) ? output[0] : (output as any)?.url ?? (output as string)
    if (!imageUrl) {
      throw new Error("Replicate returned no image URL")
    }

    const processed = await downloadAndProcessImage(
      String(imageUrl),
      "ai",
      `replicate-${Date.now()}`,
      { width: dims.width, height: dims.height }
    )

    return {
      imageUrl: processed.url,
      thumbnailUrl: processed.thumbnailUrl,
      provider: "replicate",
      modelUsed: cfg.model,
      durationMs,
    }
  },
}
