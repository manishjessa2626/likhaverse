import type { Genre, GenreDeliveryProfile, NarrationSegment } from "./types"

const GENRE_PROFILES: Record<string, GenreDeliveryProfile> = {
  comedy: {
    baseSpeed: 1.1, basePitch: 1.1,
    pauseAfterSentence: 300, pauseAfterParagraph: 600, pauseAfterDialogue: 200,
    pauseAfterSceneBreak: 800, pauseAfterEllipsis: 600, pauseAfterExclamation: 400,
    pauseAfterQuestion: 350,
    dialoguePitchShift: 0.08,
    emotionPitchShift: { joy: 0.15, excitement: 0.12 },
    emotionSpeedShift: { joy: 0.1, excitement: 0.1 },
    label: "Light-hearted",
  },
  horror: {
    baseSpeed: 0.85, basePitch: 0.9,
    pauseAfterSentence: 500, pauseAfterParagraph: 1000, pauseAfterDialogue: 400,
    pauseAfterSceneBreak: 1500, pauseAfterEllipsis: 1200, pauseAfterExclamation: 600,
    pauseAfterQuestion: 500,
    dialoguePitchShift: 0.05,
    emotionPitchShift: { fear: -0.15, tension: -0.1, shock: 0.2 },
    emotionSpeedShift: { fear: -0.15, tension: -0.1, shock: -0.05 },
    label: "Suspenseful",
  },
  romance: {
    baseSpeed: 1.0, basePitch: 1.05,
    pauseAfterSentence: 400, pauseAfterParagraph: 800, pauseAfterDialogue: 300,
    pauseAfterSceneBreak: 1000, pauseAfterEllipsis: 800, pauseAfterExclamation: 400,
    pauseAfterQuestion: 400,
    dialoguePitchShift: 0.1,
    emotionPitchShift: { love: 0.1, hope: 0.08, sadness: -0.05 },
    emotionSpeedShift: { love: -0.05, hope: 0, sadness: -0.1 },
    label: "Warm",
  },
  action: {
    baseSpeed: 1.15, basePitch: 1.05,
    pauseAfterSentence: 200, pauseAfterParagraph: 400, pauseAfterDialogue: 150,
    pauseAfterSceneBreak: 600, pauseAfterEllipsis: 400, pauseAfterExclamation: 300,
    pauseAfterQuestion: 250,
    dialoguePitchShift: 0.06,
    emotionPitchShift: { excitement: 0.15, anger: 0.12, shock: 0.18 },
    emotionSpeedShift: { excitement: 0.12, anger: 0.1, shock: 0.08 },
    label: "Energetic",
  },
  mystery: {
    baseSpeed: 0.9, basePitch: 0.95,
    pauseAfterSentence: 500, pauseAfterParagraph: 1000, pauseAfterDialogue: 350,
    pauseAfterSceneBreak: 1200, pauseAfterEllipsis: 1000, pauseAfterExclamation: 500,
    pauseAfterQuestion: 500,
    dialoguePitchShift: 0.05,
    emotionPitchShift: { curiosity: 0.05, tension: -0.1, confusion: -0.05 },
    emotionSpeedShift: { curiosity: -0.05, tension: -0.1, confusion: -0.05 },
    label: "Thoughtful",
  },
  fantasy: {
    baseSpeed: 1.0, basePitch: 1.08,
    pauseAfterSentence: 400, pauseAfterParagraph: 800, pauseAfterDialogue: 300,
    pauseAfterSceneBreak: 1000, pauseAfterEllipsis: 700, pauseAfterExclamation: 500,
    pauseAfterQuestion: 400,
    dialoguePitchShift: 0.08,
    emotionPitchShift: { wonder: 0.12, excitement: 0.1, fear: -0.08 },
    emotionSpeedShift: { wonder: 0, excitement: 0.08, fear: -0.1 },
    label: "Epic",
  },
  drama: {
    baseSpeed: 0.95, basePitch: 1.0,
    pauseAfterSentence: 450, pauseAfterParagraph: 900, pauseAfterDialogue: 350,
    pauseAfterSceneBreak: 1200, pauseAfterEllipsis: 900, pauseAfterExclamation: 500,
    pauseAfterQuestion: 450,
    dialoguePitchShift: 0.08,
    emotionPitchShift: { sadness: -0.1, anger: 0.12, love: 0.08, shock: 0.15 },
    emotionSpeedShift: { sadness: -0.1, anger: 0.08, love: -0.05, shock: -0.05 },
    label: "Emotional",
  },
  thriller: {
    baseSpeed: 0.9, basePitch: 0.9,
    pauseAfterSentence: 450, pauseAfterParagraph: 900, pauseAfterDialogue: 350,
    pauseAfterSceneBreak: 1200, pauseAfterEllipsis: 1000, pauseAfterExclamation: 550,
    pauseAfterQuestion: 450,
    dialoguePitchShift: 0.05,
    emotionPitchShift: { tension: -0.12, fear: -0.15, shock: 0.2 },
    emotionSpeedShift: { tension: -0.12, fear: -0.15, shock: -0.05 },
    label: "Suspenseful",
  },
  scifi: {
    baseSpeed: 1.0, basePitch: 1.02,
    pauseAfterSentence: 350, pauseAfterParagraph: 700, pauseAfterDialogue: 250,
    pauseAfterSceneBreak: 900, pauseAfterEllipsis: 600, pauseAfterExclamation: 400,
    pauseAfterQuestion: 350,
    dialoguePitchShift: 0.06,
    emotionPitchShift: { curiosity: 0.08, excitement: 0.1, tension: -0.05 },
    emotionSpeedShift: { curiosity: 0, excitement: 0.08, tension: -0.08 },
    label: "Futuristic",
  },
  adventure: {
    baseSpeed: 1.1, basePitch: 1.05,
    pauseAfterSentence: 300, pauseAfterParagraph: 600, pauseAfterDialogue: 200,
    pauseAfterSceneBreak: 800, pauseAfterEllipsis: 500, pauseAfterExclamation: 400,
    pauseAfterQuestion: 300,
    dialoguePitchShift: 0.07,
    emotionPitchShift: { excitement: 0.12, joy: 0.1, shock: 0.15 },
    emotionSpeedShift: { excitement: 0.1, joy: 0.08, shock: 0.05 },
    label: "Energetic",
  },
}

