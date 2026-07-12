import { NextResponse } from "next/server";
import { cardStore } from "@/lib/store";

const unavailable = () =>
  NextResponse.json(
    {
      error: {
        code: "SERVICE_UNAVAILABLE",
        message: "The leaderboard is temporarily unavailable.",
        requestId: crypto.randomUUID(),
        retryable: true,
      },
    },
    { status: 503 },
  );

export async function GET() {
  if (process.env.FEATURE_LEADERBOARD === "false")
    return NextResponse.json(
      {
        error: {
          code: "NOT_FOUND",
          message: "The leaderboard is disabled.",
          requestId: crypto.randomUUID(),
          retryable: false,
        },
      },
      { status: 404 },
    );
  const api = process.env.RAILWAY_API_URL;
  const secret = process.env.INTERNAL_PROXY_SECRET;
  if (api && secret) {
    try {
      const response = await fetch(`${api.replace(/\/$/, "")}/v1/leaderboard`, {
        headers: { "x-haahaaland-proxy-secret": secret },
        signal: AbortSignal.timeout(8_000),
        cache: "no-store",
      });
      return new NextResponse(await response.text(), {
        status: response.status,
        headers: {
          "content-type": "application/json",
          "cache-control": "no-store",
        },
      });
    } catch {
      return unavailable();
    }
  }
  if (
    process.env.NODE_ENV === "production" &&
    process.env.LOCAL_FALLBACK_ENABLED !== "true"
  )
    return unavailable();
  const entries = [...cardStore.entries()]
    .filter(([, value]) => value.email)
    .slice(-10)
    .reverse()
    .map(([id, value], index) => ({
      rank: index + 1,
      id,
      handle: value.card.handle,
      archetypeId: value.card.primaryArchetypeId,
      aura: value.card.stats.find((stat) => stat.key === "aura")?.value ?? 0,
    }));
  return NextResponse.json(
    { entries },
    { headers: { "cache-control": "private, no-store" } },
  );
}
