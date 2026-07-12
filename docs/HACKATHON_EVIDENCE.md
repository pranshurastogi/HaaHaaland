# Hackathon Evidence

All evidence must be real, timestamped, and reproducible.

## Capture checklist

- Cloudflare deployment URL and deployment ID
- Railway service/deployment ID and health response
- Convex deployment name and anonymized table counts
- Linkup request ID from a consented public generation
- PostHog funnel screenshot with internal/test users excluded
- ElevenLabs request/audio URL only if actually enabled
- Hermes build log and private VAR request trace only if P1 is enabled
- Wispr Flow export showing at least 500 dictated words (builder workflow evidence supplied by the operator)
- External posts/reactions/referrals with source URLs

No credentials, emails, private post text, fake accounts, synthetic traffic, duplicate events, or fabricated screenshots belong here.

## Verified local evidence — 2026-07-12

- `pnpm check`: passed formatting, ESLint, strict TypeScript, 48 unit/integration checks, secret scan, dependency audit, and production builds.
- `pnpm test:e2e`: six journeys passed across desktop Chromium and Pixel 7; Axe found no serious/critical WCAG A/AA violations.
- `opennextjs-cloudflare build`: produced `.open-next/worker.js` using compatibility date `2026-07-12`.
- Local Wrangler workerd preview reached ready state at `http://localhost:8787`; smoke checks passed `/`, `/api/leaderboard`, generation, public result, and deterministic SVG MIME/immutable caching.
- Fastify production bundle started successfully after workspace dependencies were bundled; unauthenticated route tests return `401` and authenticated generation tests return a six-stat card.
- No production URL, provider request, analytics receipt, external user, or metric is claimed. Convex/Railway/Cloudflare/R2 evidence remains blocked on owner authentication.
