# PHASE 1 CHANGES — User Roles & Authorization

## Summary

Implemented Phase 1 of the LikhaVerse development roadmap: centralized role-based authorization, the `PREMIUM_CREATOR` role, and a dedicated permission utility. All existing role checks were refactored to use the centralized system.

---

## Changes Made

### 1. New File: `src/lib/permissions.ts`

Centralized permission utility with the following exports:

| Export | Type | Description |
|---|---|---|
| `Roles` | `const` object | Role constants: `READER`, `AUTHOR`, `PREMIUM_CREATOR`, `ADMIN`, `SUPER_ADMIN` |
| `Role` | Type | Union type of all roles |
| `getRole(session)` | `Role \| null` | Extracts role from session |
| `hasRole(session, ...roles)` | `boolean` | Checks if session has any of the given roles |
| `isAuthenticated(session)` | `boolean` | Checks if session exists with a valid role |
| `canCreateStories(session)` | `boolean` | True for AUTHOR, PREMIUM_CREATOR, ADMIN, SUPER_ADMIN |
| `isAdmin(session)` | `boolean` | True for ADMIN, SUPER_ADMIN |
| `isSuperAdmin(session)` | `boolean` | True only for SUPER_ADMIN |
| `isPremiumCreator(session)` | `boolean` | True only for PREMIUM_CREATOR |
| `bypassesAllLimits(role)` | `boolean` | True only for SUPER_ADMIN |
| `requireAuth(session)` | `User` (throws) | Returns user or throws "Not authenticated" |
| `requireRole(session, ...roles)` | `void` (throws) | Requires specific role(s) |
| `requireAuthor(session)` | `User` (throws) | Requires AUTHOR, PREMIUM_CREATOR, ADMIN, or SUPER_ADMIN |
| `requireAdmin(session)` | `User` (throws) | Requires ADMIN or SUPER_ADMIN |
| `requireSuperAdmin(session)` | `User` (throws) | Requires SUPER_ADMIN only |

**Key rules enforced:**
- `canCreateStories` includes `PREMIUM_CREATOR` alongside AUTHOR, ADMIN, SUPER_ADMIN
- `bypassesAllLimits` returns true only for `SUPER_ADMIN` (unlimited AI generations, no subscription checks)
- `requireAuthor` includes `PREMIUM_CREATOR` for story/chapter/season operations

### 2. Updated: `src/proxy.ts` (middleware)

- Replaced inline role arrays with named constants `AUTHOR_ROLES` and `ADMIN_ROLES`
- `AUTHOR_ROLES` now includes `"PREMIUM_CREATOR"` alongside `"AUTHOR"`, `"ADMIN"`, `"SUPER_ADMIN"`
- `/author/*` routes now accessible to Premium Creators

### 3. Updated: `src/types/next-auth.d.ts`

- Updated `User.role` type to include `"PREMIUM_CREATOR"` documentation
- Session and JWT types updated to reflect the new role

### 4. Updated Server Actions — Role Checks Refactored

All 11 action files were updated to use the centralized permission utility instead of inline role checks:

| File | Inline Function Removed | Replaced With |
|---|---|---|
| `src/app/actions/stories.ts` | `requireAuthor()` | `import { requireAuthor } from "@/lib/permissions"` |
| `src/app/actions/chapters.ts` | `requireAuthor()` | `import { requireAuthor } from "@/lib/permissions"` |
| `src/app/actions/seasons.ts` | `requireAuthor()` | `import { requireAuthor } from "@/lib/permissions"` |
| `src/app/actions/ai.ts` | `requireAuthor()` | `import { requireAuthor } from "@/lib/permissions"` |
| `src/app/actions/studio.ts` | `requireAuthor()` | `import { requireAuthor, requireAdmin } from "@/lib/permissions"` |
| `src/app/actions/premium.ts` | `requireAuth()` | `import { requireAuth, requireAdmin } from "@/lib/permissions"` |
| `src/app/actions/ai-studio.ts` | `requireSuperAdmin()` | `import { requireSuperAdmin } from "@/lib/permissions"` |
| `src/app/actions/originals.ts` | `requireSuperAdmin()` | `import { requireSuperAdmin } from "@/lib/permissions"` |
| `src/app/actions/analytics.ts` | `requireAdmin()` | `import { requireAdmin } from "@/lib/permissions"` |
| `src/app/actions/messages.ts` | `requireAuth()` | `import { requireAuth } from "@/lib/permissions"` |

