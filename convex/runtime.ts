import { mutationGeneric, queryGeneric } from "convex/server";
import { v } from "convex/values";

declare const process: { env: Record<string, string | undefined> };

function requireSecret(secret: string) {
  const expected = process.env.CONVEX_INTERNAL_SECRET;
  if (!expected || secret.length !== expected.length)
    throw new Error("Unauthorized backend request");
  let mismatch = 0;
  for (let index = 0; index < expected.length; index += 1)
    mismatch |= secret.charCodeAt(index) ^ expected.charCodeAt(index);
  if (mismatch !== 0) throw new Error("Unauthorized backend request");
}

const cardRecord = (card: any) => ({
  card: card.card,
  createdAt: new Date(card.createdAt).toISOString(),
  managementTokenHash: card.managementTokenHash,
  sessionHash: card.sessionHash,
  generationMeta: {
    model: card.model,
    promptVersion: card.promptVersion,
    taxonomyVersion: card.taxonomyVersion,
    durationMs: card.durationMs,
    retryCount: card.retryCount,
  },
  ...(card.svgUrl && card.pngUrl && card.ogUrl
    ? {
        images: {
          svgUrl: card.svgUrl,
          pngUrl: card.pngUrl,
          ogUrl: card.ogUrl,
        },
      }
    : {}),
  ...(card.email ? { email: card.email } : {}),
});

const challengeRecord = (challenge: any) => ({
  cardId: challenge.challengerCardId,
  challengerSessionHash: challenge.challengerSessionHash,
  ...(challenge.targetHandle ? { friendHandle: challenge.targetHandle } : {}),
  ...(challenge.acceptedCardId
    ? { acceptedCardId: challenge.acceptedCardId }
    : {}),
  ...(challenge.acceptedSessionHash
    ? { acceptedSessionHash: challenge.acceptedSessionHash }
    : {}),
  ...(challenge.result ? { result: challenge.result } : {}),
  credited: challenge.referralCredited,
  createdAt: new Date(challenge.createdAt).toISOString(),
  ...(challenge.completedAt
    ? { completedAt: new Date(challenge.completedAt).toISOString() }
    : {}),
});

export const beginGeneration = mutationGeneric({
  args: {
    secret: v.string(),
    key: v.string(),
    requestHash: v.string(),
    proposedId: v.string(),
    requestId: v.string(),
  },
  handler: async (ctx, args) => {
    requireSecret(args.secret);
    const existing = await ctx.db
      .query("generations")
      .withIndex("by_idempotency_key", (q) => q.eq("idempotencyKey", args.key))
      .unique();
    const now = Date.now();
    if (existing && existing.expiresAt && existing.expiresAt <= now) {
      await ctx.db.delete(existing._id);
    } else if (existing) {
      if (existing.requestHash !== args.requestHash)
        return { status: "conflict" };
      if (existing.status === "completed" && existing.response !== undefined)
        return { status: "complete", response: existing.response };
      return { status: "in_progress" };
    }
    await ctx.db.insert("generations", {
      publicId: args.proposedId,
      sessionHash: "pending",
      status: "pending",
      archetypeVersion: "pending",
      promptVersion: "pending",
      model: "pending",
      requestId: args.requestId,
      retryCount: 0,
      idempotencyKey: args.key,
      requestHash: args.requestHash,
      expiresAt: now + 2 * 60 * 1000,
      createdAt: now,
    });
    return { status: "started", publicId: args.proposedId };
  },
});

export const completeGeneration = mutationGeneric({
  args: { secret: v.string(), key: v.string(), response: v.any() },
  handler: async (ctx, args) => {
    requireSecret(args.secret);
    const generation = await ctx.db
      .query("generations")
      .withIndex("by_idempotency_key", (q) => q.eq("idempotencyKey", args.key))
      .unique();
    if (!generation) return { completed: false };
    await ctx.db.patch(generation._id, {
      status: "completed",
      response: args.response,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      completedAt: Date.now(),
    });
    return { completed: true };
  },
});

export const recordHandleSubmission = mutationGeneric({
  args: {
    secret: v.string(),
    entries: v.array(v.object({ platform: v.string(), handle: v.string() })),
    sessionHash: v.string(),
    requestId: v.string(),
  },
  handler: async (ctx, args) => {
    requireSecret(args.secret);
    const now = Date.now();
    for (const entry of args.entries)
      await ctx.db.insert("handleSubmissions", {
        platform: entry.platform,
        handle: entry.handle,
        sessionHash: args.sessionHash,
        requestId: args.requestId,
        createdAt: now,
      });
    return { recorded: args.entries.length };
  },
});

