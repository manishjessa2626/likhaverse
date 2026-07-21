# LIKHAVERSE DEVELOPMENT ROADMAP

## Project Vision

Likhaverse is an AI-powered storytelling ecosystem where users can read, write, create characters, design book covers, and experience stories that evolve into cinematic productions. The platform serves four user roles: Reader, Author, Premium Creator, and Super Admin.

---

## Phase 0 — Foundation & UX Polish

**Goal:** Fix gaps in existing features and provide a polished user experience before adding new capabilities.

### Features

| # | Feature | Details |
|---|---------|---------|
| 0.1 | Rich text editor for chapters | Replace plain `<textarea>` with a WYSIWYG editor (TipTap/ProseMirror) for bold, italic, headings, images, and formatting. Preserve existing word count logic. |
| 0.2 | Notification UI | Build notification bell dropdown in Navbar with unread count, a notification list page (`/notifications`), and mark-as-read functionality. Trigger notifications on: follow, comment, new chapter from followed author, application status change. |
| 0.3 | Author profile pages | Create `/authors/[authorId]` with bio, avatar, follower count, story list. Wire up existing author name links that currently go to "#". |
| 0.4 | Story search & filter | Add search-by-title and filter-by-tag on `/stories` browse page. Sort by recent, popular, views. |
| 0.5 | Report management UI | Add "Report" button on stories, chapters, and comments. Build admin report moderation page to review PENDING reports, mark RESOLVED/DISMISSED. |
| 0.6 | Loading states & error boundaries | Add skeleton loaders, a proper 404 page, global error boundary, form validation feedback, and toast notifications for actions. |
| 0.7 | Delete confirmations & UX | Replace `confirm()` dialogs with modal components for story/chapter/comment deletion. Add chapter reordering (drag-and-drop). |

### Database Changes

- **Notification** model already exists — no schema changes needed (seed initial notification types).
- No other schema changes.

### API/Server Actions Needed

Refine existing actions:
- `notifications.ts` — `getNotifications()`, `markNotificationRead(id)`, `markAllRead()`, `getUnreadCount()` (currently message-only).
- `reports.ts` — `submitReport(storyId/chapterId/commentId, reason, description)`, `reviewReport(id, status)`, `getPendingReports()`.
- `stories.ts` — Add search/filter query params to `getPublishedStories()`.

### Frontend Pages/Components

- `src/components/layout/NotificationBell.tsx` — dropdown in Navbar.
- `src/components/ui/Modal.tsx` — reusable modal.
- `src/components/ui/LoadingSkeleton.tsx` — skeleton component.
- `src/app/(dashboard)/notifications/page.tsx` — notification list.
- `src/app/authors/[authorId]/page.tsx` — author profile.
- `src/app/admin/reports/page.tsx` — report moderation dashboard.
- `src/app/stories/page.tsx` — add search bar, filter dropdowns, pagination.
- `src/app/stories/[storyId]/ReportButton.tsx` — report trigger.
- `src/app/not-found.tsx` — 404 page.
- `src/app/error.tsx` — global error boundary.

### User Permissions & Access

- Notifications: visible to all authenticated users.
- Reports: all authenticated users can submit; ADMIN/SUPER_ADMIN can review.
- Author profiles: public.
- Search/filter: public.
- Rich text editor: AUTHOR, ADMIN, SUPER_ADMIN only.

### Dependencies

None — all build on existing infrastructure.

---

## Phase 1 — Monetization & Premium Ecosystem

**Goal:** Replace the free premium toggle with a real payment system, introduce Premium Creator as a distinct role, and build subscription management.

### Features

| # | Feature | Details |
|---|---------|---------|
| 1.1 | Stripe payment integration | Connect Stripe Checkout for Premium membership ($4.99–$9.99/mo). Webhook handler for subscription lifecycle (created, updated, canceled, past_due). |
| 1.2 | Premium Creator role | New `PREMIUM_CREATOR` role with increased AI limits (50/mo), ability to apply for Likhaverse Studios, access to exclusive tools, priority support badge. Migration to add role enum. |
| 1.3 | Subscription management page | `/premium/manage` — cancel, change plan, view billing history, download invoices. Portal link or self-managed. |
| 1.4 | Premium pricing tiers | 2–3 tiers: Basic (more AI gens), Pro (unlimited AI + Studio eligibility), Annual (discount). |
| 1.5 | Payment analytics dashboard | Revenue metrics (MRR, total revenue, churn rate) in `/admin/analytics`. |

