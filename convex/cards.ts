import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";
export const getPublic = query({
  args: { publicId: v.string() },
  handler: async (ctx, args) => {
    const card = await ctx.db
      .query("generatedCards")
      .withIndex("by_public_id", (q) => q.eq("publicId", args.publicId))
      .unique();
    if (!card) return null;
    return {
      publicId: card.publicId,
      handle: card.handle,
      card: card.card,
      researchConfidence: card.researchConfidence,
      createdAt: card.createdAt,
    };
  },
});
export const storeInternal = internalMutation({
  args: {
    publicId: v.string(),
    sessionId: v.string(),
    handle: v.string(),
    archetypeId: v.string(),
    card: v.any(),
    researchConfidence: v.number(),
    model: v.string(),
    promptVersion: v.string(),
    taxonomyVersion: v.string(),
    durationMs: v.number(),
    retryCount: v.number(),
  },
  handler: async (ctx, args) =>
    ctx.db.insert("generatedCards", { ...args, createdAt: Date.now() }),
});
export const markViewedInternal = internalMutation({
  args: { publicId: v.string() },
  handler: async (ctx, args) => {
    const card = await ctx.db
      .query("generatedCards")
      .withIndex("by_public_id", (q) => q.eq("publicId", args.publicId))
      .unique();
    if (card && !card.viewedAt)
      await ctx.db.patch(card._id, { viewedAt: Date.now() });
  },
});
