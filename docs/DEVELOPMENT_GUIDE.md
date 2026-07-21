# LikhaVerse — Development Guide

---

## Getting Started

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Push schema to SQLite database
npm run db:push

# Seed test data (7 users, 3 stories, 45 chapters)
npx prisma db seed

# Start dev server (port 3000)
npm run dev

# Optional: Open Prisma Studio
npm run db:studio
```

---

## Project Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Next.js dev server (Turbopack) |
| `npm run build` | Production build (compile + typecheck) |
| `npm run start` | Start production server |
| `npm run db:push` | Push Prisma schema to DB |
| `npm run db:generate` | Regenerate Prisma client |
| `npm run db:studio` | Open Prisma Studio GUI |
| `npm run backup` | Run backup script |
| `npm run restore` | Run restore script |
| `npm run worker` | Start BullMQ queue worker |

---

## Architecture Conventions

### File Naming
| Pattern | Example | Purpose |
|---------|---------|---------|
| `page.tsx` | `app/stories/page.tsx` | Route page (Server Component default) |
| `route.ts` | `app/api/health/route.ts` | API Route Handler |
| `Component.tsx` | `components/StoryCard.tsx` | Shared component |
| `lib/module.ts` | `lib/permissions.ts` | Library module |
| `action-name.ts` | `app/actions/stories.ts` | Server Action file |

### Component Rules
- Default to **Server Components** (no `"use client"`)
- Only add `"use client"` when you need hooks, events, or browser APIs
- Client components should be leaf nodes in the component tree
- Use `React.cache()` for request deduplication
- Use `Suspense` boundaries for async data fetching

### Data Flow
```
Page (Server) → Server Action → Prisma → SQLite/PostgreSQL
Page (Server) → Component (Client) → Server Action → Prisma
Page (Server) → API Route → Prisma → Response
```

### Auth Flow
```
Login → next-auth credentials → JWT (role in token)
Session available via getServerSession() (server) / useSession() (client)
```

---

## Coding Standards

### Server Actions
- All exported functions must be `async` (Next.js 16 requirement)
- Use `"use server"` directive
- Validate inputs with Zod
- Return `{ error: string | null, ...data }` shape
- Use `revalidatePath()` for cache invalidation
- Auth guard: always call `requireAuth()`, `requireAuthor()`, etc.

### Database
- **NEVER** change schema without running `npm run db:push` and `npm run db:generate`
- Use Prisma `$transaction` for multi-step mutations
- Use `Promise.all` for parallel queries
- Add indexes for frequently queried fields
- Cascade deletes for parent-child relationships

### Error Handling
```typescript
try {
  // operation
} catch (e) {
  return { error: getErrorMessage(e, "User-friendly message") }
}
```

### Logging
```typescript
import { createLogger } from "@/lib/observability/logger"
const log = createLogger("module-name")
log.info({ key: "value" }, "message")
log.error({ err: error }, "error message")
```

### Validation (Zod)
```typescript
import { z } from "zod"
const schema = z.object({ title: z.string().min(1).max(200) })
const data = schema.parse(input)
```

---

## Key Libraries

| Library | Purpose | Version |
|---------|---------|---------|
| next | Framework | 16.2.9 |
| next-auth | Authentication | 4.24.14 |
| @prisma/client | ORM | 7.8.0 |
| zod | Validation | 4.4.3 |
| bcryptjs | Password hashing | 3.0.3 |
| firebase | Client SDK | 12.15.0 |
| firebase-admin | Admin SDK | 14.1.0 |
| openai | AI API | 6.45.0 |
| replicate | AI API | 1.4.0 |
| ioredis | Redis client | 5.11.1 |
| bullmq | Job queue | 5.79.2 |
| eventemitter3 | Event bus | 5.0.4 |
| pino | Structured logging | 10.3.1 |
| @sentry/nextjs | Error monitoring | 10.63.0 |
| lucide-react | Icons | 1.23.0 |
| tailwindcss | CSS framework | 4.3.2 |

---

## Troubleshooting

### Build Errors
```bash
# Stale module detection issues with Turbopack
rm -rf .next && npm run dev

# Prisma client not found
npm run db:generate

# Missing type declarations
npm install --save-dev @types/<package>
```

### Common Issues
| Symptom | Solution |
|---------|----------|
| "Failed to fetch" (Google login) | Add `localhost` to Firebase authorized domains |
| Port 3000 in use | Kill existing process: `lsof -ti:3000 \| xargs kill` |
| TypeScript decorator errors | These are in `services/` (NestJS) — excluded from tsconfig |
| Module not found (firebase-admin) | `npm install firebase-admin` |
| Hydration mismatch | Remove `Math.random()` from SSR — use `useState` + `useEffect` |
| Server Actions not async | Next.js 16 requires all `"use server"` exports be async |

### Development Tips
- Check `.env.local` has all required vars
- Use `Prisma Studio` to inspect/edit data visually
- `npm run build` before pushing to catch type errors
- Clear `.next` cache after package installs or Prisma regenerations
- Old design files are in `splash/`, `demo/`, and some `feed/` components — these were deliberately removed
