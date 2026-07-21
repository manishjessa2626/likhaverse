export type Genre =
  | "fantasy"
  | "romance"
  | "horror"
  | "scifi"
  | "mystery"
  | "adventure"
  | "comedy"
  | "drama"

export type ParticleStyle = "stars" | "embers" | "fog" | "rain" | "petals" | "none"

export interface ParticleConfig {
  style: ParticleStyle
  count: number
}

export interface SoundConfig {
  type: "drone" | "noise" | "tone" | "none"
  frequency: number
  filterFrequency: number
  gain: number
}

export interface AmbienceTheme {
  label: string
  gradient: string
  bgColor: string
  accentColor: string
  textColor: string
  particles: ParticleConfig
  sound: SoundConfig
  glowColor: string
}

export interface AmbienceState {
  enabled: boolean
  genres: Genre[]
  intensity: number
}

export const GENRE_LABELS: Record<Genre, string> = {
  fantasy: "Fantasy",
  romance: "Romance",
  horror: "Horror",
  scifi: "Sci-Fi",
  mystery: "Mystery",
  adventure: "Adventure",
  comedy: "Comedy",
  drama: "Drama",
}
