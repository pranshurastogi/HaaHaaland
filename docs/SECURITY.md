# Security

## Secret management

Secrets live only in Cloudflare Worker secrets, Railway variables, Convex deployment variables, or an approved secret manager. `.env`, `.dev.vars`, CLI state, and Hermes state are ignored. Run `pnpm security:secrets` before every commit. Rotate `INTERNAL_PROXY_SECRET` by adding the new value to Railway, updating Cloudflare, verifying requests, and then removing the old value; development and production use separate values.

## Controls

- Same-origin browser routes; Railway expects `X-HaaHaaLand-Proxy-Secret` and compares it timing-safely. Production generation fails closed with `503` when Railway is absent; the local fallback requires an explicit test/preview override.
- Zod boundaries, 32 KB bodies, upstream abort timeouts, request IDs, IP rate limiting, handle cooldowns, idempotency keys, and daily ceilings.
- External evidence is untrusted, length-limited, stripped of sensitive topics, and followed by a deterministic post-generation safety pass.
- CSP, HSTS, referrer policy, MIME sniffing prevention, frame denial, and restricted permissions are configured. Static Next.js bootstrapping currently requires CSP `script-src 'unsafe-inline'`; `unsafe-eval` is not allowed. A per-request nonce is the production hardening follow-up.
- “Fraud Risk” is always labelled as a football-meme hype-versus-output score, never an allegation.
- Hermes is disabled by default and has no public generic chat/tool endpoint.

## Data deletion

Until an authenticated admin tool is justified, deletion is an operator procedure: locate the opaque card slug in Convex, delete related card/generation/share/challenge records, remove the finalized R2 object if configured, and append a metadata-only audit record. Confirm the public card and image return 404. Never ask the requester for private post content. A documented request path appears on `/privacy`.

## Accepted hackathon limitations

Production Convex and R2 are not configured without owner credentials. Local in-memory state is non-durable and must not be represented as production persistence. Dynamic SVG/PNG routes are implemented, but a permanent public image URL requires deployed durable state/storage. Payment webhook verification is intentionally absent while payments are disabled. The dependency audit must remain free of high/critical findings; any lower accepted issue must be documented with package, reachability, and expiry.

## Reporting and incident response

Report privately to the repository owner with the route, impact, and reproduction—never a live secret. If exposure occurs: disable affected feature, rotate credentials, inspect Railway/Cloudflare/Convex audit logs, invalidate public assets if needed, notify affected users where appropriate, document scope, patch, and re-run `pnpm check` plus deployment smoke tests.
