import Database from "better-sqlite3"
import path from "path"

const db = new Database(path.join(import.meta.dirname, "..", "prisma", "dev.db"))

// Check if Maria Santos exists
const existing = db.prepare("SELECT id FROM User WHERE name = 'Maria Santos'").get() as { id: string } | undefined

let authorId: string
let adminId: string

if (existing) {
  authorId = existing.id
} else {
  // Create Maria Santos
  authorId = crypto.randomUUID()
  adminId = (db.prepare("SELECT id FROM User WHERE name = 'LikhaVerse Admin'").get() as { id: string }).id
  db.prepare(
    "INSERT INTO User (id, name, email, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))"
  ).run(authorId, "Maria Santos", "maria@example.com", "AUTHOR")

  // Create stories
  const stories = [
    { title: "Sigaw sa Dilim", tags: "Horror, Psychological Horror, Supernatural, Ghost, Mystery", description: "A series of disappearances in Metro Manila leads a young journalist down a rabbit hole of corruption, urban legends, and a truth darker than she ever imagined." },
    { title: "The Last Diwata", tags: "Fantasy, Adventure, Mythical, Philippine Mythology", description: "When the last forest spirit begins to fade, a young girl must embark on a perilous journey to save the magic of the Philippines." },
    { title: "Under the Buwan", tags: "Romance, Historical, Drama, Pre-colonial", description: "In a pre-colonial Philippine village, a chieftain's daughter and a wandering trader discover a love that transcends tradition." },
  ]

  for (let i = 0; i < stories.length; i++) {
    const s = stories[i]
    const storyId = crypto.randomUUID()
    db.prepare(
      "INSERT INTO Story (id, title, description, tags, status, accessType, freePreviewChapters, wordCount, viewCount, authorId, createdAt, updatedAt) VALUES (?, ?, ?, ?, 'PUBLISHED', 'FREE', 1, 0, 0, ?, datetime('now'), datetime('now'))"
    ).run(storyId, s.title, s.description, s.tags, authorId)

    // Create a sample chapter
    const chapterId = crypto.randomUUID()
    db.prepare(
      "INSERT INTO Chapter (id, title, content, number, wordCount, coinCost, storyId, createdAt, updatedAt) VALUES (?, 'Sample Chapter', 'This is a sample chapter content for ' || ?, 1, 10, 0, ?, datetime('now'), datetime('now'))"
    ).run(chapterId, s.title, storyId)
  }
}

// Now add covers using picsum
const stories = db.prepare("SELECT id, title FROM Story WHERE authorId = ?").all(authorId) as { id: string; title: string }[]
console.log("Stories:", stories)

const coverMap: Record<string, string> = {
  "Sigaw sa Dilim": "https://picsum.photos/seed/sigaw/600/800",
  "The Last Diwata": "https://picsum.photos/seed/diwata/600/800",
  "Under the Buwan": "https://picsum.photos/seed/buwan/600/800",
}

for (const story of stories) {
  const url = coverMap[story.title]
  if (url) {
    db.prepare("UPDATE Story SET cover = ? WHERE id = ?").run(url, story.id)
    console.log(`✓ "${story.title}" → ${url}`)
  } else {
    console.log(`✗ No cover for "${story.title}"`)
  }
}

db.close()
console.log("\nDone!")
