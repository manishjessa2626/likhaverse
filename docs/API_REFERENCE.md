# LikhaVerse — API Reference

---

## API Routes (`src/app/api/`)

| Route | Method | Auth | Purpose |
|-------|--------|------|---------|
| `/api/auth/session` | GET | Public | Get current session (next-auth) |
| `/api/auth/csrf` | GET | Public | CSRF token (next-auth) |
| `/api/auth/providers` | GET | Public | List auth providers |
| `/api/auth/signin/[provider]` | POST | Public | Sign in |
| `/api/auth/callback/[provider]` | POST | Public | OAuth callback |
| `/api/auth/firebase/callback` | POST | Public | Firebase ID token → create/find user |
| `/api/auth/email-otp/send` | POST | Public | Send email OTP |
| `/api/auth/email-otp/verify` | POST | Public | Verify email OTP |
| `/api/health` | GET | Public | DB + Redis ping, uptime, memory |
| `/api/payments/buy-coins` | POST | Auth | Coin purchase (idempotent) |
| `/api/payments/subscription` | POST | Auth | Subscription activation (idempotent) |
| `/api/notifications/stream` | GET | Auth | SSE real-time notification stream |
| `/api/upload` | POST | Auth | File upload (⚠ no validation) |
| `/api/upload-audio` | POST | Auth | Audio upload |
| `/api/chapters/[id]/content` | GET | Optional | Raw chapter content |
| `/api/stories/[id]/chapters` | GET | Optional | Chapter list for a story |
| `/api/reading-progress` | POST | Auth | Save reading progress |
| `/api/reading-progress/[storyId]` | GET | Auth | Get reading progress |
| `/api/search` | GET | Public | Global search (stories, users, chapters) |
| `/api/unread-counts` | GET | Auth | Unread notifications + messages count |
| `/api/mfa/setup` | POST | Auth | Setup MFA |
| `/api/mfa/verify` | POST | Auth | Verify MFA code |
| `/api/mfa/disable` | POST | Auth | Disable MFA |
| `/api/user/profile` | GET | Auth | Get own profile |
| `/api/user/profile` | PUT | Auth | Update own profile |
| `/api/user/stats` | GET | Auth | Get own stats (stories, followers, etc.) |

---

## Server Actions (`src/app/actions/`)

All 32 actions use `"use server"` directive with Zod validation.

### Auth & Accounts
| Action | Input | Auth |
|--------|-------|------|
| `register(data)` | name, email, password | Public |
| `updateAccount(data)` | profile fields | Auth |
| `deleteAccount()` | — | Auth |
| `getActivity()` | — | Auth |

### Stories
| Action | Input | Auth |
|--------|-------|------|
| `createStory(data)` | title, description, tags | AUTHOR+ |
| `updateStory(id, data)` | story fields | Author/Owner |
| `deleteStory(id)` | — | Author/Owner |
| `getStoryById(id)` | — | Public (⚠ leaks drafts) |
| `getStoriesForHomepage()` | — | Public (⚠ excludes COMPLETED) |
| `getPublishedStories(params)` | genre, status, sort | Public |
| `recordStoryView(id)` | — | ⛔ NO AUTH (CRITICAL) |

### Chapters
| Action | Input | Auth |
|--------|-------|------|
| `createChapter(storyId, data)` | title, content | Author/Owner |
| `updateChapter(id, data)` | chapter fields | Author/Owner |
| `deleteChapter(id)` | — | Author/Owner |
| `getChapterById(id)` | — | Public (⚠ leaks locked) |
| `getChaptersForStory(storyId)` | — | Public (⚠ leaks all) |

### Comments, Reactions, Saves, Follows
| Action | Input | Auth |
|--------|-------|------|
| `addComment(data)` | storyId/chapterId, content | Auth |
| `deleteComment(id)` | — | Owner/Admin |
| `getComments(target)` | storyId/chapterId | Public |
| `toggleReaction(target, type)` | storyId/chapterId, type | Auth |
| `getChapterReactions(chapterId)` | — | Public |
| `toggleSave(storyId)` | — | Auth |
| `toggleFollow(userId)` | — | Auth |

