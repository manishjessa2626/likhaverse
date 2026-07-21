# LikhaVerse — Deployment Guide

---

## Docker Production Stack

**File:** `docker-compose.prod.yml`

| Service | Image | Port | Purpose |
|---------|-------|------|---------|
| `postgres` | postgres:17-alpine | 5432 | Primary database |
| `redis` | redis:7-alpine | 6379 | Cache + queue broker |
| `web` | likhaverse/web:latest | 3000 | Next.js app (×N replicas) |
| `worker` | likhaverse/worker:latest | — | BullMQ queue worker |
| `gateway` | nginx:alpine | 80/443 | Reverse proxy + SSL |

### Production `docker-compose.prod.yml` structure:
```yaml
services:
  postgres:  # persistent data in pgdata volume
  redis:     # persistent data in redisdata volume
  web:       # multi-stage Next.js build, healthcheck
  worker:    # queue worker, depends on redis
  gateway:   # nginx reverse proxy, SSL termination
```

### Environment configs:
- `.env.production` — template with all production env vars
- DB connection: `DATABASE_URL=postgresql://likhaverse:${POSTGRES_PASSWORD}@postgres:5432/likhaverse`
- Redis: `REDIS_URL=redis://redis:6379`

---

## Dockerfiles

### `Dockerfile` — Web (multi-stage)
```
Stage 1 (deps):    npm ci
Stage 2 (builder): npm run build
Stage 3 (runner):  next start (port 3000)
```

### `Dockerfile.worker` — Worker
```
Stage 1 (deps):    npm ci
Stage 2 (runner):  tsx src/lib/queue/worker-entry.ts
```

### Commands
```bash
# Development
npm run dev                 # Local dev server (port 3000)

# Production (Docker)
docker compose -f docker-compose.prod.yml up -d    # Start all services
docker compose -f docker-compose.prod.yml down     # Stop all services

# Database
npm run db:push             # Apply schema to DB
npm run db:generate         # Regenerate Prisma client
npm run db:studio           # Open Prisma Studio UI

# Queue worker
npm run worker              # Start BullMQ worker (standalone)

# Backups
npm run backup              # Run backup script
npm run restore             # Run restore script
```

---

## CI/CD Pipeline

**File:** `.github/workflows/`

### CI (`ci.yml`)
Triggers: `push` on all branches, `pull_request` to main

```yaml
jobs:
  quality:
    - Setup Node 22
    - npm ci
    - npx prisma generate
    - npm run build          # Compile + typecheck
```

### Deploy (`deploy.yml`)
Triggers: `push` to `main`

```yaml
jobs:
  deploy:
    - Setup Node 22
    - npm ci
    - npx prisma generate
    - Build Docker images (web + worker)
    - Push to Docker registry
    - SSH into server
    - docker compose pull
    - docker compose up -d
    - Prisma db push
```

---

## Environment Files

| File | Purpose | Git-tracked |
|------|---------|-------------|
| `.env` | Shared defaults | ⚠️ Yes (contains credentials) |
| `.env.local` | Local overrides (dev) | ❌ No (gitignored) |
| `.env.production` | Production template | ✅ Yes |
| `.env.example` | Reference only | ✅ Yes |

**Move SMTP credentials + secrets from `.env` to `.env.local` before production.**

---

## Database Deployment

### Dev → Production Migration Path
```
1. Change DATABASE_URL in .env.production
2. Update prisma/schema.prisma: provider = "postgresql"
3. Run: npx prisma db push
4. Run: npx prisma generate
5. Backup SQLite: npm run backup
6. Restore to PostgreSQL: npm run restore
```

### Indexes (already defined in schema):
- `User.role`, `User.name`
- `Story.status`, `Story.title`, `Story.tags`
- `Payment.userId`, `Payment.status`
- `Notification.userId`, `Notification.createdAt`
- `Post.userId`, `Post.createdAt`
- `Reel.userId`, `Reel.createdAt`
- `IdempotencyKey.expiresAt`

---

## Scaling Strategy

### Horizontal Scaling
- **Web**: Stateless Next.js — scale behind load balancer (×N replicas)
- **Worker**: Scale BullMQ worker replicas (each processes different jobs)
- **Database**: Read replicas for heavy query workloads
- **Redis**: Cluster mode for cache + queue at scale

### Performance Targets
- API response: <200ms (p95)
- Page load: <1s (TTFB)
- Cache hit ratio: >90% for homepage/stories
- Database queries: <50ms (indexed)

### Current Performance (Dev)
- Homepage (warm cache): ~350ms
- Most pages: 30–200ms
- Cold start (first request): 1–2s
