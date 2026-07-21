# LikhaVerse — System Overview

**Version:** 1.0.0
**Updated:** 2026-07-07
**Stack:** Next.js 16.2.9 | React 19.2.4 | Prisma 7.8.0 | next-auth 4.24.14 | Tailwind v4
**Database:** SQLite (dev) → PostgreSQL (prod)
**Node:** v22.14.0

---

## Architecture

```
                    ┌─────────────┐
                    │   Reader    │
                    └──────┬──────┘
             ┌─────────────┼──────────────┐
             │                            │
       ┌─────┴──────┐             ┌───────┴──────┐
       │   Author   │             │  Filmmaker   │
       └─────┬──────┘             └───────┬──────┘
             │                            │
             └─────────────┬──────────────┘
                           │
                    ┌──────┴──────┐
                    │ AI Creative │
                    │   Engine    │
                    └─────────────┘
```

### Layers (Monolith → Microservices-ready)

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Web** | Next.js 16 App Router (React Server Components) | SSR, routing, pages, API routes |
| **Auth** | next-auth 4 (Credentials + OAuth) + Firebase Auth | JWT session, 4 providers |
| **Actions** | Next.js Server Actions (32 actions) | Mutations with Zod validation |
| **API Routes** | Next.js Route Handlers (14 endpoints) | Webhooks, SSE, payments, health |
| **Database** | Prisma ORM → SQLite/PostgreSQL | 42 models with relations |
| **Cache** | Redis (ioredis) + in-memory fallback | Session caching, homepage cache (30s TTL) |
| **Queue** | BullMQ (Redis-backed) | Async jobs: email, notification push, cleanup, Firestore sync |
| **Realtime** | SSE (EventEmitter3) + Event Bus | Notifications, messaging, live sessions |
| **AI** | OpenAI + Replicate SDKs | Story analysis, image generation, characters |
| **Monitoring** | Sentry (error tracking) + Pino (structured logging) | Error capture, log retention |
| **Security** | Idempotency keys, rate limiting, circuit breaker, retry with jitter | Payment safety, anti-spam |

### Key Directories

| Path | Purpose |
|------|---------|
| `src/app/` | Next.js App Router pages (27 route groups) |
| `src/app/actions/` | 32 Server Actions (all mutations) |
| `src/app/api/` | 14 API Route Handlers |
| `src/components/` | Shared UI components (15 groups) |
| `src/lib/` | Core libraries (27 modules) |
| `src/lib/cache/` | Redis + in-memory cache layer |
| `src/lib/queue/` | BullMQ job queue + worker |
| `src/lib/realtime/` | SSE event bus |
| `src/lib/resilience/` | Circuit breaker, retry, timeout |
| `src/lib/security/` | Idempotency keys |
| `src/lib/observability/` | Sentry + Pino logger |
| `src/lib/ai/` | OpenAI + Replicate AI providers |
| `src/lib/notifications/` | Unified notification creation |
| `prisma/` | Schema + SQLite dev database |
| `scripts/` | Backup/restore scripts |
| `services/` | NestJS microservices (auth, story, payment, etc.) |
| `docker-compose.prod.yml` | Production stack (Postgres + Redis + Web + Worker) |
| `.github/workflows/` | CI + Deploy pipelines |

---

## Four Worlds

| World | Routes | Role Required |
|-------|--------|--------------|
| **Reader** | `/stories`, `/library`, `/premium`, `/feed` | READER+ |
| **Author** | `/write`, `/author/*`, `/studio` | READER+ |
| **Filmmaker** | `/film/*` | PREMIUM_CREATOR+ |
| **AI Creative Engine** | `/admin/ai-studio/*` | SUPER_ADMIN only |

---

## Tech Stack Detail

```
Frontend:   Next.js 16 App Router, React 19, Tailwind CSS v4, Lucide Icons
Auth:       next-auth v4 (Credentials + Google OAuth + Facebook + Apple) + Firebase Auth
Database:   Prisma ORM → SQLite (dev) / PostgreSQL (prod) — 42 models
Cache:      Redis (ioredis) with in-memory Map fallback
Queue:      BullMQ — async job processing
Realtime:   SSE via EventEmitter3
AI:         OpenAI API + Replicate API
Payments:   GCash + Card + Apple Pay (idempotency-protected)
Monitoring: Sentry + Pino structured logger
Container:  Docker + Docker Compose (multi-stage build)
CI/CD:      GitHub Actions → Docker build + push → SSH deploy
```

---

## Route Tree (81 total routes)

| Group | Routes | Status |
|-------|--------|--------|
| Public | `/`, `/login`, `/register`, `/stories`, `/premium`, `/welcome` | ✅ Live |
| Reading | `/stories/[id]`, `/stories/[id]/chapter/[id]`, `/library/*` | ✅ Live |
| Author | `/write/*`, `/author/*` (12 routes) | ✅ Live |
| Studio | `/studio`, `/studio/[id]` | ✅ Live |
| AI Studio | `/admin/ai-studio/*` (9 routes, SUPER_ADMIN) | ✅ Live |
| Film | `/film/*` (6 routes) | ✅ Live |
| Community | `/feed`, `/messages`, `/profile/*`, `/notifications` | ✅ Live |
| Admin | `/admin/*` (5 routes) | ✅ Live |
| Settings | `/settings/*` (5 routes) | ✅ Live |
| Auth | `/login`, `/register`, `/verify-otp`, `/verify` | ✅ Live |
| API | 14 REST endpoints | ✅ Live |

---

## Deployment Topology (Production)

```
                        ┌──────────┐
                        │  CDN     │
                        └────┬─────┘
                             │
                    ┌────────┴────────┐
                    │   Load Balancer  │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
        ┌─────┴─────┐  ┌────┴────┐  ┌─────┴─────┐
        │ Next.js   │  │ Queue   │  │ Services  │
        │ Web (×N)  │  │ Worker  │  │ (NestJS)  │
        └─────┬─────┘  └────┬────┘  └─────┬─────┘
              │              │              │
              └──────┬───────┴──────┬──────┘
                     │              │
              ┌──────┴──────┐ ┌────┴────┐
              │  PostgreSQL │ │  Redis  │
              │  (Primary)  │ │(Cache+  │
              │  + Replica  │ │ Queue)  │
              └─────────────┘ └─────────┘
```

### Environments

| Environment | Database | URL | Notes |
|-------------|----------|-----|-------|
| **dev** | SQLite (`prisma/dev.db`) | `http://localhost:3000` | Local development |
| **staging** | PostgreSQL | `staging.likhaverse.com` | CI/CD preview |
| **production** | PostgreSQL + Replica | `likhaverse.com` | Live |
