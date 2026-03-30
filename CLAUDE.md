# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Spotify Wedding** — A private wedding song request web app. Guests scan a QR code, search for songs, and submit requests. The admin (groom/bride) moderates requests and controls the Spotify queue. Built on Nuxt 4 + Nuxt UI v4. German-language target (`lang="de"`).

## Commands

```bash
pnpm install          # Install dependencies
pnpm dev              # Dev server on http://localhost:3000
pnpm build            # Production build (node-server preset)
pnpm preview          # Preview production build
pnpm lint             # Run ESLint
pnpm lint:fix         # Run ESLint with auto-fix
pnpm typecheck        # Type-check (runs nuxt prepare first)
```

## Architecture

### Frontend
- **Nuxt 4** with `app/` directory structure
- **Nuxt UI v4** — all UI built with `<U*>` components
- **Pinia** for state management
- **@vueuse/core** for utilities (debounce, interval polling)
- Mobile-first guest page, desktop-friendly admin dashboard

### Backend
- **Nitro server routes** in `server/api/`
- **Drizzle ORM + better-sqlite3** for data persistence (SQLite with WAL mode)
- **Spotify Web API** integration via `server/utils/spotify.ts`
- All Spotify tokens stored server-side only, never exposed to client

### Key Directories
- `app/pages/` — Guest page (`index.vue`), Admin (`admin/index.vue`, `admin/login.vue`)
- `app/components/guest/` — NowPlaying, QueueList, SongSearch
- `app/components/admin/` — RequestList, SpotifyStatus
- `app/composables/` — useNowPlaying, useSpotifyQueue, useSongSearch, useSongRequest, useAdminAuth
- `app/middleware/admin.ts` — Client-side admin route guard
- `server/api/spotify/` — Search, now-playing, queue, devices
- `server/api/requests/` — CRUD for song requests
- `server/api/admin/` — Login, session, queue management, settings
- `server/api/auth/spotify/` — OAuth connect/callback/status
- `server/utils/` — db.ts (Drizzle instance), spotify.ts (API client), auth.ts (session management)
- `server/db/schema.ts` — Drizzle schema (songRequests, spotifyTokens, appSettings)
- `server/middleware/` — adminAuth.ts, rateLimit.ts
- `server/plugins/migrations.ts` — Auto-create tables on startup

## Environment Variables

Set in `.env` (see `.env.example`):
- `NUXT_SPOTIFY_CLIENT_ID` — Spotify app client ID
- `NUXT_SPOTIFY_CLIENT_SECRET` — Spotify app client secret
- `NUXT_SPOTIFY_REDIRECT_URI` — OAuth callback URL
- `NUXT_ADMIN_PASSWORD` — Admin login password
- `NUXT_DATABASE_PATH` — SQLite file path (default: `.data/db.sqlite`)
- `NUXT_PUBLIC_BASE_URL` — Public base URL

## Styling

- Tailwind CSS v4 via `@import 'tailwindcss'` and `@import '@nuxt/ui'` in `app/assets/css/main.css`
- Theme tokens in `@theme static` block in `main.css`
- UI colors in `app/app.config.ts` (primary: green, secondary: slate, neutral: neutral)
- All design overrides centralized in `app.config.ts` for easy Stitch design integration later

## Code Style & Linting

- **Always run `pnpm lint:fix` first** when encountering lint errors
- ESLint with **@antfu/eslint-config** via `@nuxt/eslint`
- 2-space indent, single quotes, semicolons
- `type` keyword preferred over `interface`
- Direct `process.env` access disallowed — use `useRuntimeConfig()`
- YAML and JSON keys must be sorted alphabetically

## Key Design Decisions

- **Plain password comparison** for admin (private event tool, not public service)
- **In-memory session store** (single-process, Raspberry Pi deployment)
- **SQLite** for simplicity and Pi compatibility (no external DB needed)
- **Polling** for real-time updates (configurable intervals in runtimeConfig)
- **Server-side only** Spotify operations (no client-side token exposure)
- **Request moderation** by default (admin approves before queue)

## Git Hooks

- **Husky** pre-commit hook runs **lint-staged** on `*.{js,ts,mjs,cjs,vue}` files
