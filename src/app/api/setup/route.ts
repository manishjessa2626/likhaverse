import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Pool } from "pg"
import fs from "fs"
import path from "path"
import bcrypt from "bcryptjs"

export const dynamic = "force-dynamic"

async function applySchema(): Promise<string> {
  const schemaPath = path.join(process.cwd(), "schema.sql")
  if (!fs.existsSync(schemaPath)) return "schema.sql not found"

  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const sql = fs.readFileSync(schemaPath, "utf8")

  const stmts: string[] = []
  let current = ""
  for (const line of sql.split("\n")) {
    const trimmed = line.trim()
    if (trimmed.startsWith("--") || trimmed === "") continue
    current += line + "\n"
    if (trimmed.endsWith(";")) {
      stmts.push(current.trim())
      current = ""
    }
  }
  if (current.trim()) stmts.push(current.trim())

  let ok = 0
  let fail = 0
  const errors: string[] = []
  for (const s of stmts) {
    try {
      await pool.query(s)
      ok++
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string }
      if (e.code === "42P07" || e.code === "42710") {
        ok++
      } else {
        fail++
        if (fail <= 5) errors.push(e.message || String(e))
      }
    }
  }
  await pool.end()
  return `${ok} ok, ${fail} failed${errors.length ? ": " + errors.join("; ") : ""}`
}

async function hash(pw: string): Promise<string> {
  return bcrypt.hash(pw, 10)
}

