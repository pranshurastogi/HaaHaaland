import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { GenerationRequestSchema } from "@haahaaland/shared";
import { hashCapability } from "@/lib/capability";
import { localScout } from "@/lib/fallback";
import { cardStore } from "@/lib/store";
export const runtime = "nodejs";

const LOG_TAG = "[haahaaland:generate]";

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  if (process.env.FEATURE_PROFILE_SCOUT === "false") {
    console.warn(
      `${LOG_TAG} ${requestId} blocked: FEATURE_PROFILE_SCOUT=false`,
    );
    return NextResponse.json(
      {
        error: {
          code: "NOT_FOUND",
          message: "Profile scouting is disabled.",
          requestId,
          retryable: false,
        },
      },
      { status: 404 },
    );
  }
  const idempotencyKey = request.headers.get("idempotency-key");
  const body = await request.json().catch(() => null);
  try {
    const api = process.env.RAILWAY_API_URL,
      secret = process.env.INTERNAL_PROXY_SECRET;
    if (api && secret) {
      console.log(
        `${LOG_TAG} ${requestId} routing to backend API at ${api} (RAILWAY_API_URL configured)`,
      );
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
        if (!response.ok)
          console.error(
            `${LOG_TAG} ${requestId} backend API responded with HTTP ${response.status}`,
          );
        else
          console.log(
            `${LOG_TAG} ${requestId} backend API generation succeeded (HTTP ${response.status})`,
          );
        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
      } catch (error) {
        const timeout = error instanceof Error && error.name === "AbortError";
        console.error(
          `${LOG_TAG} ${requestId} backend API call failed: ${
            timeout
              ? "request timed out after 25s"
              : error instanceof Error
                ? error.message
                : String(error)
          }`,
        );
        throw error;
      } finally {
        clearTimeout(timer);
      }
    }
    console.warn(
      `${LOG_TAG} ${requestId} no backend configured (RAILWAY_API_URL/INTERNAL_PROXY_SECRET missing) — checking local fallback`,
    );
    const localFallbackEnabled =
      process.env.NODE_ENV !== "production" ||
      process.env.LOCAL_FALLBACK_ENABLED === "true";
    if (!localFallbackEnabled) {
      console.error(
        `${LOG_TAG} ${requestId} scouting unavailable: no backend configured and LOCAL_FALLBACK_ENABLED is not "true"`,
      );
      return NextResponse.json(
        {
          error: {
            code: "SERVICE_UNAVAILABLE",
            message: "The scouting service is not configured.",
            requestId,
            retryable: true,
          },
        },
        { status: 503 },
      );
    }
    console.log(
      `${LOG_TAG} ${requestId} using local deterministic fallback (LOCAL_FALLBACK_ENABLED=true) — not real AI/profile data`,
    );
    const parsedRequest = GenerationRequestSchema.parse(body);
    const result = localScout(body);
    const managementToken = `${crypto.randomUUID().replaceAll("-", "")}${crypto.randomUUID().replaceAll("-", "")}`;
    if (cardStore.size >= 5_000) {
      const oldest = cardStore.keys().next().value;
      if (oldest) cardStore.delete(oldest);
    }
    cardStore.set(result.id, {
      card: result.card,
      createdAt: new Date().toISOString(),
      managementTokenHash: await hashCapability(managementToken),
      sessionHash: await hashCapability(parsedRequest.sessionId),
    });
    console.log(
      `${LOG_TAG} ${requestId} local fallback card ${result.id} stored in-memory (this worker isolate only)`,
    );
    return NextResponse.json({ ...result, managementToken }, { status: 201 });
  } catch (error) {
    const validationError = error instanceof ZodError;
    const timeout = error instanceof Error && error.name === "AbortError";
    console.error(
      `${LOG_TAG} ${requestId} request failed: ${
        validationError
          ? `invalid input (${error.issues[0]?.message ?? "validation error"})`
          : timeout
            ? "upstream timeout"
            : error instanceof Error
              ? error.message
              : String(error)
      }`,
    );
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
          requestId,
          retryable: !validationError,
        },
      },
      { status: validationError ? 400 : timeout ? 504 : 502 },
    );
  }
}
