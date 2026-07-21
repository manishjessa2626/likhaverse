import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

async function main() {
  const adapter = new PrismaPg()
  const prisma = new PrismaClient({ adapter })