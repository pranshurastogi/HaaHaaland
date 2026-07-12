# HaaHaaLand Build Tasks

Updated: 2026-07-12

## Demo-ready P0 status

- [x] Working local/demo build with deterministic fallback
- [x] Core generation, cards, sharing, and challenges
- [x] Format, lint, typecheck, unit/integration tests, and production build
- [x] Git review and release commit
- [ ] Durable Convex persistence deferred
- [ ] Production deployment deferred pending credentials
- [ ] Hermes VAR, ElevenLabs, Startup XI, and payments deferred

## Phase 0 — Secure initialization

- [x] Inspect environment and repository
- [x] Secure `.gitignore` and example environment contracts
- [x] pnpm/TypeScript monorepo, formatting, linting, tests, secret scan
- [x] Initial product, architecture, security, deployment, and evidence docs

## Phase 1 — Shared contracts

- [x] X handle and product URL validation
- [x] Scout-card schema and curated archetype IDs
- [x] Instagram normalization and common API error contract
- [x] Safety constants, deterministic safety pass, event names, feature flags
- [x] Email normalization and referral/challenge contracts

## Phase 2 — Convex state

- [x] Initial schema and card query/internal mutation
- [x] Production-shaped entities and query-path indexes
- [ ] Idempotent referral credit and challenge transitions (implemented in API/Convex functions; runtime wiring remains)
- [ ] Generation/card persistence adapter and fixtures

## Phase 3 — Research service

- [x] Linkup integration, timeout, confidence, evidence limits, cache
- [x] Provider interface and deterministic mock
- [x] Sensitive-evidence exclusion and observable cache/error categories

## Phase 4 — Generation engine

- [x] Structured JSON, Zod validation, repair retry, safe fallback
- [x] Prompt-injection framing
- [x] Deterministic post-generation safety pass and intensity downgrade
- [x] Provider budget and generation ceiling

## Phase 5 — Frontend vertical slice

- [x] Landing, example card, form, loading, result, errors, mobile flow
- [x] Complete accessibility states and automated accessibility check
- [x] Honest feature-flag behavior for unavailable integrations

## Phase 6 — Persistent result and sharing

- [x] Result route, X/WhatsApp share, client PNG fallback, email save UI
- [x] Deterministic SVG and 1080×1080 card representation
- [ ] Persistent storage adapter/stable HTTPS image URL
- [x] Dynamic Open Graph metadata and 1200×630 preview
- [x] Copy-result link and public-card caching policy

## Phase 7 — Referrals and challenges

- [x] Opaque challenge creation and landing teaser
- [x] Challenge acceptance, deterministic head-to-head result, completion
- [ ] Qualified referral attribution and idempotent one-time credit (durable runtime wiring remains)
- [x] Configurable first unlock and abuse controls

## Phase 8 — Deployment

- [x] OpenNext/Wrangler and Railway configuration
- [x] Local production and OpenNext builds
- [x] Cloudflare runtime preview smoke
- [ ] Convex production deployment (blocked on account credentials)
- [ ] Railway API deployment (blocked on account credentials)
- [ ] Cloudflare production deployment (blocked on account credentials)
- [ ] Live production smoke and stable asset verification

## Phase 9 — Optional integrations

- [ ] Hermes VAR review — keep disabled until deployed P0 works
- [ ] ElevenLabs audio — keep disabled until deployed P0 works
- [ ] Startup XI — keep disabled until deployed P0 works
- [ ] Dodo Payments — keep disabled until live checkout is activated and tested

## Final gate

- [x] Format (`pnpm run format`)
- [x] Lint (`pnpm run lint`)
- [x] Typecheck (`pnpm run typecheck`)
- [x] Unit and integration tests (`pnpm run test`)
- [x] Local production build (`pnpm run build`)
- [x] Secret scan and dependency audit
- [x] Earlier Cloudflare preview, API smoke, mobile E2E, and accessibility checks
- [x] Git review and clean local release commit
- [ ] Push and CI verification deferred; no remote action requested
