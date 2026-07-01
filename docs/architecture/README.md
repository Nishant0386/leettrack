# LeetTrack — System Architecture

## Overview

LeetTrack is a monorepo (Turborepo) with two deployable apps and shared packages.

```
┌─────────────┐      HTTPS/REST      ┌──────────────┐      Prisma       ┌────────────┐
│  Next.js 15  │ ───────────────────▶ │   NestJS API  │ ─────────────────▶│ PostgreSQL │
│  (apps/web)  │ ◀─────────────────── │  (apps/api)   │                   └────────────┘
└─────────────┘      WebSocket        └──────────────┘
       ▲              (Socket.IO)            │
       │                                     │ Bull Queue
       │                                     ▼
       │                              ┌────────────┐
       └──────────────────────────────│   Redis    │
              Session/Cache           └────────────┘
                                             │
                                             ▼
                                    ┌──────────────────┐
                                    │ LeetCode GraphQL  │
                                    │ (public API)       │
                                    └──────────────────┘
```

## Authentication Flow

1. Student clicks "Continue with Google" → redirected to `GET /api/v1/auth/google`
2. NestJS's Passport Google strategy handles the OAuth handshake
3. On callback, `AuthService.validateGoogleUser()` finds-or-creates a `User` + `StudentProfile`
4. Backend issues a JWT pair (access + refresh) and redirects to
   `FRONTEND_URL/auth/callback?accessToken=...&refreshToken=...`
5. The frontend's callback page calls NextAuth's `signIn('credentials', { accessToken })`,
   which validates the token against `GET /auth/me` and stores it in an encrypted session cookie
6. All subsequent API calls attach `Authorization: Bearer <accessToken>` via the Axios
   interceptor in `apps/web/src/lib/api.ts`

No LeetCode or Gmail password ever touches the backend — only the LeetCode **username** is
stored, and it's verified against LeetCode's public GraphQL API before being saved.

## LeetCode Sync Pipeline

- `LeetcodeService.fetchPublicProfile(username)` queries `https://leetcode.com/graphql`
  (no auth needed) and caches the result in Redis for 5 minutes
- A NestJS `@Cron(EVERY_6_HOURS)` job (`LeetcodeService.scheduledSync`) enqueues a Bull job
  per verified student
- `LeetcodeSyncProcessor` consumes the queue, calls `takeSnapshot()` to persist a
  `LeetcodeSnapshot` row, and triggers `GamificationService.checkAndAwardBadges()`
- Growth metrics (daily/weekly/monthly) are derived by comparing the latest snapshot against
  historical snapshots — this is what powers the "Historical Analytics Engine" requirement,
  working around LeetCode's lack of a public activity-history endpoint

## AI Insights Engine

`AiInsightsService` computes, per student per class:

- **Performance Score (0–100)**: 40% problem-solving volume, 20% weekly growth, 15% attendance,
  15% assignment completion, 10% consistency (streak)
- **Risk Level**: a weighted rule-based score across inactivity days, attendance, assignment
  completion, and growth trend, bucketed into `HEALTHY` / `NEEDS_ATTENTION` / `AT_RISK`
- **Insights**: human-readable strings generated from the same metrics (inactivity warnings,
  growth callouts, attendance flags)
- **Predictions**: simple linear extrapolation of the weekly solve rate to project semester-end
  totals, with a qualitative performance label

This is a deterministic, explainable rules engine rather than an LLM call — it's fast, free,
and runs on every cron cycle without API costs. If you want to swap in an actual LLM (OpenAI/
Claude/Gemini) for the natural-language insight text, the integration point is
`AiInsightsService.generateInsights()`.

## Caching Strategy

- Class dashboard analytics: cached 10 minutes (`analytics:class:{id}`)
- LeetCode public profiles: cached 5 minutes (`leetcode:profile:{username}`)
- Leaderboards: cached 5 minutes (`leaderboard:{classId}:{period}`)
- Cache invalidation happens on enrollment changes (join/leave class)

## Real-Time Events (Socket.IO, namespace `/ws`)

| Event | Direction | Purpose |
|---|---|---|
| `join-class` / `leave-class` | client→server | Room management for class-wide broadcasts |
| `new-announcement` | server→client | Pushed when a teacher posts an announcement |
| `new-discussion-post` | server→client | Pushed to a discussion channel's room |
| `new-direct-message` | server→client | Pushed to the recipient's personal room |
| `notification` | server→client | Generic notification push (assignments, grades, etc.) |
| `join-session` / `raise-hand` | client→server | Live class room presence + raise-hand signal |
| `level-up` / `badges-earned` | server→client | Gamification celebration triggers |

## Security Layers

- **Transport**: Helmet (CSP, HSTS, etc.), CORS locked to `FRONTEND_URL`, compression
- **AuthN**: JWT (7-day access token, 30-day refresh), Google OAuth for identity
- **AuthZ**: `RolesGuard` + `@Roles()` decorator enforces Student/Teacher/Super Admin boundaries
  on every protected route
- **Validation**: `class-validator` DTOs on every POST/PATCH body, with whitelist mode (unknown
  fields rejected)
- **Rate limiting**: global Throttler (100 req/min/IP by default)
- **Audit**: `AuditService` available for logging sensitive admin actions (wire into controllers
  as needed)
