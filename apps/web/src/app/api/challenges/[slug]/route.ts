import { NextResponse } from "next/server";
import { ChallengeAcceptSchema, type ScoutCard } from "@haahaaland/shared";
import { equalHash, hashCapability } from "@/lib/capability";
import { cardStore, challengeStore } from "@/lib/store";

const error = (code: string, message: string, status: number) =>
  NextResponse.json(
    {
      error: {
        code,
        message,
        requestId: crypto.randomUUID(),
        retryable: status >= 500,
      },
    },
    { status },
  );

async function proxy(path: string, request?: Request) {
  const api = process.env.RAILWAY_API_URL;
  const secret = process.env.INTERNAL_PROXY_SECRET;
  if (!api || !secret) return null;
  const response = await fetch(`${api.replace(/\/$/, "")}${path}`, {
    method: request ? "POST" : "GET",
    headers: {
      ...(request ? { "content-type": "application/json" } : {}),
      "x-haahaaland-proxy-secret": secret,
    },
    ...(request
      ? { body: JSON.stringify(await request.json().catch(() => null)) }
      : {}),
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
}

export async function GET(
  _: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  if (!/^[A-Za-z0-9_-]{8,80}$/.test(slug))
    return error("NOT_FOUND", "Challenge not found.", 404);
  try {
    const proxied = await proxy(`/v1/challenges/${encodeURIComponent(slug)}`);
    if (proxied) return proxied;
  } catch {
    return error(
      "SERVICE_UNAVAILABLE",
      "Challenge lookup is unavailable.",
      502,
    );
  }
  const challenge = challengeStore.get(slug);
  if (!challenge) return error("NOT_FOUND", "Challenge not found.", 404);
  const source = cardStore.get(challenge.cardId);
  return NextResponse.json({
    slug,
    status: challenge.completedAt ? "completed" : "pending",
    challenger: source
      ? {
          handle: source.card.handle,
          archetypeId: source.card.primaryArchetypeId,
          aura:
            source.card.stats.find((stat) => stat.key === "aura")?.value ?? 0,
        }
      : null,
    targetHandle: challenge.targetHandle,
    result: challenge.result,
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  try {
    const proxied = await proxy(
      `/v1/challenges/${encodeURIComponent(slug)}/accept`,
      request.clone(),
    );
    if (proxied) return proxied;
  } catch {
    return error(
      "SERVICE_UNAVAILABLE",
      "Challenge acceptance is unavailable.",
      502,
    );
  }
  const challenge = challengeStore.get(slug);
  if (!challenge) return error("NOT_FOUND", "Challenge not found.", 404);
  const parsed = ChallengeAcceptSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success)
    return error("INVALID_INPUT", "Invalid challenge acceptance.", 400);
  if (challenge.result) return NextResponse.json(challenge.result);
  const challenger = cardStore.get(challenge.cardId);
  const accepted = cardStore.get(parsed.data.acceptedCardId);
  if (!challenger || !accepted)
    return error("NOT_FOUND", "A challenge card was not found.", 404);
  if (
    !equalHash(
      accepted.managementTokenHash,
      await hashCapability(parsed.data.managementToken),
    )
  )
    return error("UNAUTHORIZED", "Card ownership required.", 403);
  const acceptedSessionHash = await hashCapability(parsed.data.sessionId);
  if (!equalHash(accepted.sessionHash, acceptedSessionHash))
    return error("UNAUTHORIZED", "Session does not own this card.", 403);
  if (
    equalHash(challenge.challengerSessionHash, acceptedSessionHash) ||
    challenge.cardId === parsed.data.acceptedCardId ||
    challenger.card.handle === accepted.card.handle
  )
    return error("INVALID_INPUT", "A card cannot challenge itself.", 409);
  const score = (card: ScoutCard) =>
    ["aura", "output", "clutch"].reduce(
      (total, key) =>
        total + (card.stats.find((stat) => stat.key === key)?.value ?? 0),
      0,
    );
  const winnerCardId =
    score(challenger.card) >= score(accepted.card)
      ? challenge.cardId
      : parsed.data.acceptedCardId;
  challenge.acceptedCardId = parsed.data.acceptedCardId;
  challenge.acceptedSessionId = parsed.data.sessionId;
  challenge.completedAt = new Date().toISOString();
  challenge.credited = false;
  challenge.result = {
    winnerCardId,
    verdict:
      winnerCardId === challenge.cardId
        ? "The challenger controls midfield and edges the tie."
        : "The response card overturns the pre-match prediction.",
  };
  return NextResponse.json(challenge.result);
}
