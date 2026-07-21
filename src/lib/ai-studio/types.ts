export type StudioToolType =
  | "ANALYZE_CHARACTERS"
  | "ANALYZE_TIMELINE"
  | "ANALYZE_WORLD"
  | "ANALYZE_THEMES"
  | "ANALYZE_RELATIONSHIPS"
  | "CHARACTER_SHEET"
  | "WORLD_BUILDING"
  | "ENVIRONMENT"
  | "STORYBOARD_SCENE"
  | "TRAILER_SCRIPT"
  | "TRAILER_STORYBOARD"
  | "PRODUCTION_BREAKDOWN"
  | "SHOT_LIST"
  | "BUDGET_ESTIMATE"
  // ── AI Studio Phase 5 tools ──
  | "WRITING_AI"
  | "STORY_AI"
  | "CHARACTER_AI"
  | "WORLD_BUILDER_AI"
  | "ILLUSTRATION_AI"
  | "SCREENPLAY_AI"
  | "MUSIC_AI"
  | "MARKETING_AI"

export interface StudioRequest {
  tool: StudioToolType
  storyId?: string
  storyTitle?: string
  chapterContent?: string
  chapters?: { title: string; content: string; number: number }[]
  characters?: { name: string; description?: string }[]
  prompt: string
  existingData?: Record<string, unknown>
  options?: Record<string, unknown>
}

export interface StudioResult {
  content: string
  data?: Record<string, unknown>
  imageUrl?: string
  error?: string
}

export interface StudioTool {
  name: string
  description: string
  execute(req: StudioRequest): Promise<StudioResult>
}

export interface StudioProvider {
  name: string
  tools: Record<string, StudioTool>
  execute(tool: StudioToolType, req: StudioRequest): Promise<StudioResult>
}

export const STUDIO_TOOL_DEFINITIONS: { id: StudioToolType; label: string; description: string; icon: string; color: string }[] = [
  { id: "ANALYZE_CHARACTERS", label: "Character Analysis", description: "Analyze character arcs, motivations, and development", icon: "👤", color: "from-pink-500 to-rose-700" },
  { id: "ANALYZE_TIMELINE", label: "Timeline", description: "Build chronological story timeline", icon: "📅", color: "from-blue-500 to-indigo-700" },
  { id: "ANALYZE_WORLD", label: "World History", description: "Generate world history and lore", icon: "🌍", color: "from-emerald-500 to-green-700" },
  { id: "ANALYZE_THEMES", label: "Themes & Analysis", description: "Identify themes, symbols, and motifs", icon: "🎭", color: "from-amber-500 to-orange-700" },
  { id: "ANALYZE_RELATIONSHIPS", label: "Relationships", description: "Map character relationships and dynamics", icon: "🔗", color: "from-cyan-500 to-teal-700" },
  { id: "CHARACTER_SHEET", label: "Character Sheet", description: "Generate detailed character design sheets", icon: "📋", color: "from-purple-500 to-violet-700" },
  { id: "WORLD_BUILDING", label: "World Building", description: "Create cultures, geography, magic systems", icon: "🏗️", color: "from-lime-500 to-emerald-700" },
  { id: "ENVIRONMENT", label: "Environment Design", description: "Design locations, landscapes, interiors", icon: "🏔️", color: "from-teal-500 to-cyan-700" },
  { id: "STORYBOARD_SCENE", label: "Storyboard Scene", description: "Convert chapter into visual storyboard", icon: "🎬", color: "from-blue-500 to-violet-700" },
  { id: "TRAILER_SCRIPT", label: "Trailer Script", description: "Write trailer narration and scene sequence", icon: "📝", color: "from-orange-500 to-red-700" },
  { id: "TRAILER_STORYBOARD", label: "Trailer Storyboard", description: "Visual storyboard for trailer", icon: "🎥", color: "from-fuchsia-500 to-pink-700" },
  { id: "PRODUCTION_BREAKDOWN", label: "Production Breakdown", description: "Break down story into production elements", icon: "📊", color: "from-indigo-500 to-blue-700" },
  { id: "SHOT_LIST", label: "Shot List", description: "Generate detailed shot-by-shot breakdown", icon: "🎯", color: "from-red-500 to-rose-700" },
  { id: "BUDGET_ESTIMATE", label: "Budget Estimate", description: "Estimate production costs", icon: "💰", color: "from-yellow-500 to-amber-700" },
  // ── Phase 5: AI Studio ──
  { id: "WRITING_AI", label: "Writing AI", description: "Polish prose, fix grammar, rewrite, adjust tone", icon: "✍️", color: "from-violet-500 to-purple-700" },
  { id: "STORY_AI", label: "Story AI", description: "Plot analysis, pacing, structure, consistency", icon: "📖", color: "from-blue-500 to-indigo-700" },
  { id: "CHARACTER_AI", label: "Character AI", description: "Generate sheets, analyze arcs, suggest traits", icon: "🎭", color: "from-pink-500 to-rose-700" },
  { id: "WORLD_BUILDER_AI", label: "World Builder AI", description: "Generate lore, cultures, magic systems, history", icon: "🌍", color: "from-emerald-500 to-teal-700" },
  { id: "ILLUSTRATION_AI", label: "Illustration AI", description: "Create images for characters, scenes, covers", icon: "🎨", color: "from-amber-500 to-orange-700" },
  { id: "SCREENPLAY_AI", label: "Screenplay AI", description: "Convert novel to screenplay, format dialogue", icon: "🎬", color: "from-cyan-500 to-blue-700" },
  { id: "MUSIC_AI", label: "Music AI", description: "Suggest mood-based music and ambience", icon: "🎵", color: "from-fuchsia-500 to-purple-700" },
  { id: "MARKETING_AI", label: "Marketing AI", description: "Generate blurbs, taglines, social posts", icon: "📢", color: "from-red-500 to-rose-700" },
]