### Database Changes

- **User model**: Change `role` from String to enum: `READER`, `AUTHOR`, `ADMIN`, `SUPER_ADMIN`, `PREMIUM_CREATOR`. Add `stripeCustomerId`, `stripeSubscriptionId`, `subscriptionStatus`, `subscriptionTier`, `subscriptionEndsAt` fields.
- **New model `SubscriptionInvoice`**: `id`, `userId`, `amount`, `currency`, `status`, `stripeInvoiceId`, `periodStart`, `periodEnd`, `createdAt`.
- **Migration**: Add `aiGenerationLimit` int field to User (default 5, override per role/tier).

### API/Server Actions

- `stripe.ts` — `createCheckoutSession(tier)`, `cancelSubscription()`, `getSubscriptionStatus()`, webhook handlers.
- Updated `premium.ts` — `upgradeToPremium()` now creates Stripe checkout session instead of direct toggle.
- Updated `ai.ts` — AI limit check reads `aiGenerationLimit` from user profile instead of hardcoded 5.
- Updated `studio.ts` — Studio application requires `PREMIUM_CREATOR` role (not just `premium` boolean).

### Frontend Pages/Components

- `src/app/premium/checkout/page.tsx` — Stripe Checkout redirect/loading.
- `src/app/premium/manage/page.tsx` — subscription management.
- Update `/premium` page — pricing cards with tier comparison, CTA to checkout.
- Update `/admin/analytics` — revenue data, churn rate, MRR.

### User Permissions & Access

- `PREMIUM_CREATOR`: all AUTHOR permissions + Studio eligibility, higher AI limits.
- Stripe webhook: public endpoint.
- Subscription management: authenticated premium users only.
- Revenue analytics: ADMIN/SUPER_ADMIN only.

### Dependencies

Prerequisites: Phase 0 complete (stable UX for paying users).

---

## Phase 2 — Real AI Integration

**Goal:** Connect actual AI services (OpenAI, Stability AI, etc.) to generate characters, covers, story analyses, and storyboard visuals. The current code creates records but never calls any AI API.

### Features

| # | Feature | Details |
|---|---------|---------|
| 2.1 | AI character image generation | On character creation, send character description params to DALL-E 3 or Stable Diffusion API. Store returned image URL in `Character.imageUrl`. |
| 2.2 | AI cover art generation | On cover generation prompt, send to image generation API. Store result in `AIGeneration.imageUrl`. Display in generator history for selection. |
| 2.3 | AI story analysis | Replace manual text entry in Story Analyzer with automated analysis via GPT-4/Claude. Agent reads all chapters and outputs character profiles, timeline, world history, relationships, themes. |
| 2.4 | AI storyboard visualization | Generate images for storyboard scenes using AI based on scene description and linked chapter content. |
| 2.5 | AI generation queue | For long-running generations (analysis, storyboard), implement background queue with status polling. Show "Generating..." states and notifications when complete. |
| 2.6 | AI generation limits by tier | Enforce per-tier limits: FREE=5/mo, PREMIUM_CREATOR=50/mo, SUPER_ADMIN=unlimited. Track `aiGenerationCount` and `aiGenerationResetAt`. Show remaining count to user. |

### Database Changes

- Add `AIGeneration` fields: `status` (PENDING/PROCESSING/COMPLETED/FAILED), `errorMessage`, `modelUsed`, `duration`.
- Add `StoryAnalysis` field: `status` for async generation tracking.
- No new models needed.

### API/Server Actions

- New ai provider service: `src/lib/ai/openai.ts`, `src/lib/ai/stability.ts` — thin wrappers around API calls.
- Updated `generateCharacter()` — calls AI API, updates record with image URL.
- Updated `generateCover()` — calls AI API, stores result image.
- Updated `saveStoryAnalysis()` — triggers async AI analysis instead of saving user text.
- Updated `generateStoryboardScene()` — generates image from scene description.
- New `checkGenerationStatus(id)` — polling endpoint for frontend.

### Frontend Pages/Components

