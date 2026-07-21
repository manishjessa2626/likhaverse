# LikhaVerse — Roles & Permissions

**Source:** `src/lib/permissions.ts`, `src/lib/episode-access.ts`, `src/app/actions/`

---

## Role Hierarchy

```
SUPER_ADMIN (highest)
    ├── ADMIN
    │   ├── PREMIUM_CREATOR  (also called VIP_GOLD)
    │   │   └── AUTHOR
    │   │       └── READER
    │   └── (no reader access to AI tools)
    └── (bypasses ALL limits)
```

| Role | Read | Write | AI Basic | AI Studio | Film Studio | Premium Features | Admin |
|------|------|-------|----------|-----------|-------------|-----------------|-------|
| READER | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| AUTHOR | ✅ | ✅ | ✅ (5/mo) | ❌ | ❌ | ❌ | ❌ |
| VIP_GOLD | ✅ | ✅ | ✅ (50/mo) | ❌ | ✅ | ✅ | ❌ |
| PREMIUM_CREATOR | ✅ | ✅ | ✅ (50/mo) | ❌ | ✅ | ✅ | ❌ |
| ADMIN | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ |
| SUPER_ADMIN | ✅ | ✅ | ✅ (unlimited) | ✅ | ✅ | ✅ (free) | ✅ |

---

## Permission Functions (`src/lib/permissions.ts`)

| Function | Check | Used In |
|----------|-------|---------|
| `requireAuth(session)` | Any authenticated user (401) | All protected actions |
| `requireAuthor(session)` | READER+ roles (403) | Story/chapter CRUD, AI tools |
| `requireAdmin(session)` | ADMIN+ roles (403) | Admin dashboard, analytics |
| `requireSuperAdmin(session)` | SUPER_ADMIN only (403) | AI Studio, Originals, platform settings |
| `requirePremiumCreator(session)` | PREMIUM_CREATOR+ (SUPER_ADMIN also passes) | Studio applications, premium features |
| `bypassesAllLimits(role)` | SUPER_ADMIN → true | AI generation limits |
| `canAccessWritingTools(role)` | SUPER_ADMIN, ADMIN, VIP_GOLD, PREMIUM_CREATOR | Studio access |
| `canAccessStudio(role)` | SUPER_ADMIN, ADMIN | Film studio |
| `canCreateStories(session)` | AUTHOR+ roles | Story creation guard |

---

## SUPER_ADMIN Rules (PRD §Super Admin)

The Super Admin (platform owner — you) has **unlimited access**:

```
IF user.role == SUPER_ADMIN:
    Grant all permissions
    Ignore subscription checks
    Ignore AI credit limits
    Bypass all chapter locks
    Never be charged
```

This is enforced in:
- `src/lib/permissions.ts:56` — `bypassesAllLimits()`
- `src/app/actions/premium.ts` — subscription gating
- `src/app/actions/ai.ts` — AI generation limit checks
- `src/app/actions/ai-studio.ts` — AI Studio access
- `src/lib/episode-access.ts:20` — chapter access check
- All server action auth guards

---

## Chapter Access System

| User Type | Free Preview (1–5 chapters) | Chapters beyond preview |
|-----------|-----------------------------|------------------------|
| **Super Admin** | Unlimited | Unlimited |
| **Premium Reader** | Unlimited | Unlimited |
| **Free Reader** | Free | COINS (min 5/chapter), AD, or Premium subscription |

Unlock methods: COINS (5 coins/chapter), AD (watch ad, 3/day), PREMIUM (subscription)
Free preview defaults to 5 chapters, configurable per story (`freePreviewChapters`)
Daily reward: 8 coins + streak bonuses

---

## AI Generation Limits

| Role | Monthly Limit | Resets |
|------|--------------|--------|
| READER | 0 | N/A |
| AUTHOR | 5 | Monthly |
| VIP_GOLD | 50 | Monthly |
| PREMIUM_CREATOR | 50 | Monthly |
| ADMIN | Unlimited | N/A |
| SUPER_ADMIN | Unlimited | N/A |

Tracked via `User.aiGenerationCount` + `User.aiGenerationResetAt`.

---

## Route Protection

| Route Group | Protection | Mechanism |
|-------------|-----------|-----------|
| `/admin/*` | ADMIN+ | Server component `getServerSession()` + role check |
| `/admin/ai-studio/*` | SUPER_ADMIN only | Server component + server action guards |
| `/author/*` | AUTHOR+ | Server component + action guards |
| `/write/*` | AUTHOR+ | Server action `requireAuthor()` |
| `/premium` | Authenticated | Session check (redirect to /login) |
| `/film/*` | PREMIUM_CREATOR+ | Server action guards |
| `/library/*` | Authenticated | Session check |
| `/messages` | Authenticated | Session check |
| `/stories/*` | Public | Content-gated (premium chapters) |
| `/feed` | Authenticated | Session check |
| `/profile/[id]` | Public | |
| API routes | Varies | Per-route auth |

**Note:** No `middleware.ts` exists. All protection is page-level and action-level. Client-side pages (AI Studio tools, author tools) show UI shell before server actions enforce auth — this is functional but poor UX.

---

## Security Vulnerabilities (Known)

| # | Severity | Issue | Location |
|---|----------|-------|----------|
| S1 | **CRITICAL** | `recordStoryView` — no auth, no rate limit, no dedup | `stories.ts:189-199` |
| S2 | **CRITICAL** | No middleware — direct URL access renders UI shell before auth fails | Missing `middleware.ts` |
| S3 | **HIGH** | Upload endpoint — no file type/size validation | `api/upload/route.ts` |
| S4 | **HIGH** | No error/404/loading pages at app root | Missing `error.tsx` on sub-routes |
| S5 | **MEDIUM** | `.env` git-tracked with SMTP credentials | `.env` (move to `.env.local`) |
| S6 | **MEDIUM** | Weak NEXTAUTH_SECRET placeholder | `.env` (generate strong secret) |
| S7 | **LOW** | `getStoryById` returns full details unauthenticated | `stories.ts` |
| S8 | **LOW** | `getStoryCharacters` — no ownership check | `ai.ts` |
| S9 | **MEDIUM** | `getStoriesForHomepage` excludes COMPLETED stories | `stories.ts:142-187` |

---

## Super Admin Accounts

Your accounts (you — the platform owner) should all have `role: "SUPER_ADMIN"` to bypass all paywalls, limits, and restrictions. Configured via seed script or direct Prisma update.
