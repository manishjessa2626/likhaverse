"use server"

import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getErrorMessage } from "@/lib/errors"

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    throw new Error("Not authorized")
  }
  return session.user
}

// ─── DASHBOARD STATS ───

export async function getDashboardStats() {
  await requireAdmin()
  const [
    userCount, storyCount, chapterCount, commentCount,
    reportCount, pendingReports, premiumCount, pendingStudio,
    activeSubscriptions, aiGenCount, paymentCount, totalRevenue,
    recentUsers, recentReports,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.story.count(),
    prisma.chapter.count(),
    prisma.comment.count(),
    prisma.report.count(),
    prisma.report.count({ where: { status: "PENDING" } }),
    prisma.user.count({ where: { premium: true } }),
    prisma.studioApplication.count({ where: { status: "PENDING" } }),
    prisma.user.count({ where: { subscriptionStatus: "active" } }),
    prisma.aIGeneration.count(),
    prisma.payment.count({ where: { status: "completed" } }),
    prisma.payment.aggregate({ where: { status: "completed" }, _sum: { amount: true } }),
    prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 5, select: { id: true, name: true, email: true, role: true, createdAt: true } }),
    prisma.report.findMany({ orderBy: { createdAt: "desc" }, take: 5, include: { reporter: { select: { name: true } } } }),
  ])

  return {
    userCount, storyCount, chapterCount, commentCount,
    reportCount, pendingReports, premiumCount, pendingStudio,
    activeSubscriptions, aiGenCount, paymentCount,
    totalRevenue: totalRevenue._sum.amount || 0,
    recentUsers, recentReports,
  }
}

// ─── USERS ───

export async function getUsers(page = 1, search?: string) {
  await requireAdmin()
  const take = 20
  const where = search ? { OR: [{ name: { contains: search } }, { email: { contains: search } }] } : {}
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where, orderBy: { createdAt: "desc" }, take, skip: (page - 1) * take,
      select: { id: true, name: true, email: true, role: true, premium: true, isVIP: true, subscriptionStatus: true, createdAt: true, _count: { select: { stories: true, comments: true } } },
    }),
    prisma.user.count({ where }),
  ])
  return { users, total, pages: Math.ceil(total / take) }
}

export async function updateUserRole(userId: string, role: string) {
  const admin = await requireAdmin()
  const target = await prisma.user.findUnique({ where: { id: userId } })
  if (!target) throw new Error("User not found")
  if (target.role === "SUPER_ADMIN" && admin.role !== "SUPER_ADMIN") throw new Error("Cannot modify super admin")
  await prisma.user.update({ where: { id: userId }, data: { role } })
  revalidatePath("/admin/users")
}

export async function deleteUser(userId: string) {
  const admin = await requireAdmin()
  const target = await prisma.user.findUnique({ where: { id: userId } })
  if (!target) throw new Error("User not found")
  if (target.role === "SUPER_ADMIN") throw new Error("Cannot delete super admin")
  await prisma.user.delete({ where: { id: userId } })
  revalidatePath("/admin/users")
}

// ─── REPORTS ───

export async function getReports(page = 1, status?: string) {
  await requireAdmin()
  const take = 20
  const where = status && status !== "ALL" ? { status } : {}
  const [reports, total] = await Promise.all([
    prisma.report.findMany({
      where, orderBy: { createdAt: "desc" }, take, skip: (page - 1) * take,
      include: {
        reporter: { select: { id: true, name: true } },
        story: { select: { id: true, title: true } },
        comment: { select: { id: true, content: true } },
      },
    }),
    prisma.report.count({ where }),
  ])
  return { reports, total, pages: Math.ceil(total / take) }
}

export async function resolveReport(reportId: string, status: string) {
  await requireAdmin()
  await prisma.report.update({ where: { id: reportId }, data: { status } })
  revalidatePath("/admin/reports")
}

// ─── STORIES ───

export async function getAdminStories(page = 1, status?: string) {
  await requireAdmin()
  const take = 20
  const where: any = {}
  if (status && status !== "ALL") where.status = status
  const [stories, total] = await Promise.all([
    prisma.story.findMany({
      where, orderBy: { updatedAt: "desc" }, take, skip: (page - 1) * take,
      include: { author: { select: { id: true, name: true } }, _count: { select: { chapters: true, comments: true, reports: true } } },
    }),
    prisma.story.count({ where }),
  ])
  return { stories, total, pages: Math.ceil(total / take) }
}

export async function deleteStory(storyId: string) {
  await requireAdmin()
  await prisma.story.delete({ where: { id: storyId } })
  revalidatePath("/admin/stories")
}

export async function toggleStoryFlag(storyId: string, field: string, value: boolean) {
  await requireAdmin()
  await prisma.story.update({ where: { id: storyId }, data: { [field]: value } })
  revalidatePath("/admin/stories")
}

