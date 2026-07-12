import { cardStore, challengeStore } from "@/lib/store";

export const metadata = {
  title: "Timeline challenge · HaaHaaLand",
  robots: { index: false, follow: false },
};

type ChallengeView = {
  status: string;
  challenger: { handle: string; archetypeId: string; aura?: number } | null;
  targetHandle?: string;
  result?: { winnerCardId: string; verdict: string };
};

async function getChallenge(slug: string): Promise<ChallengeView | null> {
  if (!/^[A-Za-z0-9_-]{8,80}$/.test(slug)) return null;
  const api = process.env.RAILWAY_API_URL;
  const secret = process.env.INTERNAL_PROXY_SECRET;
  if (api && secret) {
    try {
      const response = await fetch(
        `${api.replace(/\/$/, "")}/v1/challenges/${encodeURIComponent(slug)}`,
        {
          headers: { "x-haahaaland-proxy-secret": secret },
          signal: AbortSignal.timeout(8_000),
          cache: "no-store",
        },
      );
      return response.ok ? ((await response.json()) as ChallengeView) : null;
    } catch {
      return null;
    }
  }
  const challenge = challengeStore.get(slug);
  if (!challenge) return null;
  const card = cardStore.get(challenge.cardId)?.card;
  return {
    status: challenge.completedAt ? "completed" : "pending",
    challenger: card
      ? {
          handle: card.handle,
          archetypeId: card.primaryArchetypeId,
          aura: card.stats.find((stat) => stat.key === "aura")?.value ?? 0,
        }
      : null,
    ...(challenge.targetHandle ? { targetHandle: challenge.targetHandle } : {}),
    ...(challenge.result ? { result: challenge.result } : {}),
  };
}

export default async function ChallengePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const challenge = await getChallenge(code);
  if (!challenge)
    return (
      <main className="challenge-page">
        <div className="tape">FULL-TIME</div>
        <h1>This challenge has left the stadium.</h1>
        <a className="button" href="/">
          Scout My Timeline
        </a>
      </main>
    );
  if (challenge.status === "completed" && challenge.result)
    return (
      <main className="challenge-page">
        <div className="tape">BATTLE RESULT</div>
        <h1>{challenge.result.verdict}</h1>
        <p>
          The winner was decided from the same structured Aura, Output, and
          Clutch scores. No custom insults. No hidden attributes.
        </p>
        <a className="button" href={`/?ref=${encodeURIComponent(code)}`}>
          Start another challenge
        </a>
      </main>
    );
  return (
    <main className="challenge-page">
      <div className="tape">CHALLENGE ACCEPTED</div>
      <h1>
        @{challenge.challenger?.handle ?? "A brave timeline"} put their card on
        the line.
      </h1>
      <p>
        The teaser: {challenge.challenger?.archetypeId ?? "a mystery archetype"}{" "}
        energy and {challenge.challenger?.aura ?? "unknown"} Aura. The predicted
        winner stays hidden until you generate your own card.
      </p>
      <a className="button" href={`/?ref=${encodeURIComponent(code)}`}>
        Scout My Timeline
      </a>
    </main>
  );
}
