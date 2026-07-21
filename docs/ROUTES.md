# LikhaVerse Route Map

Updated: 2026-07-07

```
/                           Homepage (glass cards + animated hero)
/welcome                    New user orientation

── DISCOVER ──
/stories                    Browse all stories
/stories/[id]               Story detail page
/stories/[id]/chapter/[id]  Chapter reading page
/genres                     Genre hub
/genres/[slug]              Genre detail
/search                     Global search

── LIBRARY ──
/library                    Reading list
/library/reading            Currently reading
/library/saved              Bookmarks
/library/history            Reading history

── AUTHOR STUDIO ──
/write                      My stories
/write/new                  Create story
/write/[storyId]            Chapter editor
/write/[storyId]/edit       Story settings
/author/stories             Full management
/author/seasons/[storyId]   Seasons
/author/ai                  AI generation hub
/author/ai/character        AI characters
/author/ai/cover            AI covers
/author/studio              Studio application
/author/messages            Author messages

── STORY STUDIO ──
/studio                     Story library (cards)
/studio/[storyId]           Per-story workspace

── AI STUDIO (Admin) ──
/admin/ai-studio            Hub
/admin/ai-studio/analyze/[id]
/admin/ai-studio/characters/[id]
/admin/ai-studio/world/[id]
/admin/ai-studio/environment/[id]
/admin/ai-studio/storyboard/[id]
/admin/ai-studio/trailer/[id]
/admin/ai-studio/production/[id]
/admin/ai-studio/cinematic/[id]
/admin/ai-studio/visual/[id]

── FILM STUDIO ──
/film                       Project library
/film/new                   New project
/film/[id]                  Project workspace
/film/[id]/screenplay       Screenplay view
/film/[id]/storyboard       Storyboard view
/film/[id]/shots            Shot list
/film/[id]/production       Production plan
/film/[id]/budget           Budget estimate

── COMMUNITY ──
/feed                       Activity/newsfeed
/messages                   Direct messages
/profile                    My profile
/profile/[id]               User profile
/notifications              Notifications
/reader-hub                 Reader dashboard

── PREMIUM ──
/premium                    Plans & pricing
/premium/features           Feature comparison

── ADMIN ──
/admin                      Dashboard
/admin/analytics            Analytics
/admin/originals            Originals management
/admin/premium              Premium management
/admin/studio               Studio management
/admin/users                User management

── SETTINGS ──
/settings/accounts
/settings/edit
/settings/notifications
/settings/privacy
/settings/billing
/settings/security

── AUTH ──
/login
/register
/verify-otp
/verify

── REMOVED (old design) ──
/splash                     → Deleted (redirects to /)
/demo                       → Deleted (redirects to /)
```

### API Routes
| Route | Method | Purpose |
|-------|--------|---------|
| `/api/auth/*` | Various | next-auth + Firebase OAuth |
| `/api/health` | GET | Health check (DB, Redis, uptime) |
| `/api/payments/buy-coins` | POST | Coin purchase (idempotent) |
| `/api/payments/subscription` | POST | Subscription (idempotent) |
| `/api/notifications/stream` | GET | SSE real-time stream |
| `/api/upload` | POST | File upload |
| `/api/upload-audio` | POST | Audio upload |
| `/api/chapters/[id]/content` | GET | Chapter content |
| `/api/stories/[id]/chapters` | GET | Chapter list |
| `/api/reading-progress` | POST/GET | Save/get reading progress |
| `/api/search` | GET | Global search |
| `/api/unread-counts` | GET | Unread counts |
| `/api/mfa/*` | POST | MFA setup/verify/disable |
| `/api/user/*` | GET/PUT | Profile CRUD |
