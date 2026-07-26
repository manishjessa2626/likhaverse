export type Genre = "comedy" | "horror" | "romance" | "action" | "mystery" | "fantasy" | "drama" | "thriller" | "scifi" | "adventure" | "default"

export type SegmentType = "narration" | "dialogue" | "action" | "thought" | "scene_break" | "chapter_end"

export interface NarrationSegment {
  text: string
  type: SegmentType
  punctuation: "none" | "." | "!" | "?" | "..." | "—" | ","
  emotion: Emotion | null
  isParagraphStart: boolean
  isParagraphEnd: boolean
  charIndex: number
}

export type Emotion =
  | "fear"
  | "joy"
  | "anger"
  | "shock"
  | "sadness"
  | "excitement"
  | "embarrassment"
  | "confusion"
  | "hope"
  | "love"
  | "curiosity"
  | "tension"
  | "calm"
  | "none"

export interface GenreDeliveryProfile {
  baseSpeed: number
  basePitch: number
  pauseAfterSentence: number
  pauseAfterParagraph: number
  pauseAfterDialogue: number
  pauseAfterSceneBreak: number
  pauseAfterEllipsis: number
  pauseAfterExclamation: number
  pauseAfterQuestion: number
  dialoguePitchShift: number
  emotionPitchShift: Record<string, number>
  emotionSpeedShift: Record<string, number>
  label: string
}

export interface SpeakOptions {
  text: string
  rate: number
  pitch: number
  volume: number
  voice?: string | null
}

export interface Voice {
  id: string
  name: string
  lang: string
  isDefault: boolean
  provider: string
}

export interface PlayerState {
  isOpen: boolean
  isPlaying: boolean
  isPaused: boolean
  currentSegment: number
  totalSegments: number
  segments: NarrationSegment[]
  progress: number
  elapsed: number
  duration: number
  speed: number
  voice: string | null
  pitch: number
  volume: number
  genre: Genre
  preset: string
}
