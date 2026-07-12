const required = {
  web: [
    "NEXT_PUBLIC_APP_NAME",
    "NEXT_PUBLIC_APP_URL",
    "NEXT_PUBLIC_CONVEX_URL",
    "NEXT_PUBLIC_POSTHOG_KEY",
    "NEXT_PUBLIC_POSTHOG_HOST",
    "RAILWAY_API_URL",
    "INTERNAL_PROXY_SECRET",
    "LOCAL_FALLBACK_ENABLED",
    "FEATURE_PROFILE_SCOUT",
    "FEATURE_INSTAGRAM_INPUT",
    "FEATURE_MANUAL_POSTS",
    "FEATURE_CHALLENGES",
    "FEATURE_LEADERBOARD",
    "FEATURE_PRODUCT_XI",
    "FEATURE_AUDIO",
    "FEATURE_HERMES_VAR",
    "FEATURE_PAYMENTS",
  ],
  api: [
    "NODE_ENV",
    "PORT",
    "APP_URL",
    "FRONTEND_URL",
    "INTERNAL_PROXY_SECRET",
    "MAX_DAILY_GENERATIONS",
    "HANDLE_COOLDOWN_MS",
    "REFERRALS_FOR_VAR",
    "FEATURE_PROFILE_SCOUT",
    "FEATURE_INSTAGRAM_INPUT",
    "FEATURE_MANUAL_POSTS",
    "FEATURE_CHALLENGES",
    "FEATURE_LEADERBOARD",
    "FEATURE_PRODUCT_XI",
    "FEATURE_AUDIO",
    "FEATURE_HERMES_VAR",
    "FEATURE_PAYMENTS",
    "LINKUP_API_KEY",
    "OPENAI_API_KEY",
    "OPENAI_MODEL",
    "CONVEX_URL",
    "CONVEX_DEPLOY_KEY",
    "CONVEX_INTERNAL_SECRET",
    "POSTHOG_API_KEY",
    "POSTHOG_HOST",
    "ELEVENLABS_API_KEY",
    "ELEVENLABS_VOICE_ID",
    "HERMES_RUNTIME_ENABLED",
    "HERMES_BASE_URL",
    "HERMES_API_KEY",
    "HERMES_MODEL",
    "R2_ACCOUNT_ID",
    "R2_ACCESS_KEY_ID",
    "R2_SECRET_ACCESS_KEY",
    "R2_BUCKET_NAME",
    "R2_PUBLIC_BASE_URL",
    "DODO_PAYMENTS_ENABLED",
    "DODO_PAYMENTS_API_KEY",
    "DODO_PAYMENTS_WEBHOOK_SECRET",
  ],
};
const target = process.argv[2] ?? "api";
if (!required[target]) {
  console.error("Usage: node scripts/check-env.mjs web|api");
  process.exit(2);
}
const missing = required[target].filter((k) => !(k in process.env));
if (missing.length) {
  console.error(
    `Missing environment variable names for ${target}: ${missing.join(", ")}`,
  );
  process.exit(1);
}
console.log(
  `${target} environment contract satisfied (${required[target].length} names present; values not printed).`,
);