// ─── PAYMENTS ───

export async function getPayments(page = 1) {
  await requireAdmin()
  const take = 20
  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      orderBy: { createdAt: "desc" }, take, skip: (page - 1) * take,
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
    prisma.payment.count(),
  ])
  return { payments, total, pages: Math.ceil(total / take) }
}

// ─── AI USAGE ───

export async function getAiUsage(page = 1) {
  await requireAdmin()
  const take = 20
  const [generations, total] = await Promise.all([
    prisma.aIGeneration.findMany({
      orderBy: { createdAt: "desc" }, take, skip: (page - 1) * take,
      include: { user: { select: { id: true, name: true } } },
    }),
    prisma.aIGeneration.count(),
  ])
  const typeBreakdown = await prisma.aIGeneration.groupBy({ by: ["type"], _count: { type: true } })
  return { generations, total, pages: Math.ceil(total / take), typeBreakdown }
}

// ─── ANNOUNCEMENTS ───

export async function getAnnouncements() {
  await requireAdmin()
  return prisma.notification.findMany({
    where: { type: "ANNOUNCEMENT" },
    orderBy: { createdAt: "desc" },
    take: 50,
  })
}

export async function createAnnouncement(message: string) {
  const user = await requireAdmin()
  // Create announcement notification visible to all users
  await prisma.notification.create({
    data: { type: "ANNOUNCEMENT", message, userId: user.id, actorId: user.id },
  })
  revalidatePath("/admin/announcements")
}

export async function deleteAnnouncement(id: string) {
  await requireAdmin()
  await prisma.notification.delete({ where: { id } })
  revalidatePath("/admin/announcements")
}

// ─── SUPPORT / CONTACT MESSAGES ───

export async function getSupportMessages(page = 1) {
  await requireAdmin()
  const take = 20
  const [messages, total] = await Promise.all([
    prisma.message.findMany({
      orderBy: { createdAt: "desc" }, take, skip: (page - 1) * take,
      include: { sender: { select: { id: true, name: true, email: true } } },
    }),
    prisma.message.count(),
  ])
  return { messages, total, pages: Math.ceil(total / take) }
}

// ─── STAFF ───

export async function getStaff() {
  await requireAdmin()
  return prisma.user.findMany({
    where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
    select: { id: true, name: true, email: true, role: true, createdAt: true, _count: { select: { stories: true, comments: true } } },
    orderBy: { role: "asc" },
  })
}

// ─── ACTIVITY LOGS ───

export async function getActivityLogs(page = 1) {
  await requireAdmin()
  const take = 30
  const [logs, total] = await Promise.all([
    prisma.notification.findMany({
      where: { type: { not: "ANNOUNCEMENT" } },
      orderBy: { createdAt: "desc" },
      take, skip: (page - 1) * take,
      include: { actor: { select: { id: true, name: true } }, user: { select: { id: true, name: true } } },
    }),
    prisma.notification.count({ where: { type: { not: "ANNOUNCEMENT" } } }),
  ])
  return { logs, total, pages: Math.ceil(total / take) }
}

// ─── SUBSCRIPTIONS ───

export async function getSubscriptions(page = 1) {
  await requireAdmin()
  const take = 20
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where: { subscriptionStatus: { not: "inactive" } },
      orderBy: { subscriptionExpiry: "desc" }, take, skip: (page - 1) * take,
      select: { id: true, name: true, email: true, premium: true, isVIP: true, subscriptionStatus: true, subscriptionExpiry: true, premiumSince: true, role: true },
    }),
    prisma.user.count({ where: { subscriptionStatus: { not: "inactive" } } }),
  ])
  return { users, total, pages: Math.ceil(total / take) }
}

export async function cancelSubscription(userId: string) {
  await requireAdmin()
  await prisma.user.update({
    where: { id: userId },
    data: { premium: false, isVIP: false, subscriptionStatus: "inactive", subscriptionExpiry: null },
  })
  revalidatePath("/admin/subscriptions")
}

// ─── MODERATION ───

export async function getModerationQueue(page = 1) {
  await requireAdmin()
  const take = 20
  const [comments, total] = await Promise.all([
    prisma.comment.findMany({
      orderBy: { createdAt: "desc" }, take, skip: (page - 1) * take,
      include: { user: { select: { id: true, name: true } }, story: { select: { id: true, title: true } }, reports: { select: { id: true, reason: true } } },
      where: { reports: { some: {} } },
    }),
    prisma.comment.count({ where: { reports: { some: {} } } }),
  ])
  return { comments, total, pages: Math.ceil(total / take) }
}

export async function deleteComment(commentId: string) {
  await requireAdmin()
  await prisma.comment.delete({ where: { id: commentId } })
  revalidatePath("/admin/moderation")
}
