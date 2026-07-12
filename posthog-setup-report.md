<wizard-report>
# PostHog post-wizard report

The wizard has completed a server-side PostHog integration for the HaaHaaland Fastify API. A singleton `posthog-node` client is initialised from environment variables in `apps/api/src/app.ts` and shared across all route handlers. Seven business-critical events are now captured across the scouting, saving, sharing, and challenge flows. The Fastify error handler captures unexpected 500 errors via `captureException`, and the graceful shutdown path calls `posthog.shutdown()` so no buffered events are dropped on process exit. Flush calls after each handler ensure events are sent even in short-lived serverless-style invocations.

| Event                  | Description                                                                          | File                  |
| ---------------------- | ------------------------------------------------------------------------------------ | --------------------- |
| `generation_started`   | A profile scouting request passed rate limiting and research has begun               | `apps/api/src/app.ts` |
| `research_completed`   | The research stage for a profile finished, including cache hits and error categories | `apps/api/src/app.ts` |
| `generation_completed` | A scout card has been generated and stored successfully                              | `apps/api/src/app.ts` |
| `email_saved`          | A user saved their scout card by providing an email address                          | `apps/api/src/app.ts` |
| `share_recorded`       | A share event was recorded for a specific channel (x, whatsapp, copy, download)      | `apps/api/src/app.ts` |
| `challenge_created`    | A user created a new challenge from their scout card                                 | `apps/api/src/app.ts` |
| `challenge_accepted`   | A challenge was accepted and a winner has been determined                            | `apps/api/src/app.ts` |

## Next steps

We've built a dashboard and five insights to monitor user behaviour:

- **Dashboard**: [Analytics basics (wizard)](https://us.posthog.com/project/508646/dashboard/1835483)
- **Scouting funnel** – generation_started → generation_completed → email_saved: [https://us.posthog.com/project/508646/insights/yasdyJL9](https://us.posthog.com/project/508646/insights/yasdyJL9)
- **Daily generations** – started vs completed trend: [https://us.posthog.com/project/508646/insights/P16Wabm9](https://us.posthog.com/project/508646/insights/P16Wabm9)
- **Share channel breakdown** – x / whatsapp / copy / download split: [https://us.posthog.com/project/508646/insights/5BkiR6MI](https://us.posthog.com/project/508646/insights/5BkiR6MI)
- **Challenge engagement** – challenge_created vs challenge_accepted: [https://us.posthog.com/project/508646/insights/gU8gG4bN](https://us.posthog.com/project/508646/insights/gU8gG4bN)
- **Generation model breakdown** – AI model vs deterministic fallback split: [https://us.posthog.com/project/508646/insights/SRUZmF9D](https://us.posthog.com/project/508646/insights/SRUZmF9D)

## Verify before merging

- [ ] Run a full production build (`pnpm build`) and fix any lint or type errors introduced by the generated code.
- [ ] Run the test suite (`pnpm test`) — call sites that were rewritten or instrumented may need updated mocks or fixtures.
- [ ] Add `POSTHOG_API_KEY` and `POSTHOG_HOST` to `apps/api/.env.example` (they are already present in the example file, but confirm the values are documented for collaborators).

### Agent skill

We've left an agent skill folder in your project at `.claude/skills/integration-javascript_node/`. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.
</wizard-report>
