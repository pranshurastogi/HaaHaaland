import { buildApp } from "./app";

function required(name: string): string {
  const value = process.env[name];
  if (!value)
    throw new Error(`Missing required production configuration: ${name}`);
  return value;
}

function enabled(name: string, fallback: boolean): boolean {
  const value = process.env[name];
  if (value === undefined) return fallback;
  return value.toLowerCase() === "true";
}

function positiveNumber(name: string, fallback: number): number {
  const value = Number(process.env[name] ?? fallback);
  return Number.isFinite(value) && value >= 0 ? value : fallback;
}

const production = process.env.NODE_ENV === "production";
const app = buildApp({
  proxySecret: production
    ? required("INTERNAL_PROXY_SECRET")
    : (process.env.INTERNAL_PROXY_SECRET ?? "local-development-only"),
  ...(process.env.FRONTEND_URL
    ? { frontendUrl: process.env.FRONTEND_URL }
    : {}),
  ...(process.env.LINKUP_API_KEY
    ? { linkupApiKey: process.env.LINKUP_API_KEY }
    : {}),
  ...(process.env.OPENAI_API_KEY
    ? { openaiApiKey: process.env.OPENAI_API_KEY }
    : {}),
  ...(process.env.OPENAI_MODEL
    ? { openaiModel: process.env.OPENAI_MODEL }
    : {}),
  maxDailyGenerations: positiveNumber("MAX_DAILY_GENERATIONS", 1_000),
  handleCooldownMs: positiveNumber("HANDLE_COOLDOWN_MS", 60_000),
  featureProfileScout: enabled("FEATURE_PROFILE_SCOUT", true),
  featureChallenges: enabled("FEATURE_CHALLENGES", true),
});

const port = Number(process.env.PORT ?? 3001);
try {
  await app.listen({ host: "0.0.0.0", port });
} catch (error) {
  app.log.fatal(
    {
      code: "STARTUP_FAILED",
      errorName: error instanceof Error ? error.name : "UnknownError",
    },
    "API startup failed",
  );
  process.exitCode = 1;
}

async function shutdown(signal: string) {
  app.log.info({ signal }, "graceful shutdown started");
  const timer = setTimeout(() => process.exit(1), 10_000).unref();
  try {
    await app.close();
    clearTimeout(timer);
  } catch (error) {
    app.log.error(
      {
        signal,
        errorName: error instanceof Error ? error.name : "UnknownError",
      },
      "graceful shutdown failed",
    );
    process.exitCode = 1;
  }
}

process.once("SIGTERM", () => void shutdown("SIGTERM"));
process.once("SIGINT", () => void shutdown("SIGINT"));
