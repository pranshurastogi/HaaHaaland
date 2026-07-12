# Security

- Secrets are server-only, excluded by `.gitignore`, and scanned with `pnpm security:secrets`.
- `NEXT_PUBLIC_*` is limited to non-secret app, Convex client, and analytics identifiers.
- Fastify uses request IDs, Helmet, body limits, rate limiting, explicit external timeouts, and timing-safe proxy authentication.
- Handles, email, manual excerpts, generated output, and URLs are Zod validated.
- Logs must redact keys containing token, secret, password, authorization, cookie, api_key, or apikey. No environment values are logged.
- External evidence is untrusted data. It cannot request tools, files, secrets, network access, or policy changes.
- Public cards minimize stored personal data; source snippets should expire with research cache policy.
- Hermes is optional/private and never exposes terminal, filesystem, or unrestricted chat tools.

Run secret scanning before every commit. Rotate a credential immediately if a real value is ever staged.