async function seed(): Promise<string> {
  const [adminPw, authorPw, readerPw] = await Promise.all([
    hash("Admin123!"), hash("author123"), hash("reader123"),
  ])

  const admin = await prisma.user.upsert({
    where: { email: "admin@likhaverse.com" },
    update: { password: adminPw, role: "SUPER_ADMIN", isVerified: true },
    create: { name: "Admin", email: "admin@likhaverse.com", password: adminPw, provider: "email", role: "SUPER_ADMIN", isVerified: true },
  })

  const author = await prisma.user.upsert({
    where: { email: "author@likhaverse.com" },
    update: { password: authorPw, role: "AUTHOR", isVerified: true, name: "Maria Santos" },
    create: { name: "Maria Santos", email: "author@likhaverse.com", password: authorPw, provider: "email", role: "AUTHOR", isVerified: true },
  })

  const reader = await prisma.user.upsert({
    where: { email: "reader@likhaverse.com" },
    update: { password: readerPw, role: "READER", isVerified: true, name: "Juan dela Cruz" },
    create: { name: "Juan dela Cruz", email: "reader@likhaverse.com", password: readerPw, provider: "email", role: "READER", isVerified: true },
  })

  // ── Se ed content only if no stories exist ──
  const existingCount = await prisma.story.count()
  if (existingCount > 0) {
    return `Admin (${admin.id}), author (${author.id}), reader (${reader.id}) — ${existingCount} stories already exist, skipping content seed`
  }

  const logs: string[] = []
  const now = new Date()

  // ── Story 1: Under the Buwan (romance, historical, drama) ──
  const story1 = await prisma.story.create({
    data: {
      title: "Under the Buwan",
      description: "In a pre-colonial Philippine village, a chieftain's daughter and a wandering trader discover a love that transcends tradition. Set against moonlit mountains and ancient seas, this is a tale of forbidden romance and the courage to choose one's own destiny.",
      tags: "romance,historical,drama",
      status: "PUBLISHED",
      viewCount: 1247,
      wordCount: 4500,
      authorId: author.id,
      createdAt: new Date(now.getTime() - 604800000 * 2),
    },
  })

  const season1 = await prisma.season.create({
    data: { title: "Season 1", number: 1, storyId: story1.id },
  })

  await prisma.chapter.createMany({
    data: [
      {
        title: "The First Encounter",
        content: `The morning sun cast golden rays across the rice terraces as Mayari made her way down the winding path to the river. The water sang its ancient song, a melody older than the mountains themselves.

It was there she saw him — a stranger with eyes the color of the deep sea, washing his face in the cool current. His clothes were those of a trader from the south, fine silk that spoke of distant lands.

Their eyes met, and the world fell silent.

"Magandang umaga," he said, his voice warm like the honey from the wild bees.

Mayari's heart stuttered. She had been promised to another — the son of a neighboring chieftain — but in this moment, none of that mattered. All that existed was the space between them, charged with possibility.

"Magandang umaga," she replied, and the word felt like a promise.`,
        wordCount: 1500,
        number: 1,
        storyId: story1.id,
        seasonId: season1.id,
      },
      {
        title: "Moonlit Confessions",
        content: `Under the light of the full moon, Mayari slipped away from her father's longhouse. The night was alive with the sound of crickets and the distant call of a kuwago.

He was waiting at the ancient balete tree, where they had agreed to meet. His face was half-illuminated by the moonlight, making him look like a diwata from the old stories.

"I cannot stop thinking about you," KALIW whispered, taking her hand. "Every moment away from you feels like an eternity."

"Then take me with you," Mayari said, her voice trembling with conviction. "When you leave for the southern islands, take me with you."

He looked at her with a mix of hope and fear. "Your father would never allow it. The alliance with the neighboring tribe — "

"I don't care about alliances," she interrupted. "I care about this. About us."

He pulled her close, and under the watchful eye of the buwan, they made a pact that would change their lives forever.`,
        wordCount: 1800,
        number: 2,
        storyId: story1.id,
        seasonId: season1.id,
      },
    ],
  })

  // ── Story 2: The Last Diwata (fantasy, drama, adventure) ──
  const story2 = await prisma.story.create({
    data: {
      title: "The Last Diwata",
      description: "When the last forest spirit begins to fade, a young girl must embark on a perilous journey to save the magic of the Philippines. A story of courage, sacrifice, and the enduring power of nature.",
      tags: "fantasy,drama,adventure",
      status: "PUBLISHED",
      viewCount: 892,
      wordCount: 7200,
      original: true,
      studioBadge: true,
      authorId: author.id,
      createdAt: new Date(now.getTime() - 604800000 * 4),
    },
  })

  const season2 = await prisma.season.create({
    data: { title: "Book One: The Fading Light", number: 1, storyId: story2.id },
  })

  await prisma.chapter.createMany({
    data: [
      {
        title: "The Dying Forest",
        content: `The forest that had once been vibrant with life was now silent.

Maya walked through the dying trees, her bare feet pressing into soil that had turned gray and lifeless. The diwata — the forest spirits her grandmother had told her stories about — were disappearing one by one.

"Lola used to say the forest sang," Maya whispered to herself. "Now it barely breathes."

She found the ancient balete tree, its branches reaching toward the sky like the gnarled fingers of a sleeping giant. And there, barely visible, was a faint glow — the last diwata.

"It is good you came," the spirit said, its voice like wind through dry leaves. "I do not have much time."

Maya knelt, tears streaming down her face. "How do I save you?"

"The answer lies in the heart of the Sierra Madre. But the journey is dangerous, little one."

"I'm not afraid," Maya said, though her voice shook.

The diwata smiled, a fleeting glimmer of warmth. "Then let us begin."`,
        wordCount: 2100,
        number: 1,
        storyId: story2.id,
        seasonId: season2.id,
      },
      {
        title: "Awakening",
        content: `The cave of echoes was hidden behind a waterfall that sparkled like a thousand diamonds in the morning light. Maya had traveled for three days, following the diwata's whispered guidance.

Inside, the walls were covered in ancient drawings — stories of the first diwata, of the time when humans and spirits lived together in harmony.

"The developers," Maya said, touching one of the drawings. "They're the ones destroying the forest."

"Greed clouds the heart," the diwata's voice echoed around her. "But there is still hope."

In the center of the cave, a pool of water shimmered with an otherworldly light. Maya dipped her hands in, and visions flooded her mind — the forest as it once was, teeming with life and magic.

She saw what she had to do.

"I need to find the Heart of the Mountain," she said, determination steeling her voice.

The diwata's light pulsed with approval. "You are braver than you know, Maya."`,
        wordCount: 2400,
        number: 2,
        storyId: story2.id,
        seasonId: season2.id,
      },
      {
        title: "Sacrifice",
        content: `The Heart of the Mountain was not a jewel or a treasure chest. It was a single seed, glowing with the accumulated magic of centuries.

"You must plant it," the diwata said, its form barely visible now. "In the heart of the dying forest."

"But will it save you?" Maya asked, clutching the seed to her chest.

The diwata was silent for a long moment. "It will save the forest. That is what matters."

Maya understood. The last diwata would not survive — its essence would become the seed, and the seed would become a new beginning.

"Thank you," Maya whispered, tears streaming down her face. "For everything."

"It is I who should thank you, little one. In your courage, the forest lives again."

Maya planted the seed at the base of the ancient balete tree. As the first rays of dawn broke through the canopy, a new light spread across the land — and the forest began to sing once more.`,
        wordCount: 2700,
        number: 3,
        storyId: story2.id,
        seasonId: season2.id,
      },
    ],
  })

  // ── Story 3: Sigaw sa Dilim (mystery, thriller, horror) ──
  const story3 = await prisma.story.create({
    data: {
      title: "Sigaw sa Dilim",
      description: "A series of disappearances in Metro Manila leads a young journalist down a rabbit hole of corruption, urban legends, and a truth darker than she ever imagined. In a city that never sleeps, something is hunting in the shadows.",
      tags: "mystery,thriller,horror",
      status: "PUBLISHED",
      viewCount: 2156,
      wordCount: 5800,
      authorId: author.id,
      createdAt: new Date(now.getTime() - 604800000),
    },
  })

  const season3 = await prisma.season.create({
    data: { title: "Part 1: The Missing", number: 1, storyId: story3.id },
  })

  await prisma.chapter.createMany({
    data: [
      {
        title: "The Disappearance",
        content: `The call came at 3 AM.

Jasmine's phone buzzed against the nightstand, its screen lighting up the dark bedroom. She fumbled for it, her journalist instincts already on high alert.

"I know it's late," her editor's voice crackled through the speaker, "but we've got another one."

Another disappearance. That made seven in the past three weeks.

"The victim is a college student from UP," her editor continued. "Last seen near the old railway tracks in Tayuman."

Jasmine was already pulling on her jacket. "I'm on it."

The streets of Manila at 3 AM were a different world. The neon lights of 24-hour establishments cast long shadows, and the air smelled of diesel and rain. As she drove toward Tayuman, she couldn't shake the feeling that something was watching from the darkness.

At the crime scene, police tape fluttered in the wind. But the officers looked uneasy — they had seen something they couldn't explain.

"Ma'am, I need you to stay behind the line," a young officer said.

"What did you find?" Jasmine asked, her reporter's notebook already in hand.

The officer hesitated, then leaned closer. "Nothing. That's the problem. No footprints. No struggle. It's like she just... vanished into thin air."

Jasmine felt a chill run down her spine.`,
        wordCount: 1900,
        number: 1,
        storyId: story3.id,
        seasonId: season3.id,
      },
      {
        title: "Clues in the Dark",
        content: `Jasmine's investigation led her to the urban legends forum on the dark web, where users shared stories of "The Shadow Man" — a figure that supposedly haunted the old railway lines of Manila.

According to the threads, the Shadow Man appeared only to those who were alone at night. He would whisper their name, and if they turned to look, they would never be seen again.

It was superstition, of course. Jasmine didn't believe in ghosts.

But then she found the photographs.

Each disappearance was preceded by a figure in the background of security camera footage — a tall, dark shape that seemed to blur when examined closely. The authorities had dismissed it as a camera artifact.

Jasmine zoomed in on the shape from the latest footage. Her blood ran cold.

It was wearing a familiar jacket — the same one her father had worn the night he disappeared fifteen years ago.

She stumbled back from her desk, her heart pounding. The case had just become personal.

"This is not just a story," she whispered. "This is my story."`,
        wordCount: 1900,
        number: 2,
        storyId: story3.id,
        seasonId: season3.id,
      },
    ],
  })

  // ── Characters ──
  await prisma.character.createMany({
    data: [
      { name: "Mayari", age: "19", gender: "Female", personality: "Brave, passionate, free-spirited", appearance: "Long black hair, deep brown eyes, sun-kissed skin", clothing: "Traditional baro't saya in deep red", storyId: story1.id, authorId: author.id },
      { name: "KALIW", age: "22", gender: "Male", personality: "Wanderer, gentle, determined", appearance: "Tall, sea-green eyes, trader's build", clothing: "Silk barong Tagalog", storyId: story1.id, authorId: author.id },
      { name: "Maya", age: "13", gender: "Female", personality: "Curious, brave, kind-hearted", appearance: "Small for her age, bright eyes, hair always in a messy braid", clothing: "Simple farm clothes, always barefoot", storyId: story2.id, authorId: author.id },
      { name: "Diwata", age: "Ancient", gender: "Female", personality: "Wise, gentle, fading", appearance: "Glowing figure, translucent, surrounded by fireflies", clothing: "A gown made of moonlight and leaves", storyId: story2.id, authorId: author.id },
      { name: "Jasmine Cruz", age: "28", gender: "Female", personality: "Determined, sharp, haunted by the past", appearance: "Sharp features, tired eyes, always carries a notebook", clothing: "Denim jacket, boots, camera always around her neck", storyId: story3.id, authorId: author.id },
    ],
  })

  logs.push("3 stories with 7 chapters and 5 characters created")

  // ── Posts (Feed content) ──
  await prisma.post.createMany({
    data: [
      {
        type: "text",
        content: "📚 Excited to announce my new story 'Under the Buwan' is now published! A love story inspired by the folklore of our ancestors. Read the first two chapters for free! 🇵🇭❤️ #LikhaVerse #Romance",
        userId: author.id,
        createdAt: new Date(now.getTime() - 43200000 * 3),
      },
      {
        type: "text",
        content: "Writing tip: The best dialogue comes from knowing your characters deeply. Before writing a conversation, ask yourself: what does each person want? What are they afraid of? The conflict writes itself after that. ✍️ #WritingTips #AmWriting",
        userId: author.id,
        createdAt: new Date(now.getTime() - 86400000),
      },
      {
        type: "text",
        content: "Just finished reading 'The Last Diwata' — absolutely beautiful! The imagery of the dying forest really hit me hard. We need to do more to protect our environment. 🌿💚 #EnvironmentalAwareness #FilipinoFantasy",
        userId: reader.id,
        createdAt: new Date(now.getTime() - 3600000 * 5),
      },
      {
        type: "text",
        content: "🌙 There's something magical about writing at 2 AM. The world is quiet, the moon is bright, and the stories just... flow. Anyone else a night owl writer? 🦉 #WritersLife #LateNightWriting",
        userId: author.id,
        createdAt: new Date(now.getTime() - 7200000),
      },
    ],
  })

  logs.push("4 posts created")

  // ── Activity data: follows, saves, likes ──
  await prisma.follow.upsert({
    where: { followerId_followingId: { followerId: reader.id, followingId: author.id } },
    update: {},
    create: { followerId: reader.id, followingId: author.id },
  })

  await prisma.save.createMany({
    data: [
      { userId: reader.id, storyId: story2.id },
      { userId: reader.id, storyId: story1.id },
      { userId: admin.id, storyId: story2.id },
    ],
  })

  for (let i = 0; i < 3; i++) {
    await prisma.storyLike.create({
      data: { userId: reader.id, storyId: [story1.id, story2.id, story3.id][i] },
    }).catch(() => {})
    await prisma.postLike.create({
      data: { userId: reader.id, postId: (await prisma.post.findMany({ take: 1, orderBy: { createdAt: "asc" } }))[0]?.id ?? "" },
    }).catch(() => {})
  }

  logs.push("Activity data seeded (follows, saves, likes)")

  return `✅ Success! Users: admin, author (Maria Santos), reader (Juan dela Cruz). Content: 3 stories, 7 chapters, 5 characters, 4 posts, activity data.`
}

export async function GET() {
  const results: Record<string, unknown> = {}
  results.schema = await applySchema()
  results.seed = await seed()
  return NextResponse.json({ status: "ok", results })
}
