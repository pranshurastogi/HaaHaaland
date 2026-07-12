# Analytics

PostHog is the planned launch provider. The browser sends only the public project key and a random anonymous ID. The API key, research text, email, prompts, and credentials are never analytics properties.

| Event                            | Trigger                               | Safe properties             | Conversion role      |
| -------------------------------- | ------------------------------------- | --------------------------- | -------------------- |
| `landing_view`                   | Landing component mounts              | referral presence           | visit                |
| `example_card_view`              | Example card is visible               | none                        | education            |
| `username_input_started`         | X field receives focus                | none                        | intent               |
| `username_submitted`             | Valid browser submission starts       | referral presence           | funnel               |
| `research_started`               | Same-origin generation request starts | none                        | diagnostic           |
| `research_cache_hit`             | API uses cached public research       | provider, confidence bucket | cost/latency         |
| `research_completed`             | Evidence packet is ready              | confidence bucket           | funnel               |
| `research_low_confidence`        | Confidence is below 40                | confidence bucket           | quality              |
| `research_failed`                | Research fails safely                 | error code                  | reliability          |
| `generation_started`             | Generation begins                     | feature flag                | funnel               |
| `generation_completed`           | Valid safe card returns               | confidence bucket, fallback | funnel               |
| `generation_failed`              | Generation returns an error           | safe error category         | reliability          |
| `result_viewed`                  | Card result renders                   | card ID, confidence bucket  | activation component |
| `email_prompt_viewed`            | Save panel renders                    | card ID                     | activation funnel    |
| `email_saved`                    | Save succeeds                         | card ID                     | activation component |
| `activation_completed`           | Result viewed plus save/challenge     | card ID                     | primary metric       |
| `download_clicked`               | PNG fallback starts                   | card ID                     | sharing              |
| `share_x_clicked`                | X intent opens                        | card ID                     | sharing              |
| `share_whatsapp_clicked`         | WhatsApp intent opens                 | card ID                     | sharing              |
| `copy_link_clicked`              | Result URL copied                     | card ID                     | sharing              |
| `challenge_created`              | Opaque challenge is stored            | card ID                     | referral funnel      |
| `challenge_landed`               | Challenge teaser opens                | challenge presence          | referral funnel      |
| `challenge_accepted`             | Friend card completes comparison      | card ID                     | referral funnel      |
| `referral_landed`                | Valid referral query is stored        | referral presence           | attribution          |
| `referral_generation_completed`  | Referred generation succeeds          | no raw code                 | qualification        |
| `referral_credited`              | Idempotent credit succeeds            | card ID                     | primary virality     |
| `var_review_started/completed`   | Restricted review starts/completes    | card ID, feature flag       | P1                   |
| `audio_started/completed`        | Unlocked audio starts/completes       | card ID                     | P1                   |
| `product_mode_started/completed` | Startup XI starts/completes           | feature flag                | P1                   |
| `checkout_started/completed`     | Live Dodo flow starts/completes       | product, status             | P2                   |

## Verification

Before launch, use a consented test session, inspect the PostHog live-event stream, verify each event once, confirm no raw email/evidence appears, then build a funnel: `landing_view → generation_completed → result_viewed → activation_completed`. Exclude automated tests and operator sessions. Give judges read-only dashboard access; do not fabricate events.
