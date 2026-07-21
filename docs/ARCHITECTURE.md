# LikhaVerse — Architecture

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

## Stack
- **Framework**: Next.js 16.2.9 (App Router, React Server Components, Turbopack)
- **Auth**: next-auth 4 + Firebase Auth (Email, Phone, Google, Facebook, Apple)
- **Database**: Prisma 7.8.0 → SQLite (dev) / PostgreSQL (prod) — 42 models
- **Cache**: Redis (ioredis) with in-memory Map fallback
- **Queue**: BullMQ (Redis-backed) — email, notifications, Firestore sync
- **Realtime**: SSE via EventEmitter3 event bus
- **AI**: OpenAI + Replicate SDKs
- **Payments**: Idempotent coin/subscription purchases
- **Monitoring**: Sentry + Pino structured logger
- **Deployment**: Docker multi-stage + GitHub Actions CI/CD

## Route Map (81 routes)
See `docs/ROUTES.md` for the complete sitemap.

## Key Directories
| Path | Purpose |
|------|---------|
| `src/app/` | 27 route groups |
| `src/app/actions/` | 32 Server Actions (all mutations) |
| `src/app/api/` | 14 REST API routes |
| `src/components/` | 15 component groups |
| `src/lib/` | 27 core modules |
| `prisma/` | Schema + 42 models |
| `scripts/` | Backup/restore |
| `services/` | NestJS microservices (separate) |

## Roles (6 levels)
READER → AUTHOR → VIP_GOLD → PREMIUM_CREATOR → ADMIN → SUPER_ADMIN

## Security
- Role-based access on every server action
- bcrypt password hashing + rate limiting
- Idempotency keys for payments
- Prisma $transaction for atomic mutations
- Circuit breaker + retry with jitter for resilience
- **Known issues**: No middleware, upload validation missing, recordStoryView unguarded

## Backup
- Auto-detects SQLite vs PostgreSQL
- Daily cron + CI/CD pre-deploy hook
- 30-day retention, point-in-time recovery ready

## Documentation Files
| File | Purpose |
|------|---------|
| `docs/SYSTEM_OVERVIEW.md` | Full system overview |
| `docs/DATA_MODEL.md` | Complete Prisma schema reference |
| `docs/ROLES_AND_PERMISSIONS.md` | Role hierarchy + access control |
| `docs/API_REFERENCE.md` | All API routes + server actions |
| `docs/SECURITY.md` | Security model + vulnerabilities |
| `docs/DEPLOYMENT.md` | Docker + CI/CD + infrastructure |
| `docs/BACKUP_AND_RECOVERY.md` | Backup strategy + procedures |
| `docs/DEVELOPMENT_GUIDE.md` | Dev workflow + conventions |
| `docs/LIKHAVERSE_MASTER_PRD.md` | Product requirements document |
| `docs/DEVELOPMENT_ROADMAP.md` | Phased feature roadmap |
