"use server"

import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getErrorMessage } from "@/lib/errors"
import { createNotification } from "@/lib/notifications"

async function requireAuth() {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Not authenticated")
  return session.user
}

// ─── CLUBS ───

export async function getClubs() {
  return prisma.club.findMany({
    where: { isPublic: true },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { members: true } } },
    take: 50,
  })
}

export async function getMyClubs() {
  const user = await requireAuth()
  return prisma.club.findMany({
    where: { members: { some: { userId: user.id } } },
    include: { _count: { select: { members: true } } },
  })
}

export async function getClub(id: string) {
  return prisma.club.findUnique({
    where: { id },
    include: {
      _count: { select: { members: true, challenges: true } },
      members: { include: { user: { select: { id: true, name: true, avatar: true } } }, take: 20 },
      challenges: { where: { endDate: { gte: new Date() } }, orderBy: { startDate: "asc" }, take: 5 },
    },
  })
}

export async function createClub(name: string, description: string, type: string) {
  const user = await requireAuth()
  const club = await prisma.club.create({
    data: { name, description, type, ownerId: user.id, members: { create: { userId: user.id, role: "OWNER" } } },
  })
  revalidatePath("/community")
  return club
}

export async function joinClub(clubId: string) {
  const user = await requireAuth()
  const club = await prisma.club.findUnique({ where: { id: clubId }, select: { ownerId: true, name: true } })

  await prisma.clubMember.create({ data: { clubId, userId: user.id, role: "MEMBER" } })

  if (club && club.ownerId !== user.id) {
    await createNotification({
      userId: club.ownerId,
      type: "CLUB_JOIN",
      message: `${user.name} joined your club "${club.name}"`,
      link: `/community`,
      actorId: user.id,
    })
  }

  revalidatePath("/community")
}

export async function leaveClub(clubId: string) {
  const user = await requireAuth()
  await prisma.clubMember.deleteMany({ where: { clubId, userId: user.id } })
  revalidatePath("/community")
}

// ─── CHALLENGES ───

export async function getChallenges() {
  return prisma.challenge.findMany({
    orderBy: { startDate: "desc" },
    include: { _count: { select: { participants: true } }, owner: { select: { id: true, name: true } } },
    take: 30,
  })
}

export async function createChallenge(title: string, description: string, prompt: string | null, type: string, startDate: string, endDate: string, clubId?: string) {
  const user = await requireAuth()
  const challenge = await prisma.challenge.create({
    data: {
      title, description, prompt, type,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      ownerId: user.id,
      clubId: clubId || null,
    },
  })
  revalidatePath("/community")
  return challenge
}

export async function joinChallenge(challengeId: string) {
  const user = await requireAuth()
  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId },
    select: { ownerId: true, title: true },
  })

  await prisma.challengeParticipant.create({ data: { challengeId, userId: user.id } })

  if (challenge && challenge.ownerId !== user.id) {
    await createNotification({
      userId: challenge.ownerId,
      type: "CHALLENGE_JOIN",
      message: `${user.name} joined your challenge "${challenge.title}"`,
      link: `/community`,
      actorId: user.id,
    })
  }

  revalidatePath("/community")
}

// ─── LIVE SESSIONS ───

export async function getLiveSessions() {
  return prisma.liveSession.findMany({
    where: { scheduledAt: { gte: new Date() } },
    orderBy: { scheduledAt: "asc" },
    include: { host: { select: { id: true, name: true, avatar: true } }, _count: { select: { attendees: true } } },
    take: 20,
  })
}

export async function createLiveSession(title: string, description: string | null, type: string, scheduledAt: string, duration: number) {
  const user = await requireAuth()
  const session = await prisma.liveSession.create({
    data: { title, description, type, scheduledAt: new Date(scheduledAt), duration, hostId: user.id },
  })

  revalidatePath("/community")
  return session
}

// ─── EVENTS ───

export async function getEvents() {
  return prisma.event.findMany({
    where: { scheduledAt: { gte: new Date() } },
    orderBy: { scheduledAt: "asc" },
    include: { host: { select: { id: true, name: true, avatar: true } }, _count: { select: { attendees: true } } },
    take: 20,
  })
}

export async function registerForEvent(eventId: string) {
  const user = await requireAuth()
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { hostId: true, title: true },
  })

  await prisma.eventAttendee.create({ data: { eventId, userId: user.id } })

  if (event && event.hostId !== user.id) {
    await createNotification({
      userId: event.hostId,
      type: "EVENT_REGISTER",
      message: `${user.name} registered for your event "${event.title}"`,
      link: `/community`,
      actorId: user.id,
    })
  }

  revalidatePath("/community")
}

// ─── FAN ART ───

export async function getFanArt(storyId?: string) {
  return prisma.fanArt.findMany({
    where: storyId ? { storyId } : undefined,
    orderBy: { createdAt: "desc" },
    include: { user: { select: { id: true, name: true, avatar: true } }, story: { select: { id: true, title: true } } },
    take: 50,
  })
}

// ─── CHARACTER VOTING ───

export async function voteCharacter(characterId: string, storyId: string, type: string) {
  const user = await requireAuth()
  const existing = await prisma.characterVote.findUnique({
    where: { characterId_userId_type: { characterId, userId: user.id, type } },
  })
  if (existing) {
    await prisma.characterVote.delete({ where: { id: existing.id } })
  } else {
    await prisma.characterVote.create({ data: { characterId, userId: user.id, storyId, type } })
  }
  revalidatePath("/community")
}

export async function getCharacterVotes(storyId: string) {
  return prisma.characterVote.groupBy({
    by: ["characterId", "type"],
    where: { storyId },
    _count: { characterId: true },
  })
}