Additionally:
- `ai.ts` `checkGenerationLimit()` now uses `bypassesAllLimits(role)` instead of `role === "SUPER_ADMIN"`
- `stories.ts` featured authors query now includes `"PREMIUM_CREATOR"` in the role filter
- All `session.user.role !== "SUPER_ADMIN"` guard clauses replaced with `try { requireSuperAdmin(session) } catch { return [] }`

### 5. Database Migration: `prisma/migrations/20260623034106_add_role_index_premium_creator`

```sql
CREATE INDEX "User_role_idx" ON "User"("role");
```

Adds a database index on the `User.role` column to optimize role-based queries (admin dashboards, author listings, etc.). No schema structure changes — `PREMIUM_CREATOR` is a new valid string value for the existing `role` field.

### 6. Updated: `prisma/schema.prisma`

```prisma
@@index([role])
```

Added index declaration on the User model for the `role` field.

### 7. Updated: `prisma/seed.ts`

Added a Premium Creator test user:

| Name | Email | Password | Role |
|---|---|---|---|
| Premium Creator | premium@likhaverse.com | Creator123! | `PREMIUM_CREATOR` |

This user has `premium: true`, enabling testing of Premium Creator-specific features.

---

## Role Permissions Matrix

| Feature | READER | AUTHOR | PREMIUM_CREATOR | ADMIN | SUPER_ADMIN |
|---|---|---|---|---|---|
| Read stories | ✅ | ✅ | ✅ | ✅ | ✅ |
| Comment/react | ✅ | ✅ | ✅ | ✅ | ✅ |
| Send messages | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create stories | ❌ | ✅ | ✅ | ✅ | ✅ |
| Write chapters | ❌ | ✅ | ✅ | ✅ | ✅ |
| Manage seasons | ❌ | ✅ | ✅ | ✅ | ✅ |
| AI generation (5/mo) | ❌ | ✅ (limited) | ✅ (limited) | ✅ (limited) | ✅ (unlimited) |
| Premium features | ❌ | ❌* | ✅ | ✅ | ✅ (auto) |
| Studio applications | ❌ | ❌ | ✅ | ❌ | ✅ (manage) |
| AI Studio tools | ❌ | ❌ | ❌ | ❌ | ✅ |
| Originals management | ❌ | ❌ | ❌ | ❌ | ✅ |
| Analytics dashboard | ❌ | ❌ | ❌ | ✅ | ✅ |
| Premium management | ❌ | ❌ | ❌ | ✅ | ✅ |
| Bypass AI limits | ❌ | ❌ | ❌ | ❌ | ✅ |
| Bypass subscription | ❌ | ❌ | ❌ | ❌ | ✅ |

\* Authors do not get premium benefits unless they purchase a subscription (future implementation).

---

## Test Accounts

| Role | Email | Password |
|---|---|---|
| Super Admin | `lil.jessav@gmail.com` | `Admin123!` |
| Premium Creator | `premium@likhaverse.com` | `Creator123!` |
| Author | `author@likhaverse.com` | `Author123!` |
| Reader | `reader@likhaverse.com` | `Reader123!` |

---

## Files Modified

| File | Action |
|---|---|
| `src/lib/permissions.ts` | **NEW** |
| `prisma/schema.prisma` | Added `@@index([role])` |
| `prisma/migrations/20260623034106_add_role_index_premium_creator/migration.sql` | **NEW** |
| `prisma/seed.ts` | Added Premium Creator user |
| `src/proxy.ts` | Refactored middleware role lists |
| `src/types/next-auth.d.ts` | Updated role type annotations |
| `src/lib/auth.ts` | Kept unchanged (role as string) |
| `src/app/actions/stories.ts` | Refactored to use centralized permissions |
| `src/app/actions/chapters.ts` | Refactored to use centralized permissions |
| `src/app/actions/seasons.ts` | Refactored to use centralized permissions |
| `src/app/actions/ai.ts` | Refactored + uses `bypassesAllLimits()` |
| `src/app/actions/ai-studio.ts` | Refactored to use centralized permissions |
| `src/app/actions/studio.ts` | Refactored to use centralized permissions |
| `src/app/actions/premium.ts` | Refactored to use centralized permissions |
| `src/app/actions/originals.ts` | Refactored to use centralized permissions |
| `src/app/actions/analytics.ts` | Refactored to use centralized permissions |
| `src/app/actions/messages.ts` | Refactored to use centralized permissions |

