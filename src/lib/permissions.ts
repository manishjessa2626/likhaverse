import { AppError } from "./errors"

export const Roles = {
  READER: "READER",
  AUTHOR: "AUTHOR",
  VIP_GOLD: "VIP_GOLD",
  PREMIUM_CREATOR: "PREMIUM_CREATOR",
  ADMIN: "ADMIN",
  SUPER_ADMIN: "SUPER_ADMIN",
} as const

export type Role = (typeof Roles)[keyof typeof Roles]

const AUTHOR_ROLES = [Roles.READER, Roles.AUTHOR, Roles.VIP_GOLD, Roles.PREMIUM_CREATOR, Roles.ADMIN, Roles.SUPER_ADMIN] as const
const ADMIN_ROLES = [Roles.ADMIN, Roles.SUPER_ADMIN] as const
const VIP_OR_ABOVE = [Roles.VIP_GOLD, Roles.PREMIUM_CREATOR, Roles.ADMIN, Roles.SUPER_ADMIN] as const
const ALL_ROLES = [Roles.READER, Roles.AUTHOR, Roles.VIP_GOLD, Roles.PREMIUM_CREATOR, Roles.ADMIN, Roles.SUPER_ADMIN] as const

export function getRole(session: unknown): Role | null {
  if (!session || typeof session !== "object" || !("user" in session)) return null
  const user = (session as { user: { role?: string } }).user
  if (!user?.role) return null
  return (ALL_ROLES as readonly string[]).includes(user.role) ? (user.role as Role) : null
}

export function hasRole(session: unknown, ...roles: Role[]): boolean {
  const role = getRole(session)
  if (!role) return false
  return roles.includes(role)
}

export function isAuthenticated(session: unknown): boolean {
  return getRole(session) !== null
}

export function canCreateStories(session: unknown): boolean {
  const role = getRole(session)
  if (!role) return false
  return (AUTHOR_ROLES as readonly string[]).includes(role)
}

export function isAdmin(session: unknown): boolean {
  const role = getRole(session)
  if (!role) return false
  return (ADMIN_ROLES as readonly string[]).includes(role)
}

export function isSuperAdmin(session: unknown): boolean {
  return getRole(session) === Roles.SUPER_ADMIN
}

export function isPremiumCreator(session: unknown): boolean {
  return getRole(session) === Roles.PREMIUM_CREATOR
}

export function bypassesAllLimits(role: string): boolean {
  return role === Roles.SUPER_ADMIN
}

export function canAccessWritingTools(role: string): boolean {
  return role === Roles.SUPER_ADMIN || role === Roles.ADMIN || role === Roles.VIP_GOLD || role === Roles.PREMIUM_CREATOR
}

export function canAccessStudio(role: string): boolean {
  return role === Roles.SUPER_ADMIN || role === Roles.ADMIN
}

export function requireAuth(session: unknown): { id: string; name: string; email: string; role: string } {
  if (!session || typeof session !== "object" || !("user" in session)) {
    throw new AppError("Not authenticated", 401)
  }
  const user = (session as { user: { id: string; name: string; email: string; role: string } }).user
  if (!user || !user.id) {
    throw new AppError("Not authenticated", 401)
  }
  return { id: user.id, name: user.name, email: user.email, role: user.role }
}

export function requireRole(session: unknown, ...roles: Role[]): void {
  requireAuth(session)
  if (!hasRole(session, ...roles)) {
    throw new AppError("Insufficient permissions", 403)
  }
}

export function requirePremiumCreator(session: unknown): { id: string; name: string; email: string; role: string } {
  const user = requireAuth(session)
  if (user.role !== Roles.PREMIUM_CREATOR && user.role !== Roles.SUPER_ADMIN) {
    throw new AppError("Only Premium Creators can perform this action", 403)
  }
  return user
}

export function requireAuthor(session: unknown): { id: string; name: string; email: string; role: string } {
  requireAuth(session)
  const role = getRole(session)
  if (!role || !(AUTHOR_ROLES as readonly string[]).includes(role)) {
    throw new AppError("Only authors can perform this action", 403)
  }
  const user = (session as { user: { id: string; name: string; email: string; role: string } }).user
  return { id: user.id, name: user.name, email: user.email, role: user.role }
}

export function requireAdmin(session: unknown): { id: string; name: string; email: string; role: string } {
  requireAuth(session)
  const role = getRole(session)
  if (!role || !(ADMIN_ROLES as readonly string[]).includes(role)) {
    throw new AppError("Only admins can perform this action", 403)
  }
  const user = (session as { user: { id: string; name: string; email: string; role: string } }).user
  return { id: user.id, name: user.name, email: user.email, role: user.role }
}

export function requireSuperAdmin(session: unknown): { id: string; name: string; email: string; role: string } {
  requireAuth(session)
  if (!isSuperAdmin(session)) {
    throw new AppError("Only the Super Admin can perform this action", 403)
  }
  const user = (session as { user: { id: string; name: string; email: string; role: string } }).user
  return { id: user.id, name: user.name, email: user.email, role: user.role }
}