const DEFAULT_PROFILE: GenreDeliveryProfile = {
  baseSpeed: 1.0, basePitch: 1.0,
  pauseAfterSentence: 350, pauseAfterParagraph: 700, pauseAfterDialogue: 250,
  pauseAfterSceneBreak: 1000, pauseAfterEllipsis: 700, pauseAfterExclamation: 400,
  pauseAfterQuestion: 350,
  dialoguePitchShift: 0.05,
  emotionPitchShift: {},
  emotionSpeedShift: {},
  label: "Standard",
}

export function getGenreProfile(genre: Genre): GenreDeliveryProfile {
  return GENRE_PROFILES[genre] ?? DEFAULT_PROFILE
}

export function computeDelivery(
  segment: NarrationSegment,
  profile: GenreDeliveryProfile,
  userSpeed: number,
  userPitch: number,
): { rate: number; pitch: number; pauseMs: number } {
  let rate = profile.baseSpeed * userSpeed
  let pitch = profile.basePitch * userPitch

  if (segment.type === "dialogue") {
    pitch += profile.dialoguePitchShift
  }

  if (segment.type === "action") {
    rate += 0.08
  }

  if (segment.emotion) {
    const pShift = profile.emotionPitchShift[segment.emotion] ?? 0
    const sShift = profile.emotionSpeedShift[segment.emotion] ?? 0
    pitch += pShift
    rate += sShift
  }

  if (segment.punctuation === "!") {
    rate += 0.05
    pitch += 0.08
  }
  if (segment.punctuation === "?") {
    pitch += 0.03
  }

  let pauseMs = profile.pauseAfterSentence
  if (segment.type === "dialogue") pauseMs = profile.pauseAfterDialogue
  if (segment.punctuation === "!") pauseMs = profile.pauseAfterExclamation
  if (segment.punctuation === "?") pauseMs = profile.pauseAfterQuestion
  if (segment.punctuation === "...") pauseMs = profile.pauseAfterEllipsis
  if (segment.punctuation === "—") pauseMs = profile.pauseAfterEllipsis
  if (segment.isParagraphEnd) pauseMs = profile.pauseAfterParagraph
  if (segment.type === "scene_break") pauseMs = profile.pauseAfterSceneBreak

  if (segment.emotion === "tension" || segment.emotion === "fear") {
    pauseMs += 200
  }

  return {
    rate: Math.max(0.5, Math.min(2, rate)),
    pitch: Math.max(0.5, Math.min(2, pitch)),
    pauseMs,
  }
}