- Update `/author/ai/character` — show generation progress, retry on failure, display generated image.
- Update `/author/ai/cover` — show generation progress, allow selecting generated cover for story.
- Update `/admin/ai-studio/analyze/[storyId]` — "Analyze with AI" button instead of text form, streaming/progress display.
- Update `/admin/ai-studio/storyboard/[storyId]` — "Generate Scene Image" button.
- Update `/author/ai` — show remaining generation count with progress bar.
- New `GenerationProgress.tsx` component for showing queue status.
- New `AILimitBadge.tsx` component showing remaining credits.

### User Permissions & Access

- All AI features gated by role and limit checks.
- SUPER_ADMIN always bypasses limits.
- Admin can view generation queue, retry failed jobs.

### Dependencies

- Phase 1 (monetization) provides Premium Creator with higher limits and revenue to fund API costs.
- Phase 0 (rich text + search) ensures content is well-formatted for analysis.

---

## Phase 3 — Likhaverse Studios Completion

**Goal:** Complete the cinematic production pipeline — Visual Development, Cinematic Production, and application lifecycle.

### Features

| # | Feature | Details |
|---|---------|---------|
| 3.1 | Visual Development tool | Build actual asset generation for character sheets, locations, buildings, creatures, weapons, clothing designs — using AI image generation + organized gallery per story. |
| 3.2 | Cinematic Production tool | Build trailer generation pipeline: teaser trailers, character introductions (AI video/image), animated scenes, voice-over, background music/sound effects, short films. |
| 3.3 | Application editing | Author can edit submitted applications (resubmit for review). "Needs Revision" status and workflow (review notes from admin, author revises). |
| 3.4 | Studio dashboard for authors | `/author/studio/dashboard` — overview of application status, production progress, asset gallery, cinematic timeline. |
| 3.5 | Asset management system | Media library per story for studio-generated assets (images, audio, video). Storage with previews and download. |

### Database Changes

- **New model `StudioAsset`**: `id`, `storyId`, `type` (CHARACTER_SHEET/LOCATION/CONCEPT_ART/TRAILER/AUDIO/VIDEO), `title`, `url`, `thumbnailUrl`, `metadata`, `createdAt`.
- **New model `ProductionLog`**: `id`, `storyId`, `phase`, `status`, `notes`, `createdAt`.
- **StudioApplication**: add `resubmittedAt` field.

### API/Server Actions

- `studio-assets.ts` — `uploadAsset()`, `deleteAsset()`, `getAssets(storyId)`.
- `cinematic.ts` — `generateTrailer(storyId, type)`, `generateVoiceover(sceneId, text)`, `getProductionStatus(storyId)`.
- Updated `studio.ts` — add `resubmitApplication()`, `needsRevision()` status handling.
- AI integration (reuses Phase 2 services) for image/video/audio generation.

### Frontend Pages/Components

- Updated `/admin/ai-studio/visual/[storyId]` — real asset generation gallery (replace placeholder boxes).
- Updated `/admin/ai-studio/cinematic/[storyId]` — production pipeline UI (replace placeholder boxes).
- `/author/studio/dashboard/page.tsx` — production overview.
- `/author/studio/assets/page.tsx` — asset library.
- Asset preview components: `AssetCard.tsx`, `AssetGallery.tsx`, `AudioPlayer.tsx`, `VideoPlayer.tsx`.

### User Permissions & Access

- Visual/Cinematic tools: SUPER_ADMIN only (per PRD).
- Studio dashboard: AUTHOR who submitted application.
- Asset management: AUTHOR and SUPER_ADMIN.

### Dependencies

- Phase 2 (AI integration) provides the image/video/audio generation APIs.
- Phase 1 ensures only Premium Creators can apply.

---

## Phase 4 — Community & Engagement

**Goal:** Build deeper community features — real-time interaction, social features, gamification, and moderation tools.

### Features

| # | Feature | Details |
|---|---------|---------|
| 4.1 | Real-time messaging | WebSocket integration (Socket.io or WebSocket API) for instant messaging, typing indicators, online status, message threads. |
| 4.2 | Story reactions (emoji on stories) | Extend Reaction model to support stories (not just chapters). Show reactions on story detail page. |
| 4.3 | Comment likes & nesting | Add upvote/like on comments. Support infinite nesting depth. |
| 4.4 | Reading challenges & badges | Gamification: reading streaks, completion badges, comment milestones, follower milestones. Display on profiles. |
| 4.5 | Reading clubs / discussion groups | Users can create/join reading clubs for specific stories. Discussion threads per club. |
| 4.6 | Email notifications | Send email for: new follower, new comment, new chapter from followed author, application update, premium renewal reminder. |
| 4.7 | Moderation dashboard | Full content moderation: reported stories/chapters/comments with review queue, action (warn, hide, delete), user suspension. |

