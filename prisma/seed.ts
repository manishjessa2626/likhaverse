import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaLibSql } from "@prisma/adapter-libsql"
import path from "path"

async function main() {
  const adapter = new PrismaLibSql({
    url: "file:" + path.join(__dirname, "../dev.db"),
  })

  const prisma = new PrismaClient({ adapter })

  const superAdminEmail = "admin@likhaverse.com"

  const existing = await prisma.user.findUnique({
    where: { email: superAdminEmail },
  })

  if (existing) {
    console.log("Database already seeded, skipping.")
    await prisma.$disconnect()
    return
  }

  const bcrypt = await import("bcryptjs")
  const hash = (pw: string) => bcrypt.hash(pw, 10)

  await prisma.user.create({
    data: {
      name: "LikhaVerse Admin",
      email: superAdminEmail,
      password: await hash("Admin123!"),
      role: "SUPER_ADMIN",
      bio: "Founder of LikhaVerse",
    },
  })

  const premium = await prisma.user.create({
    data: {
      name: "Premium Creator",
      email: "premium@likhaverse.com",
      password: await hash("Creator123!"),
      role: "PREMIUM_CREATOR",
      premium: true,
      premiumSince: new Date(),
      bio: "A premium storyteller",
    },
  })

  const author = await prisma.user.create({
    data: {
      name: "Test Author",
      email: "author@likhaverse.com",
      password: await hash("Author123!"),
      role: "AUTHOR",
      bio: "A passionate storyteller",
    },
  })

  const reader = await prisma.user.create({
    data: {
      name: "Test Reader",
      email: "reader@likhaverse.com",
      password: await hash("Reader123!"),
      role: "READER",
    },
  })

  const story = await prisma.story.create({
    data: {
      title: "The Last Ember",
      description: "In a world where fire is extinct, one girl discovers the last ember of hope.",
      tags: "fantasy,adventure,dystopian",
      status: "PUBLISHED",
      freePreviewChapters: 2,
      authorId: premium.id,
    },
  })

  await prisma.chapter.create({
    data: {
      title: "The Fading Light",
      content: `The sun had not risen in three hundred years.

Not that anyone living remembered what it looked like. The stories spoke of a golden orb that painted the sky in shades of orange and pink, but to Kira, those were just words. Empty, hollow words that meant nothing in a world of perpetual twilight.

She pulled her worn cloak tighter around her shoulders as she walked through the marketplace. The stalls were lit by bioluminescent fungi, their pale blue glow casting long shadows across the cobblestone streets. Merchants hawked their wares in hushed tones, their breath misting in the cold air.

"Kira! Kira, wait!"

She turned to see her friend Lian weaving through the crowd, his face flushed with excitement.

"Did you hear?" he asked, breathless. "They found something. In the ruins beneath the old temple."

Kira's heart quickened. "What kind of something?"

Lian's eyes gleamed in the fungal light. "Fire, Kira. Real fire."

She stared at him, searching his face for any sign of a joke. But Lian had never been a good liar.

"That's impossible," she whispered.

"Come see for yourself."`,
      number: 1,
      wordCount: 186,
      storyId: story.id,
    },
  })

  await prisma.chapter.create({
    data: {
      title: "The Discovery",
      content: `The temple ruins lay at the edge of the city, a crumbling monument to a time before the great dimming. Kira had passed it a hundred times, never giving it more than a passing glance. Now, as she followed Lian down the narrow staircase into the earth, she saw it with new eyes.

The air grew warmer as they descended. Kira noticed it first as a tingle on her skin, then as a faint glow emanating from somewhere below.

"See?" Lian whispered.

At the bottom of the stairs, nestled in a stone chamber that had been sealed for centuries, a small flame flickered in a brass brazier. It was no larger than a candle's flame, but it burned with an intensity that seemed impossible.

Kira approached slowly, her hand outstretched. The heat kissed her palm, and she gasped.

"It's real," she breathed.

"The elders need to know," Lian said. "This changes everything."

But Kira wasn't listening. Her eyes were fixed on the flame, on the dance of light that her people had not witnessed in three hundred years. In its glow, she saw not just fire, but possibility.

Hope.`,
      number: 2,
      wordCount: 203,
      storyId: story.id,
    },
  })

  await prisma.chapter.create({
    data: {
      title: "The Council",
      content: `The Council of Elders convened in the great hall, their faces lit by the ever-present fungal glow. Kira stood before them, the brass brazier in her hands, the small flame casting unfamiliar shadows across the room.

"You found this where?" Elder Maren asked, her voice skeptical.

"Beneath the old temple," Kira said. "In a chamber sealed since the dimming."

The elders exchanged glances. Elder Theron leaned forward, his old eyes reflecting the flame.

"Do you know what this means, child?" he asked softly.

"It means... we can bring back the light?" Kira ventured.

Theron shook his head. "It means the old prophecies were true. The fire did not die. It was hidden."

Murmurs spread through the hall. Kira clutched the brazier closer.

"Hidden by whom?" she asked.

No one answered. But in the silence, Kira understood that her discovery was just the beginning of a much larger mystery.`,
      number: 3,
      wordCount: 171,
      storyId: story.id,
    },
  })

  await prisma.follow.create({
    data: { followerId: reader.id, followingId: author.id },
  })

  await prisma.save.create({
    data: { userId: reader.id, storyId: story.id },
  })

  await prisma.comment.create({
    data: {
      content: "This is such a compelling story! I love the world-building.",
      userId: reader.id,
      storyId: story.id,
    },
  })

  console.log("Seed complete!")
  console.log("  Super Admin:    admin@likhaverse.com / Admin123!")
  console.log("  Premium Creator: premium@likhaverse.com / Creator123!")
  console.log("  Author:          author@likhaverse.com / Author123!")
  console.log("  Reader:          reader@likhaverse.com / Reader123!")

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
