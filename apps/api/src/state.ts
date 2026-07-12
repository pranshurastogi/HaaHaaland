import { ConvexHttpClient } from "convex/browser";
import { makeFunctionReference } from "convex/server";
import type { ScoutCard } from "@haahaaland/shared";

export type CardRecord = {
  card: ScoutCard;
  createdAt: string;
  managementTokenHash: string;
  sessionHash: string;
  generationMeta?: {
    model: string;
    promptVersion: string;
    taxonomyVersion: string;
    durationMs: number;
    retryCount: number;
  };
  images?: {
    svgUrl: string;
    pngUrl: string;
    ogUrl: string;
  };
  email?: string;
};

export type ChallengeResult = { winnerCardId: string; verdict: string };

export type ChallengeRecord = {
  cardId: string;
  challengerSessionHash: string;
  friendHandle?: string;
  acceptedCardId?: string;
  acceptedSessionHash?: string;
  result?: ChallengeResult;
  credited: boolean;
  createdAt: string;
  completedAt?: string;
};

export type LeaderboardEntry = {
  id: string;
  handle: string;
  archetypeId: string;
  aura: number;
};

export interface AppStateStore {
  durable: boolean;
  beginGeneration(
    key: string | undefined,
    requestHash: string,
    proposedId: string,
    requestId: string,
  ): Promise<
    | { status: "started"; publicId: string }
    | { status: "in_progress" }
    | { status: "conflict" }
    | { status: "complete"; response: unknown }
  >;
  completeGeneration(key: string | undefined, response: unknown): Promise<void>;
  putCard(id: string, record: CardRecord): Promise<void>;
  getCard(id: string): Promise<CardRecord | null>;
  saveCard(id: string, email: string): Promise<boolean>;
  recordShare(cardId: string, channel: string): Promise<boolean>;
  putChallenge(slug: string, record: ChallengeRecord): Promise<void>;
  getChallenge(slug: string): Promise<ChallengeRecord | null>;
  completeChallenge(
    slug: string,
    acceptedCardId: string,
    acceptedSessionHash: string,
    result: ChallengeResult,
  ): Promise<ChallengeRecord | null>;
  countCredits(cardId: string): Promise<number>;
  topLeaderboard(limit: number): Promise<LeaderboardEntry[]>;
}

function boundedSet<K, V>(map: Map<K, V>, key: K, value: V, max: number) {
  if (!map.has(key)) {
    while (map.size >= max) {
      const oldest = map.keys().next().value as K | undefined;
      if (oldest === undefined) break;
      map.delete(oldest);
    }
  }
  map.set(key, value);
}

export class MemoryStateStore implements AppStateStore {
  readonly durable = false;
  private readonly cards = new Map<string, CardRecord>();
  private readonly challenges = new Map<string, ChallengeRecord>();
  private readonly shares: Array<{
    cardId: string;
    channel: string;
    createdAt: string;
  }> = [];
  private readonly generations = new Map<
    string,
    {
      requestHash: string;
      publicId: string;
      response?: unknown;
      expiresAt: number;
    }
  >();

  async beginGeneration(
    key: string | undefined,
    requestHash: string,
    proposedId: string,
  ) {
    if (!key) return { status: "started" as const, publicId: proposedId };
    const existing = this.generations.get(key);
    if (existing && existing.expiresAt <= Date.now())
      this.generations.delete(key);
    else if (existing) {
      if (existing.requestHash !== requestHash)
        return { status: "conflict" as const };
      if (existing.response !== undefined)
        return { status: "complete" as const, response: existing.response };
      return { status: "in_progress" as const };
    }
    boundedSet(
      this.generations,
      key,
      {
        requestHash,
        publicId: proposedId,
        expiresAt: Date.now() + 2 * 60 * 1000,
      },
      10_000,
    );
    return { status: "started" as const, publicId: proposedId };
  }

  async completeGeneration(key: string | undefined, response: unknown) {
    if (!key) return;
    const generation = this.generations.get(key);
    if (generation) {
      generation.response = response;
      generation.expiresAt = Date.now() + 24 * 60 * 60 * 1000;
    }
  }

  async putCard(id: string, record: CardRecord) {
    boundedSet(this.cards, id, record, 5_000);
  }

  async getCard(id: string) {
    return this.cards.get(id) ?? null;
  }

  async saveCard(id: string, email: string) {
    const card = this.cards.get(id);
    if (!card) return false;
    card.email = email;
    return true;
  }

  async recordShare(cardId: string, channel: string) {
    if (!this.cards.has(cardId)) return false;
    this.shares.push({ cardId, channel, createdAt: new Date().toISOString() });
    if (this.shares.length > 10_000) this.shares.splice(0, 1_000);
    return true;
  }

  async putChallenge(slug: string, record: ChallengeRecord) {
    boundedSet(this.challenges, slug, record, 5_000);
  }