export const putCard = mutationGeneric({
  args: {
    secret: v.string(),
    id: v.string(),
    record: v.object({
      card: v.any(),
      createdAt: v.string(),
      managementTokenHash: v.string(),
      sessionHash: v.string(),
      generationMeta: v.optional(
        v.object({
          model: v.string(),
          promptVersion: v.string(),
          taxonomyVersion: v.string(),
          durationMs: v.number(),
          retryCount: v.number(),
        }),
      ),
      images: v.optional(
        v.object({
          svgUrl: v.string(),
          pngUrl: v.string(),
          ogUrl: v.string(),
        }),
      ),
      email: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    requireSecret(args.secret);
    const existing = await ctx.db
      .query("generatedCards")
      .withIndex("by_public_id", (q) => q.eq("publicId", args.id))
      .unique();
    if (existing) return { stored: false, duplicate: true };
    await ctx.db.insert("generatedCards", {
      publicId: args.id,
      sessionHash: args.record.sessionHash,
      managementTokenHash: args.record.managementTokenHash,
      handle: args.record.card.handle,
      archetypeId: args.record.card.primaryArchetypeId,
      card: args.record.card,
      researchConfidence: args.record.card.researchConfidence,
      model: args.record.generationMeta?.model ?? "api",
      promptVersion: args.record.generationMeta?.promptVersion ?? "1.2",
      taxonomyVersion:
        args.record.generationMeta?.taxonomyVersion ?? args.record.card.version,
      durationMs: args.record.generationMeta?.durationMs ?? 0,
      retryCount: args.record.generationMeta?.retryCount ?? 0,
      ...(args.record.images
        ? {
            svgUrl: args.record.images.svgUrl,
            pngUrl: args.record.images.pngUrl,
            ogUrl: args.record.images.ogUrl,
          }
        : {}),
      ...(args.record.email ? { email: args.record.email } : {}),
      createdAt: Date.parse(args.record.createdAt),
    });
    return { stored: true, duplicate: false };
  },
});

export const getCard = queryGeneric({
  args: { secret: v.string(), id: v.string() },
  handler: async (ctx, args) => {
    requireSecret(args.secret);
    const card = await ctx.db
      .query("generatedCards")
      .withIndex("by_public_id", (q) => q.eq("publicId", args.id))
      .unique();
    return card ? cardRecord(card) : null;
  },
});

export const saveCard = mutationGeneric({
  args: { secret: v.string(), id: v.string(), email: v.string() },
  handler: async (ctx, args) => {
    requireSecret(args.secret);
    const card = await ctx.db
      .query("generatedCards")
      .withIndex("by_public_id", (q) => q.eq("publicId", args.id))
      .unique();
    if (!card) return { saved: false };
    const now = Date.now();
    let user = await ctx.db
      .query("users")
      .withIndex("by_normalized_email", (q) =>
        q.eq("normalizedEmail", args.email),
      )
      .unique();
    if (!user) {
      const userId = await ctx.db.insert("users", {
        email: args.email,
        normalizedEmail: args.email,
        createdAt: now,
        lastSeenAt: now,
        status: "active",
        source: "card_save",
        consentVersion: "2026-07-12",
        activatedAt: now,
      });
      user = await ctx.db.get(userId);
    } else {
      await ctx.db.patch(user._id, { lastSeenAt: now, activatedAt: now });
    }
    await ctx.db.patch(card._id, {
      email: args.email,
      emailSavedAt: now,
    });
    const aura =
      card.card.stats?.find((stat: any) => stat.key === "aura")?.value ?? 0;
    const existingEntry = await ctx.db
      .query("leaderboard")
      .withIndex("by_card", (q) => q.eq("cardId", args.id))
      .unique();
    const entry = {
      cardId: args.id,
      handle: card.handle,
      aura,
      archetypeId: card.archetypeId,
      eligible: true,
      updatedAt: now,
    };
    if (existingEntry) await ctx.db.patch(existingEntry._id, entry);
    else await ctx.db.insert("leaderboard", entry);
    return { saved: true, userId: user?._id };
  },
});

export const recordShare = mutationGeneric({
  args: { secret: v.string(), cardId: v.string(), channel: v.string() },
  handler: async (ctx, args) => {
    requireSecret(args.secret);
    const card = await ctx.db
      .query("generatedCards")
      .withIndex("by_public_id", (q) => q.eq("publicId", args.cardId))
      .unique();
    if (!card) return { recorded: false };
    await ctx.db.insert("shareEvents", {
      cardId: args.cardId,
      sessionHash: card.sessionHash,
      channel: args.channel,
      createdAt: Date.now(),
    });
    return { recorded: true };
  },
});

export const putChallenge = mutationGeneric({
  args: {
    secret: v.string(),
    slug: v.string(),
    record: v.object({
      cardId: v.string(),
      challengerSessionHash: v.string(),
      friendHandle: v.optional(v.string()),
      acceptedCardId: v.optional(v.string()),
      acceptedSessionHash: v.optional(v.string()),
      result: v.optional(v.any()),
      credited: v.boolean(),
      createdAt: v.string(),
      completedAt: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    requireSecret(args.secret);
    const existing = await ctx.db
      .query("challenges")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (existing) return { stored: false, duplicate: true };
    await ctx.db.insert("challenges", {
      slug: args.slug,
      challengerCardId: args.record.cardId,
      challengerSessionHash: args.record.challengerSessionHash,
      ...(args.record.friendHandle
        ? { targetHandle: args.record.friendHandle }
        : {}),
      status: "pending",
      referralCredited: false,
      createdAt: Date.parse(args.record.createdAt),
    });
    return { stored: true, duplicate: false };
  },
});

export const getChallenge = queryGeneric({
  args: { secret: v.string(), slug: v.string() },
  handler: async (ctx, args) => {
    requireSecret(args.secret);
    const challenge = await ctx.db
      .query("challenges")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    return challenge ? challengeRecord(challenge) : null;
  },
});

export const completeChallenge = mutationGeneric({
  args: {
    secret: v.string(),
    slug: v.string(),
    acceptedCardId: v.string(),
    acceptedSessionHash: v.string(),
    result: v.object({ winnerCardId: v.string(), verdict: v.string() }),
  },
  handler: async (ctx, args) => {
    requireSecret(args.secret);
    const challenge = await ctx.db
      .query("challenges")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (!challenge) return null;
    if (challenge.completedAt) return challengeRecord(challenge);
    if (
      challenge.challengerCardId === args.acceptedCardId ||
      challenge.challengerSessionHash === args.acceptedSessionHash
    )
      throw new Error("Self challenge rejected");
    const challenger = await ctx.db
      .query("generatedCards")
      .withIndex("by_public_id", (q) =>
        q.eq("publicId", challenge.challengerCardId),
      )
      .unique();
    const accepted = await ctx.db
      .query("generatedCards")
      .withIndex("by_public_id", (q) => q.eq("publicId", args.acceptedCardId))
      .unique();
    if (!challenger || !accepted) return null;
    if (
      accepted.sessionHash !== args.acceptedSessionHash ||
      challenger.handle === accepted.handle
    )
      throw new Error("Challenge identity rejected");
    const now = Date.now();
    let credited = false;
    if (challenger.email) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_normalized_email", (q) =>
          q.eq("normalizedEmail", challenger.email!),
        )
        .unique();
      if (user) {
        const idempotencyKey = `challenge:${args.slug}`;
        const existingCredit = await ctx.db
          .query("credits")
          .withIndex("by_idempotency_key", (q) =>
            q.eq("idempotencyKey", idempotencyKey),
          )
          .unique();
        if (!existingCredit) {
          await ctx.db.insert("credits", {
            userId: user._id,
            reason: "qualified_referral",
            amount: 1,
            idempotencyKey,
            createdAt: now,
          });
          credited = true;
        }
      }
    }
    await ctx.db.patch(challenge._id, {
      acceptedCardId: args.acceptedCardId,
      acceptedSessionHash: args.acceptedSessionHash,
      status: "completed",
      result: args.result,
      referralCredited: credited,
      completedAt: now,
    });
    const updated = await ctx.db.get(challenge._id);
    return updated ? challengeRecord(updated) : null;
  },
});

export const countCredits = queryGeneric({
  args: { secret: v.string(), cardId: v.string() },
  handler: async (ctx, args) => {
    requireSecret(args.secret);
    const card = await ctx.db
      .query("generatedCards")
      .withIndex("by_public_id", (q) => q.eq("publicId", args.cardId))
      .unique();
    if (!card?.email) return { count: 0 };
    const user = await ctx.db
      .query("users")
      .withIndex("by_normalized_email", (q) =>
        q.eq("normalizedEmail", card.email!),
      )
      .unique();
    if (!user) return { count: 0 };
    const credits = await ctx.db
      .query("credits")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    return {
      count: credits
        .filter((credit) => credit.reason === "qualified_referral")
        .reduce((total, credit) => total + credit.amount, 0),
    };
  },
});

export const topLeaderboard = queryGeneric({
  args: { secret: v.string(), limit: v.number() },
  handler: async (ctx, args) => {
    requireSecret(args.secret);
    const entries = await ctx.db
      .query("leaderboard")
      .withIndex("by_aura", (q) => q.eq("eligible", true))
      .order("desc")
      .take(Math.min(args.limit, 50));
    return {
      entries: entries.map((entry) => ({
        id: entry.cardId,
        handle: entry.handle,
        archetypeId: entry.archetypeId,
        aura: entry.aura,
      })),
    };
  },
});