---

## Story Management System (Added Post-Phase 1)

### Changes

#### Schema & Migration
- `prisma/schema.prisma` — Renamed `freePreviewCount` → `freePreviewChapters`, changed default `accessType` from `FREE_PREVIEW` → `FREEMIUM`
- `prisma/migrations/20260623034842_rename_free_preview_fields/` — Manual migration: renamed column via `ALTER TABLE`, updated existing data

#### Access Type Values Renamed
| Old | New |
|---|---|
| `FREE_PREVIEW` | `FREEMIUM` |
| `PREMIUM_EXCLUSIVE` | `PREMIUM` |
| `FREE` | `FREE` (unchanged) |

#### Server Actions — `src/app/actions/stories.ts`
- Zod schemas updated: `freePreviewCount` → `freePreviewChapters`, `FREE_PREVIEW` → `FREEMIUM`, `PREMIUM_EXCLUSIVE` → `PREMIUM`
- **COMPLETED validation**: When setting status to `COMPLETED`, the action now checks that the story has at least one chapter. Returns error message if empty.
- **Status transitions**: Setting status away from `COMPLETED` clears `completedAt` and `completedBadge`

#### Chapter List Component — `src/app/stories/[storyId]/ChapterList.tsx`
- Updated access type logic: `PREMIUM_STORY` for `"PREMIUM"`, freemium check uses `freePreviewChapters`
- Added SVG lock icon next to locked chapters (`!canAccess` state)
- Added premium badge for premium users on gated chapters
- **Premium upgrade prompt**: New `LockClosedIcon` SVG component displayed in the premium gating banner
- Props renamed: `freePreviewCount` → `freePreviewChapters`

#### Story Detail Page — `src/app/stories/[storyId]/page.tsx`
- Access badges updated: shows `"Premium"` for PREMIUM, `"Freemium"` for FREEMIUM, `"Free"` for FREE
- Field reference updated: `freePreviewCount` → `freePreviewChapters`, accessType default changed to `"FREEMIUM"`

#### Chapter Reader Page — `src/app/stories/[storyId]/chapter/[chapterId]/page.tsx`
- **Access check rewritten**: Now checks `story.accessType` to determine chapter availability:
  - `FREE` — all chapters free
  - `FREEMIUM` — first N chapters free (uses `freePreviewChapters`)
  - `PREMIUM` — all chapters locked behind premium
- For non-logged-in users on locked chapters: redirect to login
- For logged-in non-premium users on premium-locked chapters: redirect to `/premium`
- Added premium status check via `prisma.user.findUnique`

#### Edit Story Page — `src/app/(dashboard)/author/stories/[storyId]/edit/page.tsx`
- Dropdown options: `FREE`, `FREEMIUM`, `PREMIUM`
- Field names updated: `freePreviewCount` → `freePreviewChapters`
- Default accessType fallback: `"FREEMIUM"`

#### New Story Page — `src/app/(dashboard)/author/stories/new/page.tsx`
- Field names updated: `freePreviewCount` → `freePreviewChapters`

#### Seed Files — `prisma/seed.ts`, `scripts/seed.ts`
- Updated field names and access type values
- Added Premium Creator user to `scripts/seed.ts`

### Access Rules Summary
| Access Type | Logged Out | Logged In (Free) | Premium Member | Author |
|---|---|---|---|---|
| **FREE** | All chapters | All chapters | All chapters | All chapters |
| **FREEMIUM** | First N free | First N free | All chapters | All chapters |
| **PREMIUM** | Redirect to `/premium` | Redirect to `/premium` | All chapters | All chapters |

---

## Verification

- Build passes: `npx next build` succeeds with no errors (TypeScript + compilation)
- All 34 routes compile successfully across public, auth, and dashboard route groups
- Middleware correctly guards `/author/*` for PREMIUM_CREATOR users
- SUPER_ADMIN bypasses all AI generation limits via `bypassesAllLimits()`
- COMPLETED validation prevents marking empty stories as complete
- Premium-locked chapters redirect non-premium users to `/premium`
- Lock icons display on gated chapters
