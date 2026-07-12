import { NextResponse } from "next/server";
import { ChallengeSchema } from "@haahaaland/shared";
import { equalHash, hashCapability } from "@/lib/capability";
import { cardStore, challengeStore } from "@/lib/store";

export async function POST(request: Request) {
  if (process.env.FEATURE_CHALLENGES === "false")
    return NextResponse.json(
      {
        error: {
          code: "NOT_FOUND",
          message: "Challenges are disabled.",
          requestId: crypto.randomUUID(),
          retryable: false,
        },
      },
      { status: 404 },
    );
  const parsed = ChallengeSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success)
    return NextResponse.json(
      {
        error: {
          code: "INVALID_INPUT",
          message: "Choose a valid card and optional friend handle.",
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
      const response = await fetch(`${api.replace(/\/$/, "")}/v1/challenges`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-haahaaland-proxy-secret": secret,
        },
        body: JSON.stringify(parsed.data),
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
            code: "SERVICE_UNAVAILABLE",
            message: "Challenge creation is temporarily unavailable.",
            requestId: crypto.randomUUID(),
            retryable: true,
          },
        },
        { status: 502 },
      );
    }
  }

  const sourceCard = cardStore.get(parsed.data.cardId);
  if (!sourceCard)
    return NextResponse.json(
      {
        error: {
          code: "NOT_FOUND",
          message: "Scout card not found.",
          requestId: crypto.randomUUID(),
          retryable: false,
        },
      },
      { status: 404 },
    );
  if (
    !equalHash(
      sourceCard.managementTokenHash,
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
  const slug = crypto.randomUUID().replaceAll("-", "");
  if (challengeStore.size >= 5_000) {
    const oldest = challengeStore.keys().next().value;
    if (oldest) challengeStore.delete(oldest);
  }
  challengeStore.set(slug, {
    cardId: parsed.data.cardId,
    challengerSessionHash: await hashCapability(parsed.data.sessionId),
    ...(parsed.data.friendHandle
      ? { targetHandle: parsed.data.friendHandle }
      : {}),
    credited: false,
    createdAt: new Date().toISOString(),
  });
  return NextResponse.json(
    { slug, url: `/challenge/${slug}` },
    { status: 201 },
  );
}
