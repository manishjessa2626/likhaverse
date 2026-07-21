# Reader Test Report

**Role:** READER (`reader@likhaverse.com` / `Reader123!`)
**Date:** 2026-06-23

## Test Results

| # | Test | Expected | Actual | Status |
|---|------|----------|--------|--------|
| 1 | Login with credentials | 200 | 200 | ✅ |
| 2 | Browse `/stories` — shows COMPLETED + PUBLISHED stories | 200, shows "The Last Ember" + "Stars Beyond the Horizon" | 200, both visible | ✅ |
| 3 | Open `/stories/story-ember` — detail page with badges | 200, shows chapters + Completed + Original badges | 200, all visible | ✅ |
| 4 | Read free chapters 1, 5, 10, 15 | 200 | All 200 | ✅ |
| 5 | Access premium-locked chapters 16, 20, 25, 30 | 307 redirect with paywall | All 307, paywall present | ✅ |
| 6 | Reader dashboard `/reader` | 200 with Saved Stories | 200, section visible | ✅ |
| 7 | Author tools blocked — `/author`, `/author/ai`, `/author/stories/new` | 307 redirect to login | All 307 | ✅ |

## Issues Found & Fixed

### 1. `/stories` did not show COMPLETED stories
The browse page queried `status: "PUBLISHED"` only. "The Last Ember" has `status: "COMPLETED"`.
- **Fix:** Changed query to `status: { in: ["PUBLISHED", "COMPLETED"] }` in `src/app/stories/page.tsx:9`

### 2. `/stories/story-ember` returned 500
`ChapterList.tsx` passed `onClick` to `Link` from `next/link`. In Next.js 16, `Link` is a Server Component and cannot accept event handlers.
- **Fix:** Added `"use client"` directive to `ChapterList.tsx`

### 3. `/reader` returned 500
`StoryCard.tsx` crashed on `story.author.role` when `story.author` was null. A `Save` record in the database had a `storyId` referencing a story whose author had been deleted or never had an author.
- **Fix:** Added optional chaining (`story.author?.role`) and filtered null stories in the reader page.

### 4. `/author` returned 200 with `-L` flag
The server correctly returns 307 (redirect to `/login`), but with `curl -L`, the final page after following the redirect is the login page (200). Actual behavior is correct.

## Edge Cases Verified
- Unauthenticated access to `/author` → redirects to login
- Chapter links for locked chapters show "Locked" label and paywall alert
- Reader can see chapter list with lock icons for premium content
- Freemium story shows "Freemium" badge on detail page
- Completed badge renders correctly for COMPLETED stories
- LikhaVerse Original badge renders when `original: true`

## Notes
- The free/premium boundary is `freePreviewChapters` (15 for "The Last Ember")
- Locked chapters return 307 to a paywall page rather than serving 403 or 404
- Author dashboard routes use role-checking middleware (`getServerSession` + role array) — READER role is excluded
