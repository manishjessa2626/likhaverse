export interface NarrationPreset {
  id: string
  label: string
  description: string
  icon: string
  speedMultiplier: number
  pitchMultiplier: number
  preferredVoiceType: "warm" | "deep" | "bright" | "calm" | "neutral"
  pauseMultiplier: number
  volumeVariation: number
}

export const NARRATION_PRESETS: NarrationPreset[] = [
  {
    id: "warm",
    label: "Warm & Cozy",
    description: "Gentle, inviting tone — perfect for romance and bedtime",
    icon: "🔥",
    speedMultiplier: 0.95,
    pitchMultiplier: 1.05,
    preferredVoiceType: "warm",
    pauseMultiplier: 1.1,
    volumeVariation: 0.15,
  },
  {
    id: "dramatic",
    label: "Dramatic",
    description: "Expressive storytelling with strong emotion",
    icon: "🎭",
    speedMultiplier: 0.9,
    pitchMultiplier: 1.1,
    preferredVoiceType: "deep",
    pauseMultiplier: 1.3,
    volumeVariation: 0.35,
  },
  {
    id: "calm",
    label: "Calm Bedtime",
    description: "Soothing, slow narration for relaxing",
    icon: "😴",
    speedMultiplier: 0.8,
    pitchMultiplier: 0.95,
    preferredVoiceType: "calm",
    pauseMultiplier: 1.4,
    volumeVariation: 0.1,
  },
  {
    id: "energetic",
    label: "Energetic",
    description: "Fast, exciting pace for action and adventure",
    icon: "⚡",
    speedMultiplier: 1.15,
    pitchMultiplier: 1.08,
    preferredVoiceType: "bright",
    pauseMultiplier: 0.7,
    volumeVariation: 0.25,
  },
  {
    id: "neutral",
    label: "Balanced",
    description: "Natural, even delivery — good for all genres",
    icon: "🎙️",
    speedMultiplier: 1,
    pitchMultiplier: 1,
    preferredVoiceType: "neutral",
    pauseMultiplier: 1,
    volumeVariation: 0.2,
  },
]

export interface VoicePersona {
  id: string
  name: string
  tagline: string
  voiceType: "warm" | "deep" | "bright" | "calm" | "neutral"
  pitchOffset: number
  recommendedGenres: string[]
  emoji: string
}

export function getVoicePersonas(): VoicePersona[] {
  return [
    {
      id: "sophia",
      name: "Sophia",
      tagline: "Warm storyteller",
      voiceType: "warm",
      pitchOffset: 0.05,
      recommendedGenres: ["romance", "drama", "fantasy"],
      emoji: "📖",
    },
    {
      id: "marcus",
      name: "Marcus",
      tagline: "Deep narrative voice",
      voiceType: "deep",
      pitchOffset: -0.1,
      recommendedGenres: ["horror", "thriller", "mystery", "action"],
      emoji: "🎧",
    },
    {
      id: "aria",
      name: "Aria",
      tagline: "Light & bright",
      voiceType: "bright",
      pitchOffset: 0.1,
      recommendedGenres: ["comedy", "adventure", "fantasy"],
      emoji: "✨",
    },
    {
      id: "diego",
      name: "Diego",
      tagline: "Calm, steady voice",
      voiceType: "calm",
      pitchOffset: 0,
      recommendedGenres: ["mystery", "drama", "scifi"],
      emoji: "🌙",
    },
    {
      id: "eloise",
      name: "Eloise",
      tagline: "Expressive narrator",
      voiceType: "neutral",
      pitchOffset: 0.02,
      recommendedGenres: ["romance", "drama", "fantasy", "adventure"],
      emoji: "🎭",
    },
  ]
}

export function findBestSystemVoice(
  personaType: string,
  systemVoices: SpeechSynthesisVoice[],
): SpeechSynthesisVoice | null {
  const english = systemVoices.filter((v) => v.lang.startsWith("en"))
  if (english.length === 0) return systemVoices[0] ?? null

  const nameScores: Record<string, string[]> = {
    warm: ["Samantha", "Karen", "Moira", "Tessa", "Veena", "Nicky"],
    deep: ["Daniel", "Alex", "Fred", "Rishi", "Ivy"],
    bright: ["Fiona", "Sara", "Joanna", "Kendra", "Ashley"],
    calm: ["Susan", "Catherine", "Linda", "Martha"],
    neutral: ["Google", "Microsoft", "Amazon", "Default"],
  }

  const preferred = nameScores[personaType] ?? nameScores.neutral
  for (const name of preferred) {
    const found = english.find((v) => v.name.includes(name))
    if (found) return found
  }

  return english[0] ?? null
}
