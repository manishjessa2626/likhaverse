import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiError, getSessionOrThrow } from "@/lib/api-auth"
import { checkAchievements, ACHIEVEMENT_DEFS } from "@/lib/junior/achievements"

export async function GET(request: Request) {
  try {
    const session = await getSessionOrThrow()
    const url = new URL(request.url)
    const juniorId = url.searchParams.get("juniorId")

    if (!juniorId) return NextResponse.json({ error: "juniorId required" }, { status: 400 })

    const junior = await prisma.juniorProfile.findUnique({
      where: { id: juniorId },
      select: { parentUserId: true },
    })
    if (!junior || junior.parentUserId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const earned = await prisma.juniorAchievement.findMany({
      where: { juniorId },
      select: { key: true, earnedAt: true },
    })

    const earnedMap = new Map(earned.map((e) => [e.key, e.earnedAt]))

    const achievements = ACHIEVEMENT_DEFS.map((def) => ({
      ...def,
      earned: earnedMap.has(def.key),
      earnedAt: earnedMap.get(def.key) || null,
    }))

    return NextResponse.json(achievements)
  } catch (error) {
    return apiError(error, "Failed to fetch achievements")
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionOrThrow()
    const body = await request.json()
    const { juniorId } = body

    if (!juniorId) return NextResponse.json({ error: "juniorId required" }, { status: 400 })

    const profile = await prisma.juniorProfile.findUnique({
      where: { id: juniorId },
      select: { parentUserId: true, booksRead: true, storiesWritten: true, streak: true },
    })
    if (!profile || profile.parentUserId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const eligible = checkAchievements(profile)
    const existing = await prisma.juniorAchievement.findMany({
      where: { juniorId },
      select: { key: true },
    })
    const existingKeys = new Set(existing.map((e) => e.key))
    const newKeys = eligible.filter((k) => !existingKeys.has(k))

    if (newKeys.length > 0) {
      const defs = ACHIEVEMENT_DEFS.filter((d) => newKeys.includes(d.key))
      await prisma.juniorAchievement.createMany({
        data: defs.map((d) => ({
          juniorId,
          key: d.key,
          label: d.label,
          description: d.description,
          icon: d.icon,
        })),
      })
    }

    return NextResponse.json({ new: newKeys })
  } catch (error) {
    return apiError(error, "Failed to check achievements")
  }
}
