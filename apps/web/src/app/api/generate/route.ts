import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { GenerationRequestSchema } from "@haahaaland/shared";
import { hashCapability } from "@/lib/capability";
import { localScout } from "@/lib/fallback";
import { cardStore } from "@/lib/store";
export const runtime = "nodejs";
export async function POST(request: Request) {
  if (process.env.FEATURE_PROFILE_SCOUT === "false")
    return NextResponse.json(
      {
        error: {
          code: "NOT_FOUND",
          message: "Profile scouting is disabled.",
          requestId: crypto.randomUUID(),
          retryable: false,
        },
      },
      { status: 404 },
    );
  const idempotencyKey = request.headers.get("idempotency-key");
  const body = await request.json().catch(() => null);
  try {
    const api = process.env.RAILWAY_API_URL,
      secret = process.env.INTERNAL_PROXY_SECRET;
    if (api && secret) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 25_000);
      try {
        const response = await fetch(
          `${api.replace(/\/$/, "")}/v1/scout/profile`,
          {
            method: "POST",
            signal: controller.signal,
            headers: {
              "content-type": "application/json",
              "x-haahaaland-proxy-secret": secret,
              ...(idempotencyKey && idempotencyKey.length <= 100
                ? { "idempotency-key": idempotencyKey }
                : {}),
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
    const localFallbackEnabled =
      process.env.NODE_ENV !== "production" ||
      process.env.LOCAL_FALLBACK_ENABLED === "true";
    if (!localFallbackEnabled)
      return NextResponse.json(
        {
          error: {
            code: "SERVICE_UNAVAILABLE",
            message: "The scouting service is not configured.",
            requestId: crypto.randomUUID(),
            retryable: true,
          },
        },
        { status: 503 },
      );
    const parsedRequest = GenerationRequestSchema.parse(body);
    const result = localScout(body);
    const managementToken = `${crypto.randomUUID().replaceAll("-", "")}${crypto.randomUUID().replaceAll("-", "")}`;
    cardStore.set(result.id, {
      card: result.card,
      createdAt: new Date().toISOString(),
      managementTokenHash: await hashCapability(managementToken),
      sessionHash: await hashCapability(parsedRequest.sessionId),
    });
    return NextResponse.json({ ...result, managementToken }, { status: 201 });
  } catch (error) {
    const validationError = error instanceof ZodError;
    const timeout = error instanceof Error && error.name === "AbortError";
    return NextResponse.json(
      {
        error: {
          code: validationError
            ? "INVALID_INPUT"
            : timeout
              ? "UPSTREAM_TIMEOUT"
              : "SERVICE_UNAVAILABLE",
          message: validationError
            ? (error.issues[0]?.message ?? "Invalid scouting request")
            : timeout
              ? "The scouting service timed out. Try again."
              : "The scouting service is temporarily unavailable.",
          requestId: crypto.randomUUID(),
          retryable: !validationError,
        },
      },
      { status: validationError ? 400 : timeout ? 504 : 502 },
    );
  }
}
