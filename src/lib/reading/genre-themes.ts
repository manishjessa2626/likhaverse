export interface GenreTheme {
  bg: string
  text: string
  accent: string
  page: string
  spine: string
  coverBg: string
  label: string
}

const GENRE_THEMES: Record<string, GenreTheme> = {
  horror: {
    bg: "#0a0a0a",
    text: "#d4d4d4",
    accent: "#ef4444",
    page: "#151515",
    spine: "#111",
    coverBg: "#1a0505",
    label: "Horror",
  },
  "psychological horror": {
    bg: "#0d0d14",
    text: "#d0d0d8",
    accent: "#a855f7",
    page: "#18182a",
    spine: "#12121e",
    coverBg: "#0d0d1a",
    label: "Psychological Horror",
  },
  supernatural: {
    bg: "#08081a",
    text: "#c8c8e0",
    accent: "#6366f1",
    page: "#15152a",
    spine: "#0f0f20",
    coverBg: "#080820",
    label: "Supernatural",
  },
  ghost: {
    bg: "#0a0a12",
    text: "#d0d0d8",
    accent: "#94a3b8",
    page: "#161626",
    spine: "#111120",
    coverBg: "#0a0a18",
    label: "Ghost",
  },
  "haunted mirror": {
    bg: "#0a0a14",
    text: "#c8d0d8",
    accent: "#22d3ee",
    page: "#15152a",
    spine: "#101020",
    coverBg: "#0a0a1a",
    label: "Haunted Mirror",
  },
  mystery: {
    bg: "#0f0f0f",
    text: "#d4d4d4",
    accent: "#f59e0b",
    page: "#1a1a1a",
    spine: "#141414",
    coverBg: "#0f0f05",
    label: "Mystery",
  },
  "dark fantasy": {
    bg: "#0a000a",
    text: "#d0c0d0",
    accent: "#dc2626",
    page: "#1a0a1a",
    spine: "#120a12",
    coverBg: "#0a000a",
    label: "Dark Fantasy",
  },
  thriller: {
    bg: "#050505",
    text: "#e0e0e0",
    accent: "#f97316",
    page: "#141414",
    spine: "#0a0a0a",
    coverBg: "#050505",
    label: "Thriller",
  },
  fantasy: {
    bg: "#0a0a1a",
    text: "#c8c8e0",
    accent: "#a78bfa",
    page: "#15152a",
    spine: "#0f0f20",
    coverBg: "#0a0a20",
    label: "Fantasy",
  },
  romance: {
    bg: "#1a0a14",
    text: "#e0d0d8",
    accent: "#f472b6",
    page: "#2a1524",
    spine: "#221020",
    coverBg: "#1a0a18",
    label: "Romance",
  },
  comedy: {
    bg: "#14140a",
    text: "#d8d8c8",
    accent: "#a3e635",
    page: "#242415",
    spine: "#1c1c10",
    coverBg: "#141408",
    label: "Comedy",
  },
  adventure: {
    bg: "#0a1410",
    text: "#d0d8d4",
    accent: "#f59e0b",
    page: "#152418",
    spine: "#101c14",
    coverBg: "#0a1410",
    label: "Adventure",
  },
  drama: {
    bg: "#0f0f12",
    text: "#d0d0d4",
    accent: "#60a5fa",
    page: "#1a1a24",
    spine: "#141420",
    coverBg: "#0f0f18",
    label: "Drama",
  },
}

const genreAliases: Record<string, string> = {
  "sci-fi": "supernatural",
  scifi: "supernatural",
  "fan fiction": "drama",
  historical: "drama",
  action: "thriller",
  comic: "comedy",
}

export function getGenreTheme(tags?: string | null): GenreTheme | null {
  if (!tags) return null
  const tagList = tags.toLowerCase().split(",").map((t) => t.trim()).filter(Boolean)
  for (const tag of tagList) {
    const key = genreAliases[tag] ?? tag
    if (GENRE_THEMES[key]) return GENRE_THEMES[key]
  }
  return null
}

export function getReaderDarkTheme(tags?: string | null): {
  bg: string
  text: string
  accent: string
  page: string
  spine: string
  coverBg: string
} | null {
  const theme = getGenreTheme(tags)
  if (!theme) return null
  return {
    bg: theme.bg,
    text: theme.text,
    accent: theme.accent,
    page: theme.page,
    spine: theme.spine,
    coverBg: theme.coverBg,
  }
}

export function getEditorTheme(tags?: string | null): { bg: string; accent: string } {
  const theme = getGenreTheme(tags)
  if (!theme) return { bg: "#000", accent: "#71717a" }
  return { bg: theme.bg, accent: theme.accent }
}
