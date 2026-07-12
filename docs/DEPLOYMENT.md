# Deployment

## Cloudflare web

1. Authenticate Wrangler without pasting credentials into files.
2. Configure public build variables and Worker secrets from `apps/web/.env.example`.
3. Set `RAILWAY_API_URL` and `INTERNAL_PROXY_SECRET` as private Worker variables.
4. Run `pnpm --filter @haahaaland/web deploy`.
5. Run `node scripts/smoke-test.mjs https://your-web-host`.

## Railway API

1. Create a service from this repository using `railway.json`.
2. Configure `apps/api/.env.example`; `INTERNAL_PROXY_SECRET` must match Cloudflare.
3. Do not assign a public domain to `services/hermes`.
4. Verify `/health`, then authenticated generation through the web proxy.

## Convex

Run `pnpm convex dev` for a development deployment and `pnpm convex deploy` for production after authenticating. Backend-only writes use internal functions.

## Release gates

`pnpm verify`, desktop/mobile Playwright, secret scan, generated PNG download, save/challenge flow, actual Linkup request, durable result reload, analytics receipt, and `scripts/verify-deployment.mjs` must pass. Credentials/account activation and public launch are owner actions.
