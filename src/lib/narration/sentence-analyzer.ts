import type { NarrationSegment, SegmentType, Emotion } from "./types"

const EMOTION_KEYWORDS: Record<string, Emotion> = {
  fear: "fear", terrified: "fear", scared: "fear", afraid: "fear", panicked: "fear",
  trembling: "fear", horrified: "fear", dread: "fear", scream: "fear", screamed: "fear",
  joy: "joy", happy: "joy", delighted: "joy", thrilled: "joy", ecstatic: "joy",
  laughed: "joy", laughing: "joy", smile: "joy", smiled: "joy",
  anger: "anger", furious: "anger", enraged: "anger", shouted: "anger", yelled: "anger",
  slammed: "anger", growled: "anger", snapped: "anger",
  shock: "shock", gasped: "shock", stunned: "shock", astonished: "shock",
  amazement: "shock", unbelievable: "shock",
  sadness: "sadness", cried: "sadness", weeping: "sadness", sorrow: "sadness",
  grief: "sadness", mourned: "sadness", heartbreaking: "sadness",
  excitement: "excitement", rushed: "excitement", raced: "excitement", eagerly: "excitement",
  anticipation: "excitement", burst: "excitement",
  confusion: "confusion", confused: "confusion", puzzled: "confusion", bewildered: "confusion",
  uncertain: "confusion", unsure: "confusion",
  hope: "hope", hopeful: "hope", wishing: "hope", longed: "hope", dreamed: "hope",
  love: "love", loved: "love", adored: "love", cherished: "love", beloved: "love",
  curiosity: "curiosity", curious: "curiosity", wondered: "curiosity", peered: "curiosity",
  tension: "tension", tense: "tension", strained: "tension", anxious: "tension",
  nervous: "tension", lurking: "tension", crept: "tension", shadow: "tension",
  calm: "calm", peaceful: "calm", serene: "calm", quiet: "calm", gentle: "calm",
}

const DIALOGUE_PATTERN = /^[""''""]|[""''""]$/

export function detectEmotion(text: string): Emotion | null {
  const lower = text.toLowerCase()
  const words = lower.split(/\s+/)
  for (const word of words) {
    const cleaned = word.replace(/[^a-z]/g, "")
    const emotion = EMOTION_KEYWORDS[cleaned]
    if (emotion) return emotion
  }
  return null
}

export function classifySegment(text: string): SegmentType {
  const trimmed = text.trim()

  if (DIALOGUE_PATTERN.test(trimmed)) return "dialogue"

  const actionVerbs = ["walked", "ran", "jumped", "pulled", "pushed", "grabbed", "threw",
    "opened", "closed", "turned", "moved", "stepped", "climbed", "crawled", "raced",
  ]
  if (trimmed.length < 120) {
    const firstWord = trimmed.split(/\s+/)[0]?.toLowerCase()
    if (firstWord && actionVerbs.includes(firstWord)) return "action"
  }

  return "narration"
}

export function analyzeSentences(content: string): NarrationSegment[] {
  const paragraphs = content.split(/\n\s*\n/).filter(Boolean)
  const segments: NarrationSegment[] = []
  let charIndex = 0

  for (let pi = 0; pi < paragraphs.length; pi++) {
    const para = paragraphs[pi]
    const isSceneBreak = pi > 0 && para.length < 3

    if (isSceneBreak) {
      segments.push({
        text: para,
        type: "scene_break",
        punctuation: "none",
        emotion: null,
        isParagraphStart: true,
        isParagraphEnd: true,
        charIndex,
      })
      charIndex += para.length + 2
      continue
    }

    const sentences = para.match(/[^.!?]+[.!?]*\s*/g) ?? [para]
    for (let si = 0; si < sentences.length; si++) {
      const sentence = sentences[si].trim()
      if (!sentence) continue

      const lastChar = sentence[sentence.length - 1]
      let punctuation: NarrationSegment["punctuation"] = "none"
      if (lastChar === "!") punctuation = "!"
      else if (lastChar === "?") punctuation = "?"
      else if (sentence.endsWith("...")) punctuation = "..."
      else if (sentence.endsWith("—")) punctuation = "—"
      else if (lastChar === ",") punctuation = ","
      else if (lastChar === ".") punctuation = "."

      const type = classifySegment(sentence)
      const emotion = detectEmotion(sentence)

      segments.push({
        text: sentence,
        type,
        punctuation,
        emotion,
        isParagraphStart: si === 0,
        isParagraphEnd: si === sentences.length - 1,
        charIndex,
      })
      charIndex += sentences[si].length
    }
    charIndex += 2
  }

  return segments
}