### Database Changes

- **Reaction**: add `storyId` optional FK.
- **Comment**: add `likes` count, increase nesting support.
- **New model `UserBadge`**: `id`, `userId`, `type`, `earnedAt`.
- **New model `ReadingClub`**: `id`, `name`, `description`, `storyId`, `ownerId`, `createdAt`.
- **New model `ClubMember`**: `id`, `clubId`, `userId`, `role` (MEMBER/MODERATOR/OWNER).
- **New model `ClubDiscussion`**: `id`, `clubId`, `title`, `content`, `authorId`, `createdAt`.
- **New model `UserSuspension`**: `id`, `userId`, `reason`, `until`, `createdBy`.

### API/Server Actions

- `websocket.ts` — WebSocket connection handler (or Socket.io server).
- `reactions.ts` — updated to support `storyId`.
- `comments.ts` — `likeComment()`.
- `badges.ts` — `awardBadge(userId, type)`, `getUserBadges()`.
- `clubs.ts` — CRUD for reading clubs, members, discussions.
- `notifications.ts` — `sendEmailNotification()` for each notification type.
- `moderation.ts` — `suspendUser()`, `hideContent()`, `moderationQueue()`.

### Frontend Pages/Components

- Real-time messaging UI: chat bubbles, typing indicators.
- Updated `/stories/[storyId]` — story-level reactions.
- Updated comment threads — infinite nesting, upvote buttons.
- `/profile/badges` — badge gallery.
- `/clubs` — reading club directory.
- `/admin/moderation` — moderation queue.
- Notification email templates.

### User Permissions & Access

- WebSocket messaging: authenticated users.
- Reading clubs: all authenticated users.
- Moderation: ADMIN/SUPER_ADMIN only.
- Badges: automatic system + manual award by admin.

### Dependencies

- Phase 0 (notifications, reports) needed as foundation for moderation.
- Phase 1 (payments) needed if clubs have premium features.

---

## Phase 5 — Scale & Production Readiness

**Goal:** Prepare the platform for real-world usage: performance, security, deployment, and developer tooling.

### Features

| # | Feature | Details |
|---|---------|---------|
| 5.1 | Production database migration | Move from SQLite to PostgreSQL (or Turso for edge). Update Prisma provider, migration strategy, connection pooling. |
| 5.2 | Cloud storage for uploads | Migrate `public/uploads/` to S3/Cloudinary. Update upload API to stream to cloud. Serve via CDN. |
| 5.3 | Image optimization | Use Next.js `<Image>` component everywhere with remote patterns configured. On upload, generate thumbnails and optimized variants. |
| 5.4 | Caching strategy | Redis/Memcached for: story page cache, session cache, feed cache, AI generation result cache. Invalidation on publish/update. |
| 5.5 | Rate limiting | On API routes and server actions: 10 req/s for general, 1 req/s for AI generation, strict limits on auth endpoints. |
| 5.6 | Error monitoring | Sentry or similar for error tracking, performance monitoring, and crash reporting. |
| 5.7 | Logging system | Structured logging (pino/winston) for server actions and API routes. Log retention policy. Admin log viewer. |
| 5.8 | CI/CD pipeline | GitHub Actions: lint → typecheck → build → test → deploy. Automatic DB migrations in deploy step. Preview deployments for PRs. |
| 5.9 | Docker configuration | Dockerfile and docker-compose for local dev and production deployment. Multi-stage build. |
| 5.10 | OAuth providers | Add Google, GitHub, and Facebook OAuth login via NextAuth providers. Link multiple accounts. |
| 5.11 | SEO & metadata | Dynamic OG images for stories, proper meta tags on all pages, sitemap generation, RSS feed for new chapters. |

### Database Changes

- Provider change: `sqlite` → `postgresql` in Prisma schema.
- Add indexes on frequently queried fields: `Story.viewCount`, `Chapter.storyId`, `Comment.storyId`, `Notification.userId`, `AIGeneration.userId`.
- Full-text search index on `Story.title` and `Story.description` (PostgreSQL tsvector).

### API/Server Actions

