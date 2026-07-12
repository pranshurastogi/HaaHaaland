import { internalMutationGeneric, internalQueryGeneric } from "convex/server";
import { v } from "convex/values";

export const getProgress = internalQueryGeneric({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const credits = await ctx.db
      .query("credits")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    const completed = credits
      .filter((credit) => credit.reason === "qualified_referral")
      .reduce((total, credit) => total + credit.amount, 0);
    return {
      completed,
      varUnlocked: completed >= 1,
      comparisonUnlocked: completed >= 2,
    };
  },
});

export const creditQualifiedReferralInternal = internalMutationGeneric({
  args: {
    challengeSlug: v.string(),
    referrerUserId: v.id("users"),
    idempotencyKey: v.string(),
    requestId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("credits")
      .withIndex("by_idempotency_key", (q) =>
        q.eq("idempotencyKey", args.idempotencyKey),
      )
      .unique();
    if (existing) return { credited: false, duplicate: true };

    const challenge = await ctx.db
      .query("challenges")
      .withIndex("by_slug", (q) => q.eq("slug", args.challengeSlug))
      .unique();
    if (
      !challenge ||
      challenge.status !== "completed" ||
      challenge.referralCredited ||
      !challenge.acceptedSessionHash ||
      challenge.acceptedSessionHash === challenge.challengerSessionHash
    )
      return { credited: false, duplicate: false };

    const now = Date.now();
    await ctx.db.insert("credits", {
      userId: args.referrerUserId,
      reason: "qualified_referral",
      amount: 1,
      idempotencyKey: args.idempotencyKey,
      createdAt: now,
    });
    await ctx.db.patch(challenge._id, { referralCredited: true });
    await ctx.db.insert("auditEvents", {
      actorType: "system",
      action: "referral.credit",
      resourceType: "challenge",
      resourceId: challenge._id,
      requestId: args.requestId,
      metadata: { idempotencyKey: args.idempotencyKey },
      createdAt: now,
    });
    return { credited: true, duplicate: false };
  },
});
