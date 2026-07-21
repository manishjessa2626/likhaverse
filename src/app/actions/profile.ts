"use server"

import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getErrorMessage } from "@/lib/errors"

function sanitizeName(s: string): string {
  return s.trim().replace(/[<>"'()]/g, "").slice(0, 100)
}

function sanitizeBio(s: string): string {
  return s.trim().replace(/[<>]/g, "").slice(0, 500)
}

export async function getProfile() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return null

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      bio: true,
      avatar: true,
      role: true,
      createdAt: true,
      premium: true,
    },
  })

  return user
}

export async function getFollowingList() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return []

  const follows = await prisma.follow.findMany({
    where: { followerId: session.user.id },
    include: {
      following: { select: { id: true, name: true, avatar: true, role: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return follows.map((f) => f.following)
}

export async function getFollowersList() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return []

  const follows = await prisma.follow.findMany({
    where: { followingId: session.user.id },
    include: {
      follower: { select: { id: true, name: true, avatar: true, role: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return follows.map((f) => f.follower)
}

export async function updateProfile(
  _prevState: { error: string | null; message: string | null } | null,
  formData: FormData,
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return { error: "Not authenticated", message: null }

  const name = formData.get("name") as string | null
  const bio = formData.get("bio") as string | null
  const avatar = formData.get("avatar") as string | null
  const role = formData.get("role") as string | null

  const updateData: Record<string, string> = {}

  if (name !== null) {
    if (typeof name !== "string" || name.trim().length === 0) {
      return { error: "Name cannot be empty", message: null }
    }
    updateData.name = sanitizeName(name)
  }

  if (bio !== null) {
    if (typeof bio !== "string") return { error: "Bio must be a string", message: null }
    updateData.bio = sanitizeBio(bio)
  }

  if (avatar !== null) {
    if (typeof avatar !== "string") return { error: "Invalid avatar", message: null }
    updateData.avatar = avatar
  }

  if (role !== null) {
    const validRoles = ["READER", "AUTHOR", "CREATOR"]
    if (!validRoles.includes(role)) {
      return { error: "Invalid role selected", message: null }
    }
    updateData.role = role
  }

  try {
    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: { id: true },
    })
    revalidatePath("/profile")
    revalidatePath(`/profile/${updated.id}`)
    return { error: null, message: "Profile updated" }
  } catch (e) {
    return { error: getErrorMessage(e, "Failed to update profile"), message: null }
  }
}
