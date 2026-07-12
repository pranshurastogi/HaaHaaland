import { queryGeneric } from "convex/server";
import { v } from "convex/values";
export const top = queryGeneric({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 20, 50);
    return ctx.db
      .query("leaderboard")
      .withIndex("by_aura", (q) => q.eq("eligible", true))
      .order("desc")
      .take(limit);
  },
});
