import type { StudioProvider, StudioRequest, StudioResult, StudioToolType } from "../ai-studio/types"

let _openai: any = null

async function getOpenAI() {
  if (!_openai) {
    const key = process.env.OPENAI_API_KEY
    if (!key) throw new Error("OPENAI_API_KEY not configured. Set it in .env.local")
    const { OpenAI } = await import("openai")
    _openai = new OpenAI({ apiKey: key })
  }
  return _openai
}

function buildSystemPrompt(tool: StudioToolType, storyTitle?: string): string {
  const base = `You are a professional creative writing assistant for LikhaVerse, a storytelling platform.`
  const storyContext = storyTitle ? `The story is titled "${storyTitle}".` : ""

  const toolPrompts: Record<string, string> = {
    ANALYZE_CHARACTERS: `Analyze character arcs, motivations, relationships, and development. Provide a structured analysis with protagonist, supporting characters, and recommendations. Use markdown with tables.`,
    ANALYZE_TIMELINE: `Build a chronological timeline of the story. Break into acts and provide chapter-by-chapter pacing analysis. Use markdown.`,
    ANALYZE_WORLD: `Generate world history, lore, geography, culture, and worldbuilding notes. Be creative and detailed. Use markdown.`,
    ANALYZE_THEMES: `Identify themes, symbols, motifs, and literary devices. Provide thematic analysis with recommendations. Use markdown with tables.`,
    ANALYZE_RELATIONSHIPS: `Map character relationships, dynamics, tensions, and arcs. Include a relationship map and recommendations. Use markdown.`,
    CHARACTER_SHEET: `Generate a detailed character design sheet with name, age, gender, species, appearance, personality, background, art style, and visual references. Use markdown.`,
    WORLD_BUILDING: `Create detailed worldbuilding content for the given topic. Include architecture, culture, geography, magic systems, or other relevant details. Use markdown.`,
    ENVIRONMENT: `Design a detailed environment/location with atmosphere, mood, lighting, color palette, architecture, props, and camera direction. Include an image prompt. Use markdown.`,
    STORYBOARD_SCENE: `Convert a story scene into a detailed storyboard with shot sequence, camera notes, and visual references. Use markdown with tables.`,
    TRAILER_SCRIPT: `Write a 90-second trailer script with scene sequence, dialogue snippets, music cues, and visual descriptions. Use markdown with code blocks for script segments.`,
    TRAILER_STORYBOARD: `Create a visual storyboard for a trailer with key frames, timing, text overlays, and visual style notes. Use markdown.`,
    PRODUCTION_BREAKDOWN: `Break down the story into production elements: cast, locations, VFX, crew, timeline. Include budget estimates. Use markdown with tables.`,
    SHOT_LIST: `Generate a detailed shot-by-shot breakdown with shot type, camera movement, duration, and description. Use markdown with tables.`,
    BUDGET_ESTIMATE: `Provide a detailed production budget estimate with category breakdowns, totals, and funding recommendations. Use markdown with tables.`,
    // ── Phase 5: AI Studio ──
    WRITING_AI: `You are a professional writing coach and editor. Polish the user's prose, fix grammar and spelling, improve sentence flow, and suggest better word choices. When asked to rewrite, preserve the original voice and intent. Offer tone adjustments (formal, casual, poetic, tense). Use markdown with clear "Original" vs "Revised" sections and brief explanations of changes.`,
    STORY_AI: `You are a story structure analyst. Analyze plot structure, pacing, character arcs, and narrative consistency. Identify plot holes, weak transitions, and opportunities for tension. Provide act-by-act breakdowns and actionable recommendations. Be thorough but constructive. Use markdown with headings for each analysis area.`,
    CHARACTER_AI: `You are a character development specialist. Generate detailed character sheets with name, age, species, appearance, personality traits, background, and relationships. Analyze existing characters for arc potential, motivation depth, and consistency. Suggest traits, flaws, and backstory elements to make characters more compelling. Use markdown with structured sections.`,
    WORLD_BUILDER_AI: `You are a worldbuilding expert. Create rich, consistent lore for fantasy, sci-fi, or any setting. Generate cultures, magic systems, geography, history, religions, politics, and economy details. When given existing world info, expand it with new layers of depth and internal consistency. Use markdown with clear subsections for each worldbuilding area.`,
    ILLUSTRATION_AI: `You are an AI illustration prompt engineer. Given a character, scene, environment, or object description, generate a detailed, production-ready image prompt optimized for DALL-E 3 or Midjourney. Include style, lighting, composition, color palette, mood, and camera angle. For character descriptions, include physical features, clothing, expression, and pose. Wrap the final prompt in a code block labeled "IMAGE PROMPT". Use markdown.`,
    SCREENPLAY_AI: `You are a screenplay adaptation specialist. Convert novel prose into proper screenplay format with scene headings, character cues, parentheticals, and dialogue blocks. Use industry-standard formatting (INT./EXT., LOCATION, TIME OF DAY). Break long descriptions into action lines. Preserve all key story beats and dialogue. Output in a code block with proper screenplay formatting. Use markdown.`,
    MUSIC_AI: `You are a music supervision expert. For a given scene, chapter, or story mood, recommend specific songs, instrumental tracks, or ambient soundscapes. Suggest genre, tempo, instrumentation, and emotional tone. Provide a curated playlist with 5-10 song recommendations including artist, track name, why it fits, and the specific mood or moment it enhances. Use markdown with a table format.`,
    MARKETING_AI: `You are a book marketing specialist. Generate compelling story blurbs, loglines, taglines, social media posts, and meta descriptions. Write in different styles: hook-driven, emotional, mysterious, or humorous. For each piece, explain the target audience and platform. Include hashtag recommendations. Use markdown with clear sections for each output type.`,
  }

  return [base, storyContext, toolPrompts[tool] ?? "Provide a detailed creative analysis using markdown."]
    .filter(Boolean)
    .join("\n")
}

export const gptProvider: StudioProvider = {
  name: "gpt-4o",

  tools: {},

  async execute(tool: StudioToolType, req: StudioRequest): Promise<StudioResult> {
    const systemPrompt = buildSystemPrompt(tool, req.storyTitle)

    const userContent = [
      req.prompt ? `Request: ${req.prompt}` : "",
      req.chapterContent ? `Chapter content: ${req.chapterContent.slice(0, 4000)}` : "",
      req.characters?.length ? `Characters: ${JSON.stringify(req.characters)}` : "",
    ]
      .filter(Boolean)
      .join("\n")

    const openai = await getOpenAI()
    const startTime = Date.now()

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent || "Generate content for this story." },
      ],
      temperature: 0.8,
      max_tokens: 4096,
    })

    const durationMs = Date.now() - startTime
    const content = response.choices[0]?.message?.content ?? "Generation failed."

    return {
      content,
      data: {
        model: "gpt-4o",
        durationMs,
        promptTokens: response.usage?.prompt_tokens,
        completionTokens: response.usage?.completion_tokens,
      },
    }
  },
}
