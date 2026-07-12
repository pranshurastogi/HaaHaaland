# Deployment

Production order: Convex → Railway API → optional private Hermes → Cloudflare Worker → smoke verification. Never deploy from unverified local state.

## Convex

1. Authenticate with `pnpm exec convex dev`, select the intended project, and review generated files.
2. Deploy the schema/functions with `pnpm exec convex deploy`.
3. Configure deployment variables without printing values. Backend credit/payment/moderation writes remain internal functions.
4. Record the deployment name and verify card, challenge, and idempotent credit paths in the dashboard.

## Railway API

Use the repository root. `railway.json` builds `@haahaaland/api`; the multi-stage root `Dockerfile` is the reproducible alternative. Build: `pnpm install --frozen-lockfile && pnpm --filter @haahaaland/api build`. Start: `pnpm --filter @haahaaland/api start`. The process binds `0.0.0.0:$PORT`, handles SIGTERM, and exposes unauthenticated minimal `/health` and `/ready` checks. Configure `apps/api/.env.example`, including exact `FRONTEND_URL`, ceilings, flags, and a generated production proxy secret.

## Private Hermes VAR service

Create a separate Railway service with no public domain. Bind `0.0.0.0:8642`, require bearer authentication, use private networking (prefer a Railway-provided service URL variable over a hardcoded host), restrict tools, and add a volume only if runtime memory is enabled. Keep `FEATURE_HERMES_VAR=false` and `HERMES_RUNTIME_ENABLED=false` until authentication, timeout, circuit breaker, and no-tool-exposure tests pass.

## Cloudflare Worker

1. Run `pnpm --filter @haahaaland/web run preview` and smoke the workerd URL.
2. Authenticate Wrangler and create Worker secrets for `RAILWAY_API_URL` and `INTERNAL_PROXY_SECRET`; never use `NEXT_PUBLIC_` for either. Keep `LOCAL_FALLBACK_ENABLED=false` in production.
3. Configure the public app/Convex/PostHog identifiers.
4. Deploy with `pnpm --filter @haahaaland/web run deploy`.
5. Add a custom domain in Workers & Pages, update `NEXT_PUBLIC_APP_URL`, redeploy, and verify canonical/OG URLs.

## R2 finalized cards

Create a private-write bucket and public read domain. Configure server-only credentials from `apps/api/.env.example`. Use only server-derived content-addressed/opaque keys, `image/png`, and `Cache-Control: public,max-age=31536000,immutable`. Never accept arbitrary client object keys. The current dynamic SVG and Open Graph PNG are functional fallbacks; production acceptance remains blocked until a finalized image is stored and anonymously fetched with correct MIME/cache headers.

## Verification

Run `pnpm install --frozen-lockfile`, `pnpm check`, E2E, then `node scripts/verify-deployment.mjs <web-url> <api-url>`. Verify `/health`, `/ready`, missing proxy secret → 401, same-origin generation, public card reload, SVG/OG image MIME/cache, save, challenge acceptance, one-time referral credit, analytics receipt, and optional-provider failure states.

## Rollback

Rollback Cloudflare to the previous Worker deployment, Railway to the previous successful deployment/image, and Convex functions to the matching commit. Do not roll back schema incompatibly. Disable affected feature flags first, preserve audit evidence, and rerun smoke checks.
