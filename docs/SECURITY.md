# LikhaVerse — Security Reference

---

## Authentication

| Provider | Type | Status |
|----------|------|--------|
| Email + Password | Credentials (next-auth) | ✅ Live |
| Phone OTP | Credentials (next-auth) | ✅ Live |
| Firebase Auth | Credentials (next-auth) | ✅ Live |
| Google OAuth | next-auth provider | ✅ Live |
| Facebook OAuth | next-auth provider | ⚠️ Missing env vars |
| Apple OAuth | next-auth provider | ⚠️ Missing env vars |

### Auth Config (`src/lib/auth.ts`)
- JWT strategy with `role` in token/session
- bcrypt password hashing
- Rate limiting: 5 attempts/300s per email
- Input sanitization (trim, lowercase, strip HTML)
- CSRF protection via next-auth

---

## Authorization Model

**Role-based access control** with 6 roles:

```
READER → AUTHOR → VIP_GOLD → PREMIUM_CREATOR → ADMIN → SUPER_ADMIN
```

Enforcement:
- **Server Components**: `getServerSession()` + role check before render
- **Server Actions**: `requireAuth()`, `requireAuthor()`, `requireAdmin()`, `requireSuperAdmin()`, `requirePremiumCreator()`
- **API Routes**: Per-route auth middleware

---

## Known Vulnerabilities (To Fix)

| # | Severity | Issue | Location |
|---|----------|-------|----------|
| S1 | **CRITICAL** | `recordStoryView` unauthenticated + unrate-limited | `src/app/actions/stories.ts:189-199` — anyone can POST unlimited StoryView records |
| S2 | **CRITICAL** | No middleware.ts | All routes — direct URL access renders UI shell before auth fails |
| S3 | **HIGH** | Upload endpoint — no file validation | `src/app/api/upload/route.ts` — accepts any file type/size |
| S4 | **HIGH** | No `error.tsx`/`not-found.tsx`/`loading.tsx` at app root | Default Next.js error pages shown |
| S5 | **MEDIUM** | SMTP credentials in git-tracked `.env` | Move to `.env.local` |
| S6 | **MEDIUM** | Weak NEXTAUTH_SECRET | Generate strong secret for production |
| S7 | **LOW** | `getStoryById` leaks draft details | Should filter by status for non-owners |
| S8 | **LOW** | `getStoryCharacters` no ownership check | Any auth user can read any story's characters |
| S9 | **LOW** | Delete season leaves orphaned chapter.seasonId | Missing `onDelete: SetNull` |

---

## Payment Security

| Measure | Implementation |
|---------|---------------|
| Idempotency | `IdempotencyKey` model — duplicate request detection |
| Atomic transactions | Prisma `$transaction` for all mutations |
| Backend-only verification | Never trust frontend for payment success |
| Webhook-ready | Route handlers designed for payment gateway callbacks |
| Circuit breaker | Fail fast if payment service is degraded |
| Rate limiting | Per-action rate limits protect abuse |

All payment mutations go through `processIdempotent()` which:
1. Checks for existing result by key → returns cached result
2. Checks for in-flight request → blocks duplicate
3. Executes the mutation
4. Stores result for future idempotency

---

## Data Protection

| Concern | Mitigation |
|---------|-----------|
| SQL injection | Prisma ORM parameterizes all queries |
| XSS | React's JSX auto-escapes; input sanitization in auth |
| Insecure auth | bcrypt hashing, rate limiting, CSRF tokens |
| Session hijacking | JWT with secret; HttpOnly cookies |
| Unauthorized access | Role checks on every action + page |
| Request forgery | next-auth CSRF protection |
| File upload abuse | ⚠️ No validation — must add type/size checks |

---

## Environment Variables

| Variable | Purpose | Required |
|----------|---------|----------|
| `NEXTAUTH_URL` | NextAuth callback URL | ✅ |
| `NEXTAUTH_SECRET` | JWT signing secret | ✅ (generate strong) |
| `DATABASE_URL` | Prisma database connection | ✅ |
| `GOOGLE_CLIENT_ID` | Google OAuth | For Google login |
| `GOOGLE_CLIENT_SECRET` | Google OAuth | For Google login |
| `FACEBOOK_CLIENT_ID` | Facebook OAuth | For Facebook login |
| `FACEBOOK_CLIENT_SECRET` | Facebook OAuth | For Facebook login |
| `APPLE_CLIENT_ID` | Apple OAuth | For Apple login |
| `APPLE_CLIENT_SECRET` | Apple OAuth | For Apple login |
| `FIREBASE_PROJECT_ID` | Firebase Admin | For Firebase auth |
| `NEXT_PUBLIC_FIREBASE_*` | Firebase client SDK | ✅ |
| `REDIS_URL` | Redis connection | Optional (in-memory fallback) |
| `SENTRY_DSN` | Sentry error tracking | Optional |
| `OPENAI_API_KEY` | OpenAI API | For AI features |
| `REPLICATE_API_KEY` | Replicate API | For AI image gen |
| `SMTP_HOST`/`SMTP_USER`/`SMTP_PASS` | Email sending | For OTP emails |
| `POSTGRES_*` | PostgreSQL connection | Production only |

---

## Production Checklist

- [ ] Generate strong `NEXTAUTH_SECRET` (use `openssl rand -hex 64`)
- [ ] Move `.env` credentials to `.env.local` (gitignored)
- [ ] Add `middleware.ts` for centralized route protection
- [ ] Add auth + rate limiting to `recordStoryView`
- [ ] Add file validation to upload endpoint
- [ ] Add `error.tsx` and `not-found.tsx` at app root
- [ ] Enable HTTPS
- [ ] Add security headers (CSP, HSTS, X-Frame-Options)
- [ ] Set up database firewall (restrict to app IPs only)
- [ ] Enable Redis AUTH
- [ ] Rotate all secrets before production deployment
- [ ] Set up Cloudflare/WAF in front of load balancer
