export interface AchievementDef {
  key: string
  label: string
  description: string
  icon: string
}

export const ACHIEVEMENT_DEFS: AchievementDef[] = [
  { key: "first_story", label: "First Story", description: "Write your first story", icon: "✍️" },
  { key: "first_drawing", label: "First Drawing", description: "Add a drawing to your story", icon: "🎨" },
  { key: "read_5", label: "Read 5 Books", description: "Read 5 books from the library", icon: "📚" },
  { key: "read_10", label: "Read 10 Books", description: "Read 10 books from the library", icon: "📖" },
  { key: "streak_7", label: "7 Day Streak", description: "Read for 7 days in a row", icon: "🔥" },
  { key: "streak_30", label: "30 Day Streak", description: "Read for 30 days in a row", icon: "💪" },
  { key: "explorer", label: "Explorer", description: "Visit all sections of Junior Mode", icon: "🗺️" },
  { key: "nature_hero", label: "Nature Hero", description: "Read a story about nature", icon: "🌿" },
  { key: "animal_lover", label: "Animal Lover", description: "Read 3 stories about animals", icon: "🐾" },
  { key: "young_author", label: "Young Author", description: "Write 3 stories", icon: "📝" },
  { key: "creative_thinker", label: "Creative Thinker", description: "Use imagination prompts 5 times", icon: "💡" },
  { key: "bookworm", label: "Bookworm", description: "Read 20 books", icon: "🐛" },
  { key: "imagination_star", label: "Imagination Star", description: "Complete 10 stories", icon: "⭐" },
]

export function checkAchievements(junior: {
  booksRead: number
  storiesWritten: number
  streak: number
}): string[] {
  const earned: string[] = []

  if (junior.storiesWritten >= 1) earned.push("first_story")
  if (junior.booksRead >= 5) earned.push("read_5")
  if (junior.booksRead >= 10) earned.push("read_10")
  if (junior.booksRead >= 20) earned.push("bookworm")
  if (junior.streak >= 7) earned.push("streak_7")
  if (junior.streak >= 30) earned.push("streak_30")
  if (junior.storiesWritten >= 3) earned.push("young_author")
  if (junior.storiesWritten >= 10) earned.push("imagination_star")
  if (junior.booksRead >= 1 && junior.storiesWritten >= 1) earned.push("explorer")

  return earned
}
