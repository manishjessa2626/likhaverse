# AI Creative Engine — Setup Guide

## Overview

LikhaVerse's AI Creative Engine generates book covers, character portraits, scenes, environments, and objects using a provider-agnostic architecture. It also powers the AI Studio (writing tools, analysis, storyboarding).

## Quick Start

### 1. Get an API Key

| Provider | Cost per image | Speed | Quality | Get Key |
|----------|---------------|-------|---------|---------|
| **Replicate** (Flux Schnell) | ~$0.003 | ~2s | Good | [replicate.com](https://replicate.com) |
| OpenAI (DALL-E 3) | ~$0.04 | ~10s | Excellent | [platform.openai.com](https://platform.openai.com) |

Recommendation: Start with **Replicate**. It's 13× cheaper and fast enough for book covers.

### 2. Set Environment Variables

Edit `.env.local` and uncomment/add:

```env
# Primary provider (recommended)
REPLICATE_API_TOKEN=your_replicate_api_token_here

# Fallback for text generation (AI Studio tools like "Character Analysis", "Plot Twist Generator")
OPENAI_API_KEY=sk-your_openai_api_key_here
```

### 3. (Optional) Pre-calculate Costs

Add an `AI_PROVIDER_COST` map if you want cost tracking:

```env
# Not required — costs are hard-coded per model in the provider
```

## Architecture

```
src/lib/ai/
  types.ts              — GenerationRequest, GenerationResult, AIProvider, limits
  style-engine.ts       — buildFinalPrompt() — enriches user prompts
  image-processor.ts    — downloadAndProcessImage() — resize/compress via sharp
  mock-provider.ts      — fallback when no API key is set
  openai-provider.ts    — DALL-E 3 integration
  gpt-provider.ts       — GPT-4o for AI Studio text tools
  registry.ts           — auto-selects provider by env vars
  providers/
    replicate.ts        — Replicate (Flux Schnell / SDXL)

src/app/api/ai/
  generate/route.ts     — Unified POST endpoint
  generation/[id]/route.ts — Status polling GET endpoint

src/app/actions/ai.ts   — Server actions for cover/character generation
```

### Provider Selection Priority

1. `REPLICATE_API_TOKEN` set → **Replicate** (image generation)
2. `OPENAI_API_KEY` set → **OpenAI DALL-E 3** (image) / **GPT-4o** (text)
3. Neither set → **Mock provider** (shows placeholder images)

## API Endpoints

### POST `/api/ai/generate`

Create an AI generation:

```json
{
  "type": "COVER",
  "prompt": "A dragon soaring over a medieval castle at sunset",
  "style": "FANTASY",
  "storyId": "abc-123",
  "fields": { "name": "Eragon", "age": "17" }
}
```

Response:

```json
{
  "status": "success",
  "generationId": "gid-123",
  "imageUrl": "/uploads/ai/replicate-1712345678.jpeg",
  "thumbnailUrl": "/uploads/ai/replicate-1712345678-thumb.jpeg",
  "style": "FANTASY",
  "createdAt": "2026-06-23T..."
}
```

### GET `/api/ai/generation/:id`

Poll for status:

```json
{
  "id": "gid-123",
  "status": "COMPLETED",
  "imageUrl": "/uploads/ai/...",
  "errorMessage": null
}
```

## Cost Tracking

Every generation is logged to the `AIGenerationLog` table with:
- `generationId` — FK to AIGeneration
- `providerName` — "replicate", "openai", or "mock"
- `modelUsed` — e.g., "black-forest-labs/flux-schnell"
- `durationMs` — elapsed time in ms
- `cost` — approximate cost in USD (added in Phase 2)
- `status` — COMPLETED or FAILED
- `errorMessage` — details on failure

## Credit Limits

| Role | COVER | CHARACTER | SCENE | ENVIRONMENT | OBJECT |
|------|-------|-----------|-------|-------------|-------|
| READER | 0 | 0 | 0 | 0 | 0 |
| AUTHOR | 5/mo | 10/mo | 3/mo | 3/mo | 5/mo |
| PREMIUM_CREATOR | 50/mo | 50/mo | 20/mo | 20/mo | 50/mo |
| ADMIN | 5/mo | 10/mo | 3/mo | 3/mo | 5/mo |
| SUPER_ADMIN | unlimited | unlimited | unlimited | unlimited | unlimited |

## Generation Types & Dimensions

| Type | DALL-E Size | Replicate Aspect | Processed Size | Use Case |
|------|-------------|------------------|----------------|----------|
| COVER | 1024×1792 | 3:4 | 600×800 | Book cover |
| CHARACTER | 1024×1024 | 3:4 | 600×800 | Character portrait |
| SCENE | 1792×1024 | 16:9 | 1024×768 | Chapter illustration |
| ENVIRONMENT | 1792×1024 | 16:9 | 1024×768 | World/landscape |
| OBJECT | 1024×1024 | 1:1 | 600×600 | Item/artifact |

## Adding a New Provider

1. Implement the `AIProvider` interface:
   ```typescript
   const myProvider: AIProvider = {
     name: "my-provider",
     async generateImage(req: GenerationRequest): Promise<GenerationResult> {
       // ... implementation
     }
   }
   ```
2. Import and add to `src/lib/ai/registry.ts` priority list.
3. Add env var check in `determineInitialImageProvider()`.

## AI Studio Text Tools

The following tools use GPT-4o (require `OPENAI_API_KEY`):

- Character Analysis, Timeline Generator, World Building, Storyboard Generator
- Trailer Script, Cinematic Shot List, Budget Estimate, Scene Breakdown
- Plot Twist Generator, What-If Scenarios, Dialogue Improver, Pacing Analysis
- Reader Sentiment Prediction, Query Letter Generator

Fallback: Mock responses with realistic-looking placeholder data.
