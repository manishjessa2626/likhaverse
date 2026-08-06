export const SAFE_GENRES = [
  "adventure",
  "animals",
  "bedtime",
  "comedy",
  "educational",
  "fairy_tale",
  "family",
  "fantasy",
  "friendship",
  "history",
  "mystery",
  "nature",
  "school_life",
  "science",
  "space",
  "sports",
  "values_kindness",
  "folklore",
] as const

export type SafeGenre = (typeof SAFE_GENRES)[number]

export const SAFE_GENRE_LABELS: Record<SafeGenre, string> = {
  adventure: "Adventure",
  animals: "Animals",
  bedtime: "Bedtime Stories",
  comedy: "Comedy",
  educational: "Educational",
  fairy_tale: "Fairy Tales",
  family: "Family",
  fantasy: "Fantasy",
  friendship: "Friendship",
  history: "History",
  mystery: "Mystery",
  nature: "Nature",
  school_life: "School Life",
  science: "Science",
  space: "Space",
  sports: "Sports",
  values_kindness: "Values & Kindness",
  folklore: "Folklore",
}

export const SAFE_GENRE_EMOJIS: Record<SafeGenre, string> = {
  adventure: "🗺️",
  animals: "🐾",
  bedtime: "🌙",
  comedy: "😄",
  educational: "📖",
  fairy_tale: "👑",
  family: "👨‍👩‍👧‍👦",
  fantasy: "✨",
  friendship: "🤝",
  history: "🏛️",
  mystery: "🔍",
  nature: "🌿",
  school_life: "🎒",
  science: "🔬",
  space: "🚀",
  sports: "⚽",
  values_kindness: "💛",
  folklore: "📜",
}

export const BLOCKED_GENRES = [
  "horror", "psychological_horror", "thriller", "crime", "dark_fantasy",
  "gore", "slasher", "mature_romance", "erotica", "nsfw",
  "heavy_violence", "drug", "gambling", "explicit_language",
]

export function isValidSafeGenre(genre: string): genre is SafeGenre {
  return SAFE_GENRES.includes(genre as SafeGenre)
}

export function validateGenreOrThrow(genre: string): void {
  if (!isValidSafeGenre(genre)) {
    const msg = `Genre "${genre}" is not allowed for junior writing. Choose a safe genre.`
    throw new Error(msg)
  }
}

export interface ModerationFlag {
  type: string
  detail: string
}

const MODERATION_PATTERNS: { type: string; patterns: RegExp[] }[] = [
  {
    type: "graphic_violence",
    patterns: [
      /\b(kill|killed|killing|murder|murdered|blood|bleeding|bleed|stab|stabbing|stabbed|torture|tortured|painful|scream(ing)? in pain)\b/i,
    ],
  },
  {
    type: "gore",
    patterns: [
      /\b(gore|guts|dismember|decapitate|behead|severed|corpse|dead body|carcass|entrail)\b/i,
    ],
  },
  {
    type: "sexual_content",
    patterns: [
      /\b(sexy|sexy|sexual|naked|nude|undress|undressed|porn|erotic|intimate|bedroom(?! scenes| story))\b/i,
    ],
  },
  {
    type: "explicit_language",
    patterns: [
      /\b(fuck|shit|damn|bitch|asshole|bastard|motherfucker|dick|pissed off|crap(?!py)|hell(?!o|p|met))\b/i,
    ],
  },
  {
    type: "drug_references",
    patterns: [
      /\b(drug|drugs|weed|cocaine|heroin|meth|marijuana|crack|overdose|addict|addiction|syringe|needle)\b/i,
    ],
  },
  {
    type: "gambling",
    patterns: [
      /\b(gambl|casino|betting|poker|blackjack|slot machine|roulette)\b/i,
    ],
  },
  {
    type: "self_harm",
    patterns: [
      /\b(suicide|kill myself|end my life|self-harm|self harm|cutting|hurt myself|harm myself)\b/i,
    ],
  },
  {
    type: "adult_themes",
    patterns: [
      /\b(prostitut|pimp|sex work|strip club|meth lab|cartel|mafia)\b/i,
    ],
  },
]

export function moderateContent(title: string, content: string): ModerationFlag[] {
  const flags: ModerationFlag[] = []
  const searchText = `${title} ${content}`.toLowerCase()

  for (const category of MODERATION_PATTERNS) {
    for (const pattern of category.patterns) {
      const match = searchText.match(pattern)
      if (match) {
        flags.push({ type: category.type, detail: `Detected: "${match[0]}"` })
        break
      }
    }
  }

  return flags
}

export function getContentSuitableForAllAges(title: string, content: string): boolean {
  return moderateContent(title, content).length === 0
}
