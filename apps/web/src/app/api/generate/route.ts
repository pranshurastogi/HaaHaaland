import { NextResponse } from "next/server";
import { localScout } from "@/lib/fallback";
import { cardStore } from "@/lib/store";
export const runtime = "nodejs";
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  try {
    const api = process.env.RAILWAY_API_URL,
      secret = process.env.INTERNAL_PROXY_SECRET;
    if (api && secret) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 25_000);
      try {
        const response = await fetch(
          `${api.replace(/\/$/, "")}/v1/generations`,
          {
            method: "POST",
            signal: controller.signal,
            headers: {
              "content-type": "application/json",
              "x-internal-proxy-secret": secret,
            },
            body: JSON.stringify(body),
          },
        );
        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
      } finally {
        clearTimeout(timer);
      }
    }
    const result = localScout(body);
    cardStore.set(result.id, {
      card: result.card,
      createdAt: new Date().toISOString(),
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "invalid_request",
        message:
          error instanceof Error
            ? error.message
            : "Unable to scout this profile",
      },
      { status: 400 },
    );
  }
}
