# Architecture

```text
Browser → same-origin Next.js routes on Cloudflare
        → x-internal-proxy-secret → Fastify API on Railway
          ├─ Linkup public search (8s timeout)
          ├─ structured generation boundary / deterministic fallback
          ├─ Convex internal mutations
          ├─ optional ElevenLabs and R2
          └─ private Railway network → optional Hermes VAR service
```

The browser never receives service credentials or calls Hermes. Public input is validated by Zod at each boundary. The API accepts generation calls only with a timing-safe proxy secret comparison. The fallback is deliberately marked low confidence and keeps the product usable during partner outages.

The local web store exists for zero-credential development only. Production must configure Convex before claiming durable cards or real leaderboard metrics.
