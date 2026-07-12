import { NextResponse } from "next/server";

export async function POST(request: Request) {
  if (process.env.FEATURE_HERMES_VAR !== "true")
    return NextResponse.json(
      {
        error: {
          code: "HERMES_UNAVAILABLE",
          message:
            "VAR review is locked until one qualified referral completes and the private referee service is enabled.",
          requestId: crypto.randomUUID(),
          retryable: false,
        },
      },
      { status: 503 },
    );
  const api = process.env.RAILWAY_API_URL;
  const secret = process.env.INTERNAL_PROXY_SECRET;
  if (!api || !secret)
    return NextResponse.json(
      {
        error: {
          code: "HERMES_UNAVAILABLE",
          message:
            "VAR review is locked until one qualified referral completes and the private referee service is enabled.",
          requestId: crypto.randomUUID(),
          retryable: true,
        },
      },
      { status: 503 },
    );
  try {
    const response = await fetch(`${api.replace(/\/$/, "")}/v1/var-review`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-haahaaland-proxy-secret": secret,
      },
      body: JSON.stringify(await request.json().catch(() => null)),
      signal: AbortSignal.timeout(8_000),
    });
    return new NextResponse(await response.text(), {
      status: response.status,
      headers: {
        "content-type": "application/json",
        "cache-control": "no-store",
      },
    });
  } catch {
    return NextResponse.json(
      {
        error: {
          code: "HERMES_UNAVAILABLE",
          message: "VAR review is temporarily unavailable.",
          requestId: crypto.randomUUID(),
          retryable: true,
        },
      },
      { status: 503 },
    );
  }
}
