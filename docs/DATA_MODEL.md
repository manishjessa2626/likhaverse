# LikhaVerse — Data Model Reference

**Engine:** Prisma 7.8.0
**Provider:** SQLite (dev) → PostgreSQL (prod)
**Models:** 42
**Source:** `prisma/schema.prisma`

---

## Entity Relationship Summary

```
User (1) ───< Story (N) ───< Chapter (N)
User (1) ───< Payment (N)
User (1) ───< WalletTransaction (N)
User (1) ───< DailyReward (N)
User (1) ───< Character (N) ───< AIGeneration (N) ───< AIGenerationLog (1)
User (1) ───< ConversationParticipant (N) >── Conversation (1) ───< Message (N)
User (1) ───< Comment (N) ───< Report (N)
User (1) ───< Notification (N)
User (1) ───< StudioApplication (N)
Story (1) ───< Season (N) ───< Chapter (N)
Story (1) ───< ReadingProgress (N)
Story (1) ───< StoryView (N)
Story (1) ───< WorldBuildingEntry (N)
Story (1) ───< EnvironmentStudio (N)
Story (1) ───< StoryAnalysis (N)
Story (1) ───< StoryboardScene (N)
Story (1) ───< StoryLike (N)
Story (1) ───< StoryReminder (N)
Story (1) ───< ChapterUnlock (N)
Story (1) ───< FilmProject (N) ───< FilmCrewMember (N)
Story (1) ───< FanArt (N)
Story (1) ───< CharacterVote (N)
Club (1) ───< ClubMember (N) >── User
Club (1) ───< Challenge (N) ───< ChallengeParticipant (N) >── User
LiveSession (1) ───< LiveSessionAttendee (N) >── User
Event (1) ───< EventAttendee (N) >── User
Post (1) ───< PostLike (N), PostComment (N), PostSave (N)
Reel (1) ───< ReelLike (N), ReelComment (N)
User (1) ───< MyDayStory (N)
```

---

## Model Catalog

### 1. User
| Field | Type | Notes |
|-------|------|-------|
| id | String (UUID) | PK |
| name | String | |
| email | String? | @unique |
| password | String? | bcrypt hash |
| phone | String? | @unique |
| provider | String | "email" \| "phone" \| "google" \| "firebase" |
| providerId | String? | OAuth provider ID |
| role | String | READER \| AUTHOR \| VIP_GOLD \| PREMIUM_CREATOR \| ADMIN \| SUPER_ADMIN |
| isVerified | Boolean | default false |
| bio | String? | |
| avatar | String? | URL |
| premium | Boolean | default false |
| premiumSince | DateTime? | |
| aiGenerationCount | Int | monthly counter |
| aiGenerationResetAt | DateTime? | monthly reset |
| walletBalance | Int | coin balance |
| subscriptionStatus | String | "active" \| "inactive" \| "expired" |
| subscriptionExpiry | DateTime? | |
| isVIP | Boolean | default false |
| rewardStreak | Int | daily login streak |
| dailyEpisodesRead | Int | daily reading counter |
| lastReadReset | DateTime? | |
| lastEpisodeUnlockTime | DateTime? | |
| createdAt | DateTime | |
| updatedAt | DateTime | |
| **Indexes** | role, name | |
| **Relations** | → payments, stories, comments, characters, notifications, messages, wallets, etc. (33 relations) | |

### 2. Payment
| Field | Type | Notes |
|-------|------|-------|
| id | String (UUID) | PK |
| userId | String | FK → User |
| amount | Int | in cents/pesos |
| method | String | gcash \| card \| apple_pay |
| type | String | "subscription" \| "coin_purchase" |
| status | String | "pending" \| "completed" \| "failed" |
| createdAt | DateTime | |
| **Indexes** | userId, status | |

### 3. UserAccount
| Field | Type | Notes |
|-------|------|-------|
| id | String (UUID) | PK |
| provider | String | OAuth provider name |
| providerId | String | OAuth user ID |
| userId | String | FK → User |
| createdAt | DateTime | |
| **Unique** | [provider, providerId] | |
| **Cascade** | onDelete: Cascade | |

