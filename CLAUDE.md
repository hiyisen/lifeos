# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LifeOS — personal life management system for a single user. Record and track food, media (movies/TV/anime/documentaries/variety), games, books, expenses, and tasks. Full design doc at `DESIGN.md`.

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

## Common Commands

```bash
npm run dev          # Start dev server (with hot reload)
npm run build        # Production build
npm run preview      # Preview production build locally
npm run lint         # ESLint auto-fix
npm run format       # Prettier format
npm run typecheck    # TypeScript type checking (vue-tsc)
npm run check        # Full check: lint + format + typecheck
```

## Available Skills

| Skill | When to Use |
|-------|-------------|
| `simplify` | After completing a code change — review for reuse, quality, efficiency |
| `security-review` | Before deployment, after adding auth/sensitive data handling |
| `humanizer-zh` | When writing or polishing Chinese UI text (labels, placeholders, empty states) |
| `fewer-permission-prompts` | When permission prompts become repetitive during development |
| `update-config` | To configure project-level permissions or hooks in `.claude/settings.json` |
| `init` | Already used — regenerates this file when project structure changes significantly |
| `git-smart-commit` | When user says "commit" / "提交" — analyze changes, generate conventional commit, stage & commit |

## Available MCPs

| MCP | Use |
|-----|-----|
| `mcp__notion__*` | Optional: sync data to Notion for backup, or import from Notion databases |

## File Structure (conceptual)

```
pages/          → Vue pages (Nuxt file-based routing)
server/api/     → API routes (Nitro) — one subfolder per module
server/utils/   → db.ts (better-sqlite3 wrapper), dict.ts, photo.ts
server/services/→ tmdb.ts, douban.ts, igdb.ts (external API wrappers)
components/     → Vue components organized by module
composables/    → useTheme, useDict, useApi, useExport, useSearch
data/           → lifeos.db + photos/ (git ignored)
```

## Module Table Reference

| Module | Table | API Prefix | External Search |
|--------|-------|-----------|-----------------|
| Food | `foods` | `/api/foods` | — |
| Media | `media` | `/api/media` | TMDB |
| Games | `games` | `/api/games` | IGDB |
| Books | `books` | `/api/books` | OpenLibrary |
| Expenses | `expenses` | `/api/expenses` | — |
| Tasks | `tasks` | `/api/tasks` | — |
| Dicts | `dict_categories`, `dict_items` | `/api/dict` | — |
| Stats | (aggregated) | `/api/stats` | — |
| Export | (all) | `/api/export` | — |
