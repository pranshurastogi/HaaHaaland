# Analytics

Recommended provider: PostHog. Configure only its public project key/host in the web app and a server key only in the API.

Events: `landing_viewed`, `generation_started`, `generation_completed`, `result_viewed`, `email_saved`, `share_clicked` (channel), `challenge_created`, `challenge_accepted`, `png_downloaded`, and `generation_failed` (category only).

Use a random anonymous session ID. Never send post excerpts, email, raw provider responses, secrets, or roast text. Activation is a derived server metric: generation completed + result viewed + (email saved OR challenge created). Mark automated smoke/e2e sessions and exclude them. Never manufacture traffic or users.
