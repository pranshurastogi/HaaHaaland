# HaaHaaLand

**Your timeline, scouted. Your ego, benched.**

HaaHaaLand is an AI football scouting ground that analyses a user’s public online presence, matches it against a curated football-player archetype, and creates a safe, confidence-aware card to download, share, and challenge.

> Screenshot placeholders: capture the desktop landing page, mobile result card, challenge teaser, and battle result after the production URL is live. Do not fabricate deployment screenshots.

## Architecture

```text
Browser
  → same-origin Next.js/OpenNext Worker routes on Cloudflare
  → X-HaaHaaLand-Proxy-Secret
  → Fastify API on Railway
      ├─ Linkup public research
      ├─ structured LLM generation + deterministic safety pass
      ├─ Convex durable cards/referrals/challenges/credits
      ├─ optional R2 finalized images and ElevenLabs audio
      └─ private Railway networking → optional restricted Hermes VAR service
```

The browser never calls Hermes, Linkup, OpenAI, Convex backend mutations, Railway, or R2 write APIs directly. The zero-credential local development flow uses an explicitly marked, low-confidence deterministic fallback. Production returns `503` unless Railway is configured; `LOCAL_FALLBACK_ENABLED` is test/local-preview only and defaults off.

## Prerequisites

- Node.js >=20.9 (CI and Docker use Node 24)
- Corepack
- pnpm 10.15.1
- Chromium for Playwright
- Optional authenticated Convex, Railway, and Wrangler CLIs for deployment

## Install and run

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

Open http://127.0.0.1:3000. Copy only the required service example file to a local ignored environment file. Never commit `.env`, `.dev.vars`, CLI state, or credentials.

Environment contracts:

- `apps/web/.env.example`
- `apps/api/.env.example`
- `services/hermes/.env.example`

## Quality commands

```bash
pnpm format
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test:unit
pnpm test:integration
pnpm test:e2e
pnpm security:secrets
pnpm security:audit
pnpm build
pnpm check
```

Cloudflare runtime preview:

```bash
pnpm --filter @haahaaland/web run preview
```

## Product safety

Only public posting, professional persona, product execution, communication style, visible interests, and public football opinions are roastable. Sensitive traits and private conduct are removed from evidence. A deterministic pass rewrites prohibited allegations and downgrades low-confidence intensity. “Fraud Risk” is a football-meme score about online hype versus visible public output—not financial or criminal fraud.

## Deployment

See `docs/DEPLOYMENT.md` for Convex, Railway, private Hermes, Cloudflare, R2, custom-domain, verification, and rollback steps. Public deployment remains an owner credential action. GitHub Actions never receives production secrets on pull requests.

## Hackathon partners

- Hermes Agent: coding partner; optional private P1 VAR runtime
- Linkup: public profile research
- Convex: intended durable cards, referrals, challenges, credits, and leaderboard
- Cloudflare: OpenNext Worker, security boundary, and optional R2
- ElevenLabs: disabled optional stadium audio
- Wispr Flow: builder-workflow evidence only
- Dodo Payments: disabled until a real checkout and signed webhook can be tested

## Security reporting

Report vulnerabilities privately to the repository owner. Do not open an issue containing credentials, private evidence, emails, or exploitable production details. See `docs/SECURITY.md` and `docs/THREAT_MODEL.md`.

## Known limitations

- Convex, Railway, Cloudflare production, and R2 require owner authentication and are not claimed as deployed.
- Local state is intentionally in memory and non-durable.
- Dynamic SVG and Open Graph PNG rendering exist; persistent finalized card storage still requires R2 or an equivalent verified service.
- Hermes VAR, audio, Startup XI, and payments remain server-disabled until deployed P0 passes smoke tests.

Apache-2.0 licensed.
