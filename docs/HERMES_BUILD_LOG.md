# Hermes Build Log

This file records verifiable use of Hermes Agent as the coding partner. It contains no prompts, credentials, hidden chain-of-thought, or secret values.

## 2026-07-12

- Inspected the repository before edits: working directory, clean Git status, tracked files, and tool versions.
- Identified a command-name collision: `/usr/local/bin/hermes` is the IBC relayer, so `hermes status` cannot report Nous Hermes Agent status.
- Loaded the Hermes Agent, test-driven-development, and product design skills.
- Consulted official OpenNext Cloudflare and Convex documentation and current npm package metadata before configuration.
- Began a security-first pnpm/TypeScript monorepo implementation using the active Hermes Agent tool session.
- Implemented and exercised RED→GREEN tests for shared validation, SSRF defenses, curated archetypes, API authentication, and fallback generation.
- Built the complete local landing → generation → result → share/challenge/save journey and verified it in Chromium at desktop and Pixel 7 viewports.
- Ran secret scanning, ESLint, strict TypeScript, 27 Vitest checks, two Playwright journeys, Next.js/Fastify production builds, OpenNext Cloudflare bundling, and production-mode HTTP smoke tests.
- Inspected deployment authentication without reading credentials: GitHub is authenticated; Cloudflare Wrangler and Railway are not authenticated, so no public deployment was fabricated or attempted.
- Re-audited requirements with three independent Hermes subagents covering API/security, Convex/referrals, and card/sharing/deployment concerns; incorporated current findings and marked stale baseline findings resolved.
- Added deterministic evidence/card safety, typed analytics and errors, fail-closed production fallback behavior, bounded/versioned research caching, HTTP(S)-only evidence URLs, and provider injection seams.
- Added versioned Fastify routes, idempotency/cooldown/daily ceilings, structured logs with redaction, graceful shutdown, production Docker/tsup bundling, challenge acceptance, and referral abuse checks.
- Added deterministic 1080×1080 SVG, 1200×630 Open Graph rendering, dynamic metadata, share/copy/download/challenge/VAR actions, privacy UX, CSP, reduced motion, keyboard focus, and Axe checks.
- Verified the current tree with `pnpm check`: formatting, ESLint, strict TypeScript, 48 unit/integration checks, a 97-file secret scan, zero known production dependency vulnerabilities, and production API/Next builds.
- Verified six production-mode Playwright journeys across desktop Chromium and Pixel 7, including email save, challenge teaser, public image MIME/cache, validation, keyboard navigation, and serious/critical accessibility checks.
- Built and smoke-tested the OpenNext workerd preview at `localhost:8787`; landing, leaderboard, generation, public result, and deterministic image routes returned expected responses before intentional SIGTERM cleanup.
