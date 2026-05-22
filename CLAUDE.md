# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LifeOS — personal life management system for a single user. Record and track food, media (movies/TV/anime/documentaries/variety), games, books, expenses, and tasks. Original design spec at `DESIGN.md`, current-state spec at `PRD.md` (Phase 3 snapshot).

## Tech Stack

- **Framework**: Nuxt 3 (Vue 3 full-stack, SSR + Server Routes, monolithic deployment)
- **Runtime**: Node.js ≥20 LTS
- **Database**: SQLite via `better-sqlite3` (single file at `data/lifeos.db`)
- **Styling**: Tailwind CSS v4 via `@tailwindcss/vite` plugin (dark mode via `class` strategy)
- **Animation**: GSAP + VueUse Motion + canvas-confetti
- **Charts**: ECharts 5.x
- **Icons**: Lucide Vue
- **Deployment**: Node.js process behind Caddy/Nginx, managed by PM2/systemd

## Key Architecture Decisions

- **No separate backend** — server logic lives in `server/api/` (Nitro routes), called from Vue pages
- **All enumerable values in dict tables** — `dict_categories` + `dict_items` manage all dropdowns (cuisine tags, media types, platforms, expense categories, etc.). Built-in items (`is_builtin=1`) cannot be deleted; users can add custom items
- **Ratings are 1-10 across all modules** — unified scale for cross-module stats
- **Photos stored locally** — paths stored as relative in DB, files under `data/photos/{module}/`
- **External API for autocomplete only** — TMDB (media), OpenLibrary (books), IGDB (games). All optional — manual entry always works. API keys in `.env`
- **Response format**: `{ success: bool, data: T, meta?: { total, page }, error?: string }`
- **DB auto-initializes on startup** — `server/plugins/init-db.ts` creates all tables and seeds dict data. No migration tool needed
- **Search data sources**: Douban scraping (cheerio, primary) → TMDB (fallback for media). OpenLibrary for books. IGDB for games. All cached in `search_cache` table for 24h
- **Theme via CSS custom properties**: `var(--color-bg)`, `var(--color-surface)`, `var(--color-text)`, `var(--color-text-secondary)`, `var(--color-border)` — switch between light/dark in `assets/css/main.css`. Anti-flicker inline script in `nuxt.config.ts` sets `dark` class before first paint

### Image Pipeline (three-part)

1. **`composables/useImageProxy.ts`** — `proxyUrl()` rewrites external URLs to `/api/image-proxy?url=...`, `thumbnailUrl()` appends `_thumb` suffix for local photos
2. **`server/api/image-proxy.get.ts`** — proxies Douban images with referrer spoofing (whitelist-domain restricted)
3. **`server/routes/photos/[...path].ts`** — serves local photos; auto-generates `_thumb` variants via `sharp` on first request (400px, jpeg 75%)

### Toast notification system

`useToast()` composable provides reactive `toasts` array + `success()/error()/info()` methods. `ToastContainer` component in layout renders them. Auto-dismiss after 3s.

### Layout

`layouts/default.vue` — desktop sidebar (`AppSidebar`) + mobile bottom tab bar (`AppBottomTab`), switched by `useMediaQuery('(max-width: 767px)')`. Content rendered via `<NuxtPage />` inside `<main>`.

## Common Commands

```bash
npm run dev          # Start dev server (with hot reload)
npm run build        # Production build
npm run preview      # Preview production build locally
npm run lint         # ESLint auto-fix
npm run format       # Prettier format
npm run typecheck    # TypeScript type checking (vue-tsc)
npm run check        # Full check: lint + format + typecheck

# Docker deployment
docker compose up -d     # Start production container (data/ mounted as volume)
docker compose build     # Rebuild after code changes
```

### Environment Variables

All in `.env` (copy from `.env.example`):
- `NUXT_DB_PATH` — SQLite database file path (default `./data/lifeos.db`)
- `NUXT_PHOTOS_DIR` — local photo storage directory (default `./data/photos`)
- `TMDB_API_KEY` — optional, TMDB search fallback
- `IGDB_CLIENT_ID` / `IGDB_CLIENT_SECRET` — optional, IGDB game search
- `NUXT_HOST` / `NUXT_PORT` — deployment listen address

## Available Skills

### 开发高频

| Skill              | When to Use                                                                                                        |
| ------------------ | ------------------------------------------------------------------------------------------------------------------ |
| `frontend-design`  | Building any UI page or component — creates distinctive, production-grade design that avoids generic AI aesthetics |
| `simplify`         | After completing a code change — review for reuse, quality, efficiency                                             |
| `git-smart-commit` | When user says "commit" / "提交" — analyze changes, generate conventional commit, stage & commit                   |
| `security-review`  | Before deployment, after adding sensitive data handling                                                            |

### 场景化使用

| Skill             | When to Use                                                               |
| ----------------- | ------------------------------------------------------------------------- |
| `humanizer-zh`    | Writing or polishing Chinese UI text (labels, placeholders, empty states) |

### 工具类

| Skill                      | When to Use                                                               |
| -------------------------- | ------------------------------------------------------------------------- |
| `fewer-permission-prompts` | When permission prompts become repetitive during development              |
| `skill-creator`            | Improving the `git-smart-commit` custom skill                             |
| `update-config`            | Configuring project-level permissions or hooks in `.claude/settings.json` |
| `init`                     | Regenerating this file when project structure changes significantly       |

## Available MCPs

| MCP              | Use                                                                       |
| ---------------- | ------------------------------------------------------------------------- |
| `mcp__notion__*` | Optional: sync data to Notion for backup, or import from Notion databases |

## File Structure (conceptual)

```
pages/             → Vue pages (Nuxt file-based routing)
layouts/           → default.vue (responsive sidebar + tab bar layout)
server/api/        → REST API routes (Nitro) — auto-prefixed with /api/
server/routes/     → Raw request handlers — e.g., photos/[...path].ts for image serving
server/plugins/    → init-db.ts (startup: CREATE TABLE IF NOT EXISTS + seed data)
server/utils/      → db.ts, dict.ts, photo.ts, cache.ts
server/services/   → douban.ts (cheerio scraping), tmdb.ts, openlibrary.ts, igdb.ts
components/        → Vue components organized by module + common/ + layout/
composables/       → useTheme, useDict, useApi, useToast, useImageProxy, useSearch
data/              → lifeos.db + photos/ (git ignored)
```

## Module Table Reference

| Module   | Table                           | API Prefix      | External Search |
| -------- | ------------------------------- | --------------- | --------------- |
| Food     | `foods`                         | `/api/foods`    | —               |
| Media    | `media`                         | `/api/media`    | Douban (primary) → TMDB (fallback) |
| Games    | `games`                         | `/api/games`    | IGDB                                |
| Books    | `books`                         | `/api/books`    | Douban (primary) → OpenLibrary     |
| Expenses | `expenses`                      | `/api/expenses` | —               |
| Tasks    | `tasks`                         | `/api/tasks`    | —               |
| Dicts    | `dict_categories`, `dict_items` | `/api/dict`     | —               |
| Stats    | (aggregated)                    | `/api/stats`    | —               |
| Export   | (all)                           | `/api/export`   | —               |
