import { NextResponse } from "next/server";
import { SaveCardSchema } from "@haahaaland/shared";
import { equalHash, hashCapability } from "@/lib/capability";
import { cardStore } from "@/lib/store";

export async function POST(request: Request) {
  const parsed = SaveCardSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success)
    return NextResponse.json(
      {
        error: {
          code: "INVALID_INPUT",
          message: "Enter a valid email address.",
          requestId: crypto.randomUUID(),
          retryable: false,
        },
      },
      { status: 400 },
    );

  const api = process.env.RAILWAY_API_URL;
  const secret = process.env.INTERNAL_PROXY_SECRET;
  if (api && secret) {
    try {
      const response = await fetch(
        `${api.replace(/\/$/, "")}/v1/cards/${encodeURIComponent(parsed.data.cardId)}/save`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-haahaaland-proxy-secret": secret,
          },
          body: JSON.stringify({
            email: parsed.data.email,
            managementToken: parsed.data.managementToken,
          }),
          signal: AbortSignal.timeout(8_000),
        },
      );
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
            code: "SERVICE_UNAVAILABLE",
            message: "Saving is temporarily unavailable.",
            requestId: crypto.randomUUID(),
            retryable: true,
          },
        },
        { status: 502 },
      );
    }
  }

  const found = cardStore.get(parsed.data.cardId);
  if (!found)
    return NextResponse.json(
      {
        error: {
          code: "CONVEX_UNAVAILABLE",
          message:
            "Saving is unavailable in this session. Your card is still visible and downloadable.",
          requestId: crypto.randomUUID(),
          retryable: true,
        },
      },
      { status: 503 },
    );
  if (
    !equalHash(
      found.managementTokenHash,
      await hashCapability(parsed.data.managementToken),
    )
  )
    return NextResponse.json(
      {
        error: {
          code: "UNAUTHORIZED",
          message: "Card ownership required.",
          requestId: crypto.randomUUID(),
          retryable: false,
        },
      },
      { status: 403 },
    );
  found.email = parsed.data.email;
  return NextResponse.json({ saved: true });
}