### 4. Story
| Field | Type | Notes |
|-------|------|-------|
| id | String (UUID) | PK |
| title | String | |
| description | String? | |
| cover | String? | image URL |
| tags | String? | comma-separated |
| status | String | DRAFT \| PUBLISHED \| COMPLETED |
| accessType | String | FREE \| FREEMIUM \| PREMIUM |
| freePreviewChapters | Int | default 1 |
| wordCount | Int | aggregated |
| viewCount | Int | |
| completedAt | DateTime? | |
| studioBadge | Boolean | |
| completedBadge | Boolean | |
| original | Boolean | LikhaVerse Original |
| authorId | String | FK → User |
| createdAt | DateTime | |
| updatedAt | DateTime | |
| **Indexes** | status, title, tags | |
| **Relations** | → chapters, seasons, characters, comments, reactions, saves, aiGenerations, studioApplications, readingProgress, filmProjects, fanArts, storyboardScenes, worldBuildingEntries, environmentStudios, storyAnalyses, storyLikes, storyReminders, chapterUnlocks, characterVotes | |

### 5. Season
| Field | Type | Notes |
|-------|------|-------|
| id | String (UUID) | PK |
| title | String | |
| number | Int | sequential |
| storyId | String | FK → Story (Cascade) |
| **Unique** | [storyId, number] | |
| **Relations** | → chapters | |

### 6. Chapter
| Field | Type | Notes |
|-------|------|-------|
| id | String (UUID) | PK |
| title | String | |
| content | String | |
| number | Int | |
| wordCount | Int | |
| coinCost | Int | default 5 |
| storyId | String | FK → Story (Cascade) |
| seasonId | String? | FK → Season |
| createdAt | DateTime | |
| updatedAt | DateTime | |
| **Relations** | → comments, reactions, readingProgress, unlocks, adUnlocks | |

### 7. ChapterUnlock
| Field | Type | Notes |
|-------|------|-------|
| id | String (UUID) | PK |
| method | String | COINS \| AD \| PREMIUM |
| coinsSpent | Int? | |
| userId | String | FK → User |
| chapterId | String | FK → Chapter (Cascade) |
| storyId | String | FK → Story (Cascade) |
| createdAt | DateTime | |
| **Unique** | [userId, chapterId] | |

### 8. WalletTransaction
| Field | Type | Notes |
|-------|------|-------|
| id | String (UUID) | PK |
| type | String | EARN_SPEND \| DAILY_REWARD \| PURCHASE \| UNLOCK_SPEND |
| amount | Int | positive=earned, negative=spent |
| balance | Int | balance after transaction |
| description | String? | |
| streak | Int? | |
| userId | String | FK → User |
| createdAt | DateTime | |
| **Indexes** | userId, createdAt | |

### 9. DailyReward
| Field | Type | Notes |
|-------|------|-------|
| id | String (UUID) | PK |
| date | String | YYYY-MM-DD |
| amount | Int | |
| userId | String | FK → User |
| claimedAt | DateTime | |
| **Unique** | [userId, date] | |

### 10. AdUnlock — tracks ad-based chapter unlocks

### 11. Character
| Field | Type | Notes |
|-------|------|-------|
| id | String (UUID) | PK |
| name | String | |
| age, gender, personality, appearance, clothing, species, background, artStyle | String? | AI generation fields |
| imageUrl | String? | generated image |
| storyId | String | FK → Story (Cascade) |
| authorId | String | FK → User |
| **Relations** | → aiGenerations, characterVotes | |

### 12–14. AI & Studio Models
| Model | Purpose |
|-------|---------|
| **AIGeneration** | Records AI generation requests (type, prompt, style, imageUrl, status, provider, cost) |
| **AIGenerationLog** | Detailed log per generation (provider, model, tokens, duration, raw response) |
| **StudioApplication** | Author application for LikhaVerse Studios (genre, reason, visual style, status) |
| **WorldBuildingEntry** | World-building entries per story (type, title, content, metadata, image) |
| **EnvironmentStudio** | Environment/mood settings per story (name, description, mood, image) |
| **StoryAnalysis** | AI analysis results (type, content, metadata) |
| **StoryboardScene** | Storyboard scenes (title, description, sceneNumber, imageUrl) |

### 15–18. Communication
| Model | Key Fields |
|-------|------------|
| **Conversation** | lastMessage, participants[] |
| **ConversationParticipant** | userId, conversationId, lastReadAt |
| **Message** | subject?, content, read, senderId, receiverId, conversationId? |
| **Notification** | type, message, link?, read, userId, actorId? |

