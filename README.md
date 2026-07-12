# HaaHaaLand

**Your timeline, scouted. Your ego, benched.**

HaaHaaLand is an AI football scouting ground that analyses a user’s public online presence, matches it with a curated football-player archetype, and creates a playful, shareable scout card.

## Quick start

Requirements: Node.js >=20.9 and pnpm 10.

```bash
pnpm install
pnpm security:secrets
pnpm dev
```

Open http://localhost:3000. The free core loop works without third-party credentials using an explicitly labelled low-confidence deterministic fallback. Add only the variables you need from the service `.env.example` files; never commit `.env` files.

## Commands

- `pnpm dev` — web and API development servers
- `pnpm test` — Vitest suites
- `pnpm test:e2e` — Playwright desktop and mobile journey
- `pnpm typecheck`, `pnpm lint`, `pnpm format`
- `pnpm security:secrets` — redacted secret-pattern scan
- `pnpm verify` — complete local gate

## Structure

- `apps/web` — Next.js 16 App Router, OpenNext/Cloudflare
- `apps/api` — authenticated Fastify API for Railway
- `packages/shared` — Zod boundary schemas
- `packages/archetypes` — 24 curated, versioned archetypes
- `convex` — durable application state schema/functions
- `services/hermes` — optional private P1 VAR runtime boundary

See `docs/DEPLOYMENT.md` before deploying. Apache-2.0 licensed.
