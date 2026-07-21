import bcrypt from "bcryptjs"
import { createClient } from "@libsql/client"

const db = createClient({
  url: "file:dev.db",
})

const users = [
  { email: "admin@likhaverse.com", password: "Admin123!" },
  { email: "author@likhaverse.com", password: "Author123!" },
  { email: "premium@likhaverse.com", password: "Creator123!" },
  { email: "reader@likhaverse.com", password: "Reader123!" },
  { email: "critic@likhaverse.com", password: "Critic123!" },
  { email: "fan@likhaverse.com", password: "Fan123!" },
  { email: "writer2@likhaverse.com", password: "Writer456!" },
]

for (const u of users) {
  const hash = await bcrypt.hash(u.password, 10)
  await db.execute({
    sql: "UPDATE User SET password = ? WHERE email = ?",
    args: [hash, u.email],
  })
  console.log(`Re-hashed ${u.email}`)
}

db.close()
console.log("Done!")