- `s3-upload.ts` — upload handler for S3/Cloudinary.
- `cache.ts` — Redis cache layer.
- `rate-limit.ts` — rate limiter helper.
- `logger.ts` — structured logging setup.

### Frontend Pages/Components

- Update all `<img>` tags to use Next.js `<Image>`.
- OG image generation at `/api/og/[storyId]`.
- `/sitemap.xml` and `/rss.xml` routes.

### Infrastructure

- `Dockerfile` — multi-stage Next.js build.
- `docker-compose.yml` — app + Redis + Postgres.
- `.github/workflows/ci.yml` — CI pipeline.
- `.github/workflows/deploy.yml` — deployment pipeline.

### User Permissions & Access

No changes — all infrastructure improvements are transparent to users.

### Dependencies

All earlier phases should be stable before scaling.

---

## Summary: Phase Dependencies Graph

```
Phase 0 (Foundation)
  ├── enables Phase 4 (Community: reports, notifications)
  ├── enables Phase 5 (SEO, images)
  └── prerequisite for all subsequent phases
  
Phase 1 (Monetization)
  ├── enables Phase 2 (AI: revenue funds API costs)
  └── enables Phase 3 (Studio: Premium Creator gating)
  
Phase 2 (AI Integration)
  └── enables Phase 3 (Studio: visual/cinematic generation)
  
Phase 3 (Studio)
  └── independent feature, uses Phase 1 + Phase 2
  
Phase 4 (Community)
  └── mostly independent, uses Phase 0 foundation
  
Phase 5 (Scale)
  └── last phase, can run in parallel with Phase 3+4 for non-infra tasks
```

---

## Quick Reference: What Exists vs. What's Planned

| Feature Area | Already Built | Phase |
|---|---|---|
| Auth (email/password, roles, JWT) | ✅ Full CRUD | Phase 0 |
| OAuth login | ❌ | Phase 5 |
| Story CRUD (status, access types) | ✅ Full CRUD | — |
| Chapter CRUD | ✅ Full CRUD | — |
| Rich text editor | ❌ Plain textarea | Phase 0 |
| Seasons | ✅ Full CRUD | — |
| Comments | ✅ Add/delete with nesting | Phase 0 |
| Comment likes | ❌ | Phase 4 |
| Reactions (chapter emoji) | ✅ Full | Phase 4 |
| Story reactions | ❌ | Phase 4 |
| Saves/Bookmarks | ✅ Full | — |
| Follows | ✅ Full | — |
| Author profiles | ❌ Links go to "#" | Phase 0 |
| Messaging | ✅ Inbox/outbox | Phase 4 |
| Real-time messaging | ❌ | Phase 4 |
| Notifications (DB) | ✅ Model + message notification | Phase 0 |
| Notification UI | ❌ No dropdown/list | Phase 0 |
| Email notifications | ❌ | Phase 4 |
| Reports (DB) | ✅ Model exists | Phase 0 |
| Report UI | ❌ No submit/review | Phase 0 |
| AI records storage | ✅ Records created | Phase 2 |
| Real AI API calls | ❌ No image/text generation | Phase 2 |
| Premium toggle | ✅ Free toggle | Phase 1 |
| Stripe payments | ❌ | Phase 1 |
| Premium Creator role | ❌ | Phase 1 |
| Studio applications | ✅ Submit/review workflow | Phase 3 |
| Studio "Needs Revision" | ❌ | Phase 3 |
| Visual Development | ❌ Placeholder boxes | Phase 3 |
| Cinematic Production | ❌ Placeholder boxes | Phase 3 |
| Originals curation | ✅ Toggle + homepage | Phase 3 |
| Analytics (text) | ✅ Counts + lists | Phase 0 |
| Analytics (charts, revenue) | ❌ | Phase 1 |
| Search/filter stories | ❌ | Phase 0 |
| Loading states / errors | ❌ | Phase 0 |
| Reading clubs | ❌ | Phase 4 |
| Badges/gamification | ❌ | Phase 4 |
| Moderation tools | ❌ | Phase 4 |
| Production DB (Postgres) | ❌ SQLite only | Phase 5 |
| Cloud storage | ❌ Local filesystem | Phase 5 |
| CI/CD | ❌ | Phase 5 |
| Docker | ❌ | Phase 5 |
| Rate limiting | ❌ | Phase 5 |
| Error monitoring | ❌ | Phase 5 |