### AI
| Action | Input | Auth |
|--------|-------|------|
| `generateCharacter(data)` | storyId, character fields | AUTHOR+ (limit 5/mo) |
| `generateCover(data)` | storyId, style, prompt | AUTHOR+ (limit 5/mo) |
| `getGenerationHistory()` | — | Auth |
| `getStoryCharacters(storyId)` | — | Auth (⚠ no ownership) |

### Premium & Payments
| Action | Input | Auth |
|--------|-------|------|
| `getCurrentTier()` | — | Auth |
| `canAccessFeature(feature)` | feature name | Auth |
| `getTierForRole(role)` | role string | Auth |
| `upgradeToPremium()` | — | Auth (toggles premium) |
| `cancelPremium()` | — | Auth |

### AI Studio (SUPER_ADMIN only — 18 actions)
| Action | Purpose |
|--------|---------|
| `getStoryAnalysis(storyId)` | Get AI analysis |
| `saveStoryAnalysis(storyId, data)` | Save analysis result |
| `getWorldBuilding(storyId)` | Get world entries |
| `saveWorldBuilding(id, data)` | Save world entry |
| `getEnvironments(storyId)` | Get environments |
| `saveEnvironment(id, data)` | Save environment |
| `getStoryboardScenes(storyId)` | Get storyboard |
| `saveStoryboardScene(storyId, data)` | Save scene |
| `deleteStoryboardScene(id)` | Delete scene |
| `getTrailer(storyId)` | Get trailer data |
| `saveTrailer(storyId, data)` | Save trailer |
| `getProduction(storyId)` | Get production data |
| `saveProduction(storyId, data)` | Save production data |
| (plus Phase 5 expanded variants) | |

### Studio
| Action | Input | Auth |
|--------|-------|------|
| `submitApplication(data)` | storyId, genre, reason | PREMIUM_CREATOR+ |
| `getApplication(storyId)` | — | Author/Owner |
| `reviewApplication(id, status)` | status, notes | ADMIN+ |
| `getPendingApplications()` | — | ADMIN+ |

### Social
| Action | Input | Auth |
|--------|-------|------|
| `sendMessage(data)` | receiverId, content | Auth |
| `getConversations()` | — | Auth |
| `getMessages(conversationId)` | — | Auth |
| `markAsRead(messageId)` | — | Auth |
| `getNotifications()` | — | Auth |
| `markNotificationRead(id)` | — | Auth |
| `markAllNotificationsRead()` | — | Auth |
| `getLibrary()` | — | Auth (saved stories) |
| `getReadingHistory()` | — | Auth |
| `getFeed(params)` | — | Auth |
| `uploadStoryImage(file)` | — | Auth |
| `createPost(content)` | — | Auth |
| `togglePostLike(postId)` | — | Auth |
| `addPostComment(postId, text)` | — | Auth |
| `deletePost(postId)` | — | Owner |
| `getPostComments(postId)` | — | Public |
| `togglePostSave(postId)` | — | Auth |
| `createMyDayStory(data)` | mediaUrl, caption | Auth |
| `getReels()` | — | Public |
| `toggleReelLike(reelId)` | — | Auth |
| `addReelComment(reelId, text)` | — | Auth |

---

## Real-Time (SSE)

**Endpoint:** `GET /api/notifications/stream` (authenticated)

Events:
- `notification` — new notification
- `message` — new direct message
- `presence` — user online/offline
- `live-session` — live session updates

Backed by `EventEmitter3` singleton in `src/lib/realtime/event-bus.ts`.

---

## Payment Flow

```
User → POST /api/payments/buy-coins (idempotent)
  ├── validate body (packageId, method, idempotencyKey)
  ├── processIdempotent(key) → dedup check
  ├── verify user + package
  ├── $transaction:
  │   ├── create Payment record
  │   └── update walletBalance += coins
  └── return { success, coins, balance, paymentId }

User → POST /api/payments/subscription (idempotent)
  ├── validate body (plan, method, idempotencyKey)
  ├── processIdempotent(key) → dedup check
  ├── $transaction:
  │   ├── create Payment record
  │   └── update subscriptionStatus + subscriptionExpiry
  └── return { success, expiresAt }
```

All payment mutations use:
- **Idempotency keys** (`IdempotencyKey` model) — prevent duplicate charges
- **Prisma `$transaction`** — atomic wallet + payment + subscription updates
- **Circuit breaker** — fail-fast if payment service is degraded
- **Retry with jitter** — exponential backoff for transient failures
