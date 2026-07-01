# API Documentation

LeetTrack's REST API is fully documented via **Swagger/OpenAPI**, auto-generated from the
NestJS controllers' decorators.

Once the API is running, visit:

```
http://localhost:3001/api/docs
```

This gives you an interactive, always-up-to-date reference for every endpoint, including
request/response schemas, required roles, and a "Try it out" console (you'll need to paste a
valid JWT into the "Authorize" button first — obtain one by signing in via the web app and
checking the Network tab, or by hitting `GET /api/v1/auth/google` in a browser).

## Base URL

```
http://localhost:3001/api/v1
```

## Authentication

All endpoints except `GET /auth/google` and `GET /auth/google/callback` require:

```
Authorization: Bearer <accessToken>
```

## Endpoint Groups

| Tag | Base Path | Description |
|---|---|---|
| `auth` | `/auth` | Google OAuth, current user, LeetCode connection |
| `classes` | `/classes` | CRUD, join/leave, student roster |
| `leetcode` | `/leetcode` | Public profile fetch, growth metrics, manual sync |
| `analytics` | `/analytics` | Class dashboard data, per-student detail |
| `ai-insights` | `/ai-insights` | Risk scoring, class-wide summary |
| `assignments` | `/assignments` | Create, list, submit, grade |
| `live-sessions` | `/live-sessions` | Schedule, start/end, join/leave (Jitsi) |
| `gamification` | `/gamification` | Badge checks, leaderboard refresh |
| `leaderboard` | `/leaderboard` | Read-only leaderboard by period |
| `messages` / discussions / announcements | `/messages`, `/discussions`, `/announcements` | DMs, channels, class-wide posts |
| `email` | `/email` | Single + bulk email sending (teacher-only) |
| `reports` | `/reports` | PDF/Excel/CSV export |
| `notifications` | `/notifications` | List, mark read |
| `users` | `/users` | Super-admin user management |
| `audit` | `/audit` | Super-admin audit log viewer |

For full request/response shapes, always defer to the live Swagger UI — it's generated
directly from the DTOs and decorators, so it can never drift out of sync with the code.
