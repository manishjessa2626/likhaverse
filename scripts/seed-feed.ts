import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaLibSql } from "@prisma/adapter-libsql"
import path from "path"

async function main() {
  const adapter = new PrismaLibSql({
    url: "file:" + path.join(__dirname, "../dev.db"),
  })

  const prisma = new PrismaClient({ adapter })

  const users = await prisma.user.findMany({
    where: { email: { in: ["premium@likhaverse.com", "author@likhaverse.com", "reader@likhaverse.com", "admin@likhaverse.com"] } },
  })

  const premium = users.find((u) => u.email === "premium@likhaverse.com")
  const author = users.find((u) => u.email === "author@likhaverse.com")
  const reader = users.find((u) => u.email === "reader@likhaverse.com")
  const admin = users.find((u) => u.email === "admin@likhaverse.com")

  const existingPosts = await prisma.post.count()
  if (existingPosts > 0) {
    console.log(`Already have ${existingPosts} posts, skipping post seed.`)
  } else {

  const stories = await prisma.story.findMany({ take: 2 })

  const posts = [
    {
      userId: premium!.id,
      type: "text",
      content: "Just finished editing the latest chapter of my new story! Excited to share it with everyone. The world-building in this one is really coming together. 🌟",
    },
    {
      userId: premium!.id,
      type: "image",
      content: "Working on character concept art for my next novel. What do you think?",
      mediaUrls: JSON.stringify(["https://placehold.co/600x400/1a1a2e/amber?text=Character+Art"]),
    },
    {
      userId: author!.id,
      type: "text",
      content: "Writer tip: The best stories come from writing what scares you. Don't be afraid to explore dark themes and complex emotions. Your readers will connect with your honesty.",
    },
    {
      userId: author!.id,
      type: "book",
      content: "Check out my latest published story! Would love to hear your thoughts on the first chapter.",
      bookId: stories[0]?.id || null,
    },
    {
      userId: reader!.id,
      type: "text",
      content: "Just spent the whole afternoon reading 'The Last Ember' - absolutely incredible! The way the author builds this dark, atmospheric world is masterful. Can't wait for the next chapter! 📚",
    },
    {
      userId: reader!.id,
      type: "image",
      content: "My reading nook setup for the weekend. Perfect for diving into some good stories!",
      mediaUrls: JSON.stringify(["https://placehold.co/600x400/1a1a2e/666?text=Reading+Nook"]),
    },
    {
      userId: admin!.id,
      type: "text",
      content: "Welcome to LikhaVerse! We're building a community of storytellers and readers. Share your thoughts, connect with authors, and discover your next favorite story. Happy reading! 🚀",
    },
    {
      userId: premium!.id,
      type: "image",
      content: "Behind the scenes of my writing process. Here's my current outline board!",
      mediaUrls: JSON.stringify([
        "https://placehold.co/300x200/1a1a2e/amber?text=Outline+1",
        "https://placehold.co/300x200/1a1a2e/amber?text=Outline+2",
      ]),
    },
  ]

  for (const post of posts) {
    await prisma.post.create({
      data: post as any,
    })
  }

  console.log(`Seeded ${posts.length} posts.`)

  // Add some likes and comments
  const allPosts = await prisma.post.findMany()

  for (const post of allPosts) {
    const likers = users.filter((u) => u.id !== post.userId).slice(0, 2)
    for (const liker of likers) {
      await prisma.postLike.create({
        data: { postId: post.id, userId: liker.id },
      })
    }

    if (users.find((u) => u.id !== post.userId)) {
      const commenter = users.find((u) => u.id !== post.userId)!
      await prisma.postComment.create({
        data: {
          postId: post.id,
          userId: commenter.id,
          text: "Great post! Really enjoying the content here on LikhaVerse. 🔥",
        },
      })
    }
  }

  console.log(`Added likes and comments.`)
  } // end else for posts seed

  // Seed reels
  const existingReels = await prisma.reel.count()
  if (existingReels === 0) {
    const reelData = [
      { userId: premium!.id, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", caption: "Morning vibes at the writing desk! ✍️", musicUrl: null },
      { userId: author!.id, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", caption: "Behind the scenes of chapter editing", musicUrl: null },
      { userId: reader!.id, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", caption: "My current read - absolutely obsessed!", musicUrl: null },
    ]
    for (const r of reelData) {
      await prisma.reel.create({ data: r })
    }
    console.log(`Seeded ${reelData.length} reels.`)
  }

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
