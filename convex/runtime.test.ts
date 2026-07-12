import { convexTest } from "convex-test";
import { makeFunctionReference } from "convex/server";
import { beforeEach, describe, expect, it } from "vitest";
import schema from "./schema";

declare global {
  interface ImportMeta {
    glob(pattern: string): Record<string, () => Promise<unknown>>;
  }
}

const modules = import.meta.glob("./**/*.ts");
const secret = "convex_test_secret_placeholder_123456";
const mutation = (name: string) =>
  makeFunctionReference<"mutation", any, any>(name);
const query = (name: string) => makeFunctionReference<"query", any, any>(name);
const card = (handle: string, aura: number) => ({
  version: "1",
  handle,
  primaryArchetypeId: "haaland",
  researchConfidence: 80,
  stats: [{ key: "aura", value: aura }],
});
const record = (handle: string, sessionHash: string, aura: number) => ({
  card: card(handle, aura),
  createdAt: new Date().toISOString(),
  managementTokenHash: `${handle}_management_hash`,
  sessionHash,
  generationMeta: {
    model: "fixture",
    promptVersion: "test",
    taxonomyVersion: "test",
    durationMs: 1,
    retryCount: 0,
  },
});

beforeEach(() => {
  process.env.CONVEX_INTERNAL_SECRET = secret;
});

describe("Convex runtime state", () => {
  it("atomically reserves and completes idempotent generations", async () => {
    const t = convexTest(schema, modules);
    const args = {
      secret,
      key: "idempotency_key_123456",
      requestHash: "request_hash_a",
      proposedId: "card-a",
      requestId: "request-a",
    };
    expect(await t.mutation(mutation("runtime:beginGeneration"), args)).toEqual(
      {
        status: "started",
        publicId: "card-a",
      },
    );
    expect(await t.mutation(mutation("runtime:beginGeneration"), args)).toEqual(
      { status: "in_progress" },
    );
    await t.mutation(mutation("runtime:completeGeneration"), {
      secret,
      key: args.key,
      response: { id: "card-a" },
    });
    expect(await t.mutation(mutation("runtime:beginGeneration"), args)).toEqual(
      { status: "complete", response: { id: "card-a" } },
    );
    expect(
      await t.mutation(mutation("runtime:beginGeneration"), {
        ...args,
        requestHash: "request_hash_b",
      }),
    ).toEqual({ status: "conflict" });
  });

  it("persists cards, leaderboard saves, challenges, and one referral credit", async () => {
    const t = convexTest(schema, modules);
    await t.mutation(mutation("runtime:putCard"), {
      secret,
      id: "challenger-card",
      record: record("challengerfc", "session-a", 88),
    });
    await t.mutation(mutation("runtime:putCard"), {
      secret,
      id: "opponent-card",
      record: record("opponentfc", "session-b", 72),
    });
    expect(
      await t.mutation(mutation("runtime:saveCard"), {
        secret,
        id: "challenger-card",
        email: "owner@example.com",
      }),
    ).toMatchObject({ saved: true });
    expect(
      await t.query(query("runtime:topLeaderboard"), { secret, limit: 10 }),
    ).toMatchObject({ entries: [{ id: "challenger-card", aura: 88 }] });

    await t.mutation(mutation("runtime:putChallenge"), {
      secret,
      slug: "challenge-123",
      record: {
        cardId: "challenger-card",
        challengerSessionHash: "session-a",
        credited: false,
        createdAt: new Date().toISOString(),
      },
    });
    const completion = {
      secret,
      slug: "challenge-123",
      acceptedCardId: "opponent-card",
      acceptedSessionHash: "session-b",
      result: { winnerCardId: "challenger-card", verdict: "Fixture verdict" },
    };
    expect(
      await t.mutation(mutation("runtime:completeChallenge"), completion),
    ).toMatchObject({ credited: true, result: completion.result });
    await t.mutation(mutation("runtime:completeChallenge"), completion);
    expect(
      await t.query(query("runtime:countCredits"), {
        secret,
        cardId: "challenger-card",
      }),
    ).toEqual({ count: 1 });
  });
});
