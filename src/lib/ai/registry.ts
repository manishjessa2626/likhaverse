import type { AIProvider, GenerationRequest, GenerationResult } from "./types"
import type { StudioProvider, StudioRequest, StudioResult, StudioToolType } from "../ai-studio/types"
import { mockProvider } from "./mock-provider"
import { openaiProvider } from "./openai-provider"
import { replicateProvider } from "./providers/replicate"
import { gptProvider } from "./gpt-provider"
import { mockStudioProvider } from "../ai-studio/mock-provider"

let imageProvider: AIProvider = determineInitialImageProvider()
let textProvider: StudioProvider = determineInitialTextProvider()

function determineInitialImageProvider(): AIProvider {
  const priority: [string, AIProvider][] = [
    ["REPLICATE_API_TOKEN", replicateProvider],
    ["OPENAI_API_KEY", openaiProvider],
  ]

  for (const [envVar, provider] of priority) {
    if (process.env[envVar]) {
      console.log(`[AI] Using ${provider.name} provider`)
      return provider
    }
  }

  console.warn("[AI] No AI API key set. Using mock provider.")
  return mockProvider
}

function determineInitialTextProvider(): StudioProvider {
  if (process.env.OPENAI_API_KEY) {
    return gptProvider
  }
  console.warn("[AI] No OPENAI_API_KEY set for text. Using mock studio provider.")
  return mockStudioProvider
}

export function setImageProvider(provider: AIProvider) {
  imageProvider = provider
}

export function getImageProvider(): AIProvider {
  return imageProvider
}

export function setTextProvider(provider: StudioProvider) {
  textProvider = provider
}

export function getTextProvider(): StudioProvider {
  return textProvider
}

export async function generateImage(req: GenerationRequest): Promise<GenerationResult> {
  return imageProvider.generateImage(req)
}

export async function executeStudioTool(
  tool: StudioToolType,
  req: StudioRequest
): Promise<StudioResult> {
  return textProvider.execute(tool, req)
}
