import type { GenerationType, ArtStyle } from "./types"
import { STYLE_MODIFIERS, GENERATION_PROMPTS } from "./types"

export function buildFinalPrompt(
  prompt: string,
  type: GenerationType,
  style: ArtStyle = "AUTO",
  fields?: {
    name?: string
    age?: string
    gender?: string
    species?: string
    personality?: string
    appearance?: string
    clothing?: string
    background?: string
    artStyle?: string
  }
): string {
  const parts: string[] = [prompt]

  const styleModifier = STYLE_MODIFIERS[style]
  if (styleModifier) {
    parts.push(styleModifier)
  }

  const typeInstructions = GENERATION_PROMPTS[type]
  if (typeInstructions) {
    parts.push(typeInstructions)
  }

  if (type === "CHARACTER" && fields) {
    const fieldParts: string[] = []
    if (fields.name) fieldParts.push(`Character name: ${fields.name}`)
    if (fields.age) fieldParts.push(`Age: ${fields.age}`)
    if (fields.gender) fieldParts.push(`Gender: ${fields.gender}`)
    if (fields.species) fieldParts.push(`Species: ${fields.species}`)
    if (fields.personality) fieldParts.push(`Personality: ${fields.personality}`)
    if (fields.appearance) fieldParts.push(`Appearance: ${fields.appearance}`)
    if (fields.clothing) fieldParts.push(`Clothing: ${fields.clothing}`)
    if (fields.background) fieldParts.push(`Background: ${fields.background}`)
    if (fieldParts.length > 0) {
      parts.push("Character details: " + fieldParts.join("; "))
    }
  }

  return parts.join(", ")
}