### 19–22. Community
| Model | Key Fields |
|-------|------------|
| **Comment** | content, storyId?, chapterId?, parentId? (nesting) |
| **Reaction** | type (LOVE/FUNNY/SAD/SURPRISED/AMAZING), storyId?, chapterId? |
| **Follow** | followerId, followingId |
| **Report** | reason, description, status, storyId?, commentId? |
| **Save** | userId, storyId (bookmark) |

### 23–24. Reading
| Model | Key Fields |
|-------|------------|
| **ReadingProgress** | userId, storyId, chapterId, scrollPosition |
| **StoryView** | storyId, userId? |
| **StoryLike** | userId, storyId |
| **StoryReminder** | userId, storyId, enabled |

### 25–26. Social Feed
| Model | Key Fields |
|-------|------------|
| **Post** | type (text/image/book), content, mediaUrls (JSON), bookId |
| **PostLike** | postId, userId |
| **PostComment** | postId, userId, text |
| **PostSave** | postId, userId |
| **MyDayStory** | mediaUrl, caption, expiresAt — 24h stories |
| **Reel** | videoUrl, caption, viewCount |
| **ReelLike** | reelId, userId |
| **ReelComment** | reelId, userId, text |

### 27–34. Community & Events
| Model | Key Fields |
|-------|------------|
| **Club** | name, description, type (WRITING/READING/GENRE), isPublic |
| **ClubMember** | role (OWNER/ADMIN/MODERATOR/MEMBER) |
| **Challenge** | title, description, type, startDate, endDate, rewardDesc |
| **ChallengeParticipant** | entry, votes |
| **LiveSession** | title, type, scheduledAt, duration, maxAttendees |
| **LiveSessionAttendee** | — |
| **Event** | title, type, scheduledAt, duration, link |
| **EventAttendee** | — |
| **FanArt** | imageUrl, caption, likes |
| **CharacterVote** | type (FAVORITE/BEST_ARC/BEST_DESIGN) |

### 35. Film Studio
| Model | Key Fields |
|-------|------------|
| **FilmProject** | title, logline, genre, status, screenplayContent, storyboardData, shotListData, productionPlan, budgetEstimate, posterUrl |
| **FilmCrewMember** | name, role (DIRECTOR/SCREENWRITER/PRODUCER/CINEMATOGRAPHER/EDITOR/COMPOSER) |

### 36–37. Security & System
| Model | Key Fields |
|-------|------------|
| **RateLimit** | key (unique), count, expiresAt |
| **IdempotencyKey** | key (PK), status, result, expiresAt |
| **VerificationCode** | code, type, target, expiresAt, used |

---

## Indexes Summary

| Model | Indexes |
|-------|---------|
| User | role, name |
| Payment | userId, status |
| Story | status, title, tags |
| ChapterUnlock | userId, storyId |
| WalletTransaction | userId, createdAt |
| DailyReward | userId, date |
| AdUnlock | userId, createdAt |
| Notification | userId, createdAt |
| Message | conversationId |
| Post | userId, createdAt |
| PostComment | postId |
| MyDayStory | expiresAt, userId |
| Reel | userId, createdAt |
| ReelComment | reelId |
| FanArt | storyId |
| ConversationParticipant | userId |
| StoryView | userId |
| IdempotencyKey | expiresAt |

---

## Cascade Rules

| Parent | Child | Rule |
|--------|-------|------|
| User | UserAccount, Post, PostLike, PostComment, PostSave, MyDayStory, Reel, ReelLike, ReelComment, StoryReminder | CASCADE |
| User | Story, Comment, Character, Club, Challenge, LiveSession, Event | CASCADE (via app logic) |
| Story | Chapter, Comment, Reaction, Save, Season, Character, AIGeneration, StudioApplication, WorldBuildingEntry, EnvironmentStudio, StoryAnalysis, StoryboardScene, StoryLike, ReadingProgress, StoryReminder, ChapterUnlock, FilmProject, FanArt, CharacterVote | CASCADE |
| Story | AIGeneration | SET NULL |
| Report | Story, Comment | SET NULL |
| Chapter | Comment, Reaction, ReadingProgress, ChapterUnlock, AdUnlock | CASCADE |
| Conversation | ConversationParticipant, Message | CASCADE |
| Club | ClubMember, Challenge | CASCADE |
| Challenge | ChallengeParticipant | CASCADE |
| LiveSession | LiveSessionAttendee | CASCADE |
| Event | EventAttendee | CASCADE |
| FilmProject | FilmCrewMember | CASCADE |
