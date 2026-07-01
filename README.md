# LeetTrack

**AI-Powered Student Progress Tracking & Learning Management Platform for DSA Classrooms**

LeetTrack lets teachers manage Python/DSA classes and track student LeetCode progress using
publicly available profile data — no passwords required. Students sign in with Google OAuth
and connect their LeetCode username; everything else (analytics, AI insights, assignments,
live classes, gamification) runs on top.

---

## 🏗️ Architecture

```
leettrack/
├── apps/
│   ├── api/          NestJS backend (REST API + WebSocket gateway)
│   └── web/          Next.js 15 frontend (App Router)
├── packages/
│   ├── database/     Shared Prisma schema reference
│   ├── ui/            (reserved for shared component library)
│   └── shared/        (reserved for shared types/utils)
├── infrastructure/
│   └── docker/        docker-compose.yml, Nginx config, init.sql
└── .github/workflows/ CI/CD pipeline
```

**Stack:** Next.js 15 · React 19 · NestJS · PostgreSQL · Prisma · Redis · Bull · Socket.IO · Tailwind

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites

- Node.js 20+
- Docker & Docker Compose (recommended), OR locally installed PostgreSQL 16 + Redis 7
- A Google Cloud OAuth Client (for sign-in) — see [Google OAuth Setup](#google-oauth-setup)
- (Optional) A [Resend](https://resend.com) API key for email sending

### 2. Clone & install

```bash
# Unzip the project, then from the root:
npm install
```

This installs dependencies for the root, `apps/api`, and `apps/web` workspaces.

### 3. Environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in at minimum:
- `JWT_SECRET` — any long random string
- `NEXTAUTH_SECRET` — any long random string
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `GOOGLE_CALLBACK_URL`

Each app also needs its own `.env` — copy the relevant values:

```bash
cp .env apps/api/.env
cp .env apps/web/.env.local
```

### 4. Start Postgres + Redis

**Option A — Docker (recommended):**
```bash
docker compose -f infrastructure/docker/docker-compose.yml up -d postgres redis
```

**Option B — local installs:** make sure Postgres is running on `5432` and Redis on `6379`,
matching the credentials in your `.env`.

### 5. Set up the database

```bash
cd apps/api
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed   # optional: loads demo teacher/students/class
cd ../..
```

The seed script creates:
- A demo teacher: `teacher@leettrack.dev`
- A demo class with join code `DEMO2024`
- 5 demo students with 30 days of mock LeetCode snapshot history

> Note: the seed script bypasses real Google OAuth (it inserts users directly), so it's for
> local testing of the dashboards only — you'll still sign in via Google for your own account.

### 6. Run the apps

In two terminals, from the project root:

```bash
# Terminal 1 — API (http://localhost:3001)
npm run dev --workspace=api

# Terminal 2 — Web (http://localhost:3000)
npm run dev --workspace=web
```

Or, using Turborepo to run both at once:
```bash
npm run dev
```

Visit **http://localhost:3000**. API docs (Swagger) are at **http://localhost:3001/api/docs**.

---

## 🔑 Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create an OAuth 2.0 Client ID (type: Web application)
3. Authorized redirect URI: `http://localhost:3001/api/v1/auth/google/callback`
4. Copy the Client ID and Secret into `.env` as `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`

For production, add your real domain's callback URL as an additional authorized redirect URI.

---

## 🐳 Full Docker Deployment

To run the **entire stack** (Postgres, Redis, API, Web, Nginx) in Docker:

```bash
docker compose -f infrastructure/docker/docker-compose.yml up -d --build
```

This builds and starts everything behind Nginx on port 80. Make sure `.env` is fully filled in
before running this (the compose file reads all variables from it).

To apply database migrations inside the running API container:
```bash
docker compose -f infrastructure/docker/docker-compose.yml exec api npx prisma migrate deploy
```

---

## 📦 Production Deployment (Vercel + Railway)

- **Frontend (`apps/web`)** → deploy to [Vercel](https://vercel.com). Set the root directory to
  `apps/web` and add the `NEXT_PUBLIC_API_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET` env vars.
- **Backend (`apps/api`)** → deploy to [Railway](https://railway.app) or any Docker host (AWS ECS,
  Fly.io, Render). Point it at a managed Postgres + Redis instance and set all backend env vars.
- The included GitHub Actions workflow (`.github/workflows/ci-cd.yml`) automates testing, Docker
  image builds, and deployment to both — just add the relevant secrets to your GitHub repo.

---

## 🧩 Key Features Implemented

| Module | Description |
|---|---|
| **Auth** | Google OAuth + JWT, role-based access (Student/Teacher/Super Admin) |
| **LeetCode Integration** | Public GraphQL API scraping, scheduled 6-hour sync via Bull queue, historical snapshots |
| **Analytics** | Class dashboards, difficulty distribution, growth charts, student tables |
| **AI Insights** | Performance scoring (0–100), risk detection (Healthy/Needs Attention/At Risk), predictions |
| **Assignments** | Create, submit, grade, auto-mark-missed cron |
| **Live Classes** | Jitsi Meet integration, attendance tracking, raise-hand via WebSocket |
| **Gamification** | XP, levels, badges, leaderboards (daily/weekly/monthly/semester) |
| **Communication** | Direct messages, discussion channels, announcements, email (Resend) |
| **Reports** | PDF (student progress), Excel (class analytics), CSV (attendance) export |
| **Security** | Helmet, rate limiting, RBAC guards, audit logging, input validation |

---

## 🗃️ Database Schema

See `packages/database/prisma/schema.prisma` (also copied to `apps/api/prisma/schema.prisma`)
for the full data model: Users, StudentProfile/TeacherProfile, Classes, Enrollments,
LeetcodeSnapshots, Assignments, LiveSessions, AttendanceRecords, Messages, Notifications,
Badges, LeaderboardEntries, AiInsights, and AuditLogs.

---

## 🧪 Testing

```bash
npm run test --workspace=api
```

CI runs lint, type-check, and tests against ephemeral Postgres/Redis containers on every push.

---

## 📄 License

MIT
