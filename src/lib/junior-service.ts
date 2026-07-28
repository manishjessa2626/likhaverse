import { prisma } from "./prisma"
import type { JuniorProfile } from "@/generated/prisma/client"

export type JuniorProfileData = Pick<
  JuniorProfile,
  | "id"
  | "displayName"
  | "avatar"
  | "age"
  | "readingLevel"
  | "theme"
  | "booksRead"
  | "storiesWritten"
  | "readingMinutes"
  | "currentBookId"
  | "currentChapterId"
  | "streak"
  | "archivedAt"
  | "createdAt"
  | "updatedAt"
>

function assertOwnership(junior: { parentUserId: string }, userId: string): void {
  if (junior.parentUserId !== userId) {
    throw new Error("Unauthorized")
  }
}

export async function getJuniorProfiles(parentUserId: string): Promise<JuniorProfileData[]> {
  return prisma.juniorProfile.findMany({
    where: { parentUserId, archivedAt: null },
    orderBy: { createdAt: "desc" },
  })
}

export async function getJuniorProfileById(
  juniorId: string,
  parentUserId: string,
): Promise<JuniorProfileData> {
  const junior = await prisma.juniorProfile.findUnique({ where: { id: juniorId } })
  if (!junior) throw new Error("Junior profile not found")
  assertOwnership(junior, parentUserId)
  return junior
}

export async function createJuniorProfile(data: {
  displayName: string
  age: number
  readingLevel?: string
  avatar?: string | null
  parentUserId: string
}): Promise<JuniorProfileData> {
  if (!data.displayName || data.displayName.trim().length === 0) {
    throw new Error("Display name is required")
  }
  if (data.age < 3 || data.age > 17) {
    throw new Error("Age must be between 3 and 17")
  }
  const validLevels = ["BEGINNER", "INTERMEDIATE", "ADVANCED"]
  if (data.readingLevel && !validLevels.includes(data.readingLevel)) {
    throw new Error("Invalid reading level")
  }

  return prisma.juniorProfile.create({
    data: {
      displayName: data.displayName.trim(),
      age: data.age,
      readingLevel: data.readingLevel ?? "BEGINNER",
      avatar: data.avatar ?? null,
      parentUserId: data.parentUserId,
    },
  })
}

export async function updateJuniorProfile(
  juniorId: string,
  parentUserId: string,
  data: Partial<{
    displayName: string
    age: number
    avatar: string | null
    readingLevel: string
    theme: string
    booksRead: number
    storiesWritten: number
    readingMinutes: number
    currentBookId: string | null
    currentChapterId: string | null
    streak: number
  }>,
): Promise<JuniorProfileData> {
  const existing = await prisma.juniorProfile.findUnique({ where: { id: juniorId } })
  if (!existing) throw new Error("Junior profile not found")
  assertOwnership(existing, parentUserId)

  if (data.age !== undefined && (data.age < 3 || data.age > 17)) {
    throw new Error("Age must be between 3 and 17")
  }

  return prisma.juniorProfile.update({
    where: { id: juniorId },
    data,
  })
}

export async function archiveJuniorProfile(
  juniorId: string,
  parentUserId: string,
): Promise<void> {
  const existing = await prisma.juniorProfile.findUnique({ where: { id: juniorId } })
  if (!existing) throw new Error("Junior profile not found")
  assertOwnership(existing, parentUserId)

  await prisma.juniorProfile.update({
    where: { id: juniorId },
    data: { archivedAt: new Date() },
  })
}