  async getChallenge(slug: string) {
    return this.challenges.get(slug) ?? null;
  }

  async completeChallenge(
    slug: string,
    acceptedCardId: string,
    acceptedSessionHash: string,
    result: ChallengeResult,
  ) {
    const challenge = this.challenges.get(slug);
    if (!challenge) return null;
    if (challenge.completedAt) return challenge;
    challenge.acceptedCardId = acceptedCardId;
    challenge.acceptedSessionHash = acceptedSessionHash;
    challenge.completedAt = new Date().toISOString();
    challenge.credited = false;
    challenge.result = result;
    return challenge;
  }

  async countCredits(cardId: string) {
    return [...this.challenges.values()].filter(
      (challenge) => challenge.cardId === cardId && challenge.credited,
    ).length;
  }

  async topLeaderboard(limit: number) {
    return [...this.cards.entries()]
      .filter(([, value]) => value.email)
      .map(([id, value]) => ({
        id,
        handle: value.card.handle,
        archetypeId: value.card.primaryArchetypeId,
        aura: value.card.stats.find((stat) => stat.key === "aura")?.value ?? 0,
      }))
      .sort((left, right) => right.aura - left.aura)
      .slice(0, Math.min(limit, 50));
  }
}

type ConvexArgs = Record<string, unknown>;
type ConvexResult = Record<string, unknown> | null;
const mutation = (name: string) =>
  makeFunctionReference<"mutation", ConvexArgs, ConvexResult>(name);
const query = (name: string) =>
  makeFunctionReference<"query", ConvexArgs, ConvexResult>(name);

export class ConvexStateStore implements AppStateStore {
  readonly durable = true;
  private readonly client: ConvexHttpClient;

  constructor(
    url: string,
    private readonly secret: string,
  ) {
    this.client = new ConvexHttpClient(url, { logger: false });
  }

  async beginGeneration(
    key: string | undefined,
    requestHash: string,
    proposedId: string,
    requestId: string,
  ) {
    if (!key) return { status: "started" as const, publicId: proposedId };
    const result = await this.client.mutation(
      mutation("runtime:beginGeneration"),
      {
        secret: this.secret,
        key,
        requestHash,
        proposedId,
        requestId,
      },
    );
    if (result?.status === "complete")
      return { status: "complete" as const, response: result.response };
    if (result?.status === "conflict") return { status: "conflict" as const };
    if (result?.status === "in_progress")
      return { status: "in_progress" as const };
    if (result?.status === "started" && typeof result.publicId === "string")
      return { status: "started" as const, publicId: result.publicId };
    throw new Error("Invalid Convex idempotency response");
  }

  async completeGeneration(key: string | undefined, response: unknown) {
    if (!key) return;
    await this.client.mutation(mutation("runtime:completeGeneration"), {
      secret: this.secret,
      key,
      response,
    });
  }

  async putCard(id: string, record: CardRecord) {
    await this.client.mutation(mutation("runtime:putCard"), {
      secret: this.secret,
      id,
      record,
    });
  }

  async getCard(id: string) {
    return (await this.client.query(query("runtime:getCard"), {
      secret: this.secret,
      id,
    })) as CardRecord | null;
  }

  async saveCard(id: string, email: string) {
    const result = await this.client.mutation(mutation("runtime:saveCard"), {
      secret: this.secret,
      id,
      email,
    });
    return result?.saved === true;
  }

  async recordShare(cardId: string, channel: string) {
    const result = await this.client.mutation(mutation("runtime:recordShare"), {
      secret: this.secret,
      cardId,
      channel,
    });
    return result?.recorded === true;
  }

  async putChallenge(slug: string, record: ChallengeRecord) {
    await this.client.mutation(mutation("runtime:putChallenge"), {
      secret: this.secret,
      slug,
      record,
    });
  }

  async getChallenge(slug: string) {
    return (await this.client.query(query("runtime:getChallenge"), {
      secret: this.secret,
      slug,
    })) as ChallengeRecord | null;
  }

  async completeChallenge(
    slug: string,
    acceptedCardId: string,
    acceptedSessionHash: string,
    result: ChallengeResult,
  ) {
    return (await this.client.mutation(mutation("runtime:completeChallenge"), {
      secret: this.secret,
      slug,
      acceptedCardId,
      acceptedSessionHash,
      result,
    })) as ChallengeRecord | null;
  }

  async countCredits(cardId: string) {
    const result = await this.client.query(query("runtime:countCredits"), {
      secret: this.secret,
      cardId,
    });
    return typeof result?.count === "number" ? result.count : 0;
  }

  async topLeaderboard(limit: number) {
    const result = await this.client.query(query("runtime:topLeaderboard"), {
      secret: this.secret,
      limit,
    });
    return Array.isArray(result?.entries)
      ? (result.entries as LeaderboardEntry[])
      : [];
  }
}
