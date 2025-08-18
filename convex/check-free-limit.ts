import { query } from "./_generated/server";
import { v } from "convex/values";

// Query to check if a user has reached their free generation limit
export const checkFreeGenerationLimit = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get the user profile
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
      
    if (!user) {
      return {
        canGenerate: false,
        reason: "User not found",
        freeGenerationsUsed: 0,
        limit: 3,
      };
    }
    
    // Pro users always have unlimited generations
    if (user.plan === "pro") {
      return {
        canGenerate: true,
        reason: "Pro user",
        freeGenerationsUsed: user.freeGenerationsUsed || 0,
        limit: 3,
      };
    }
    
    // For free users, check if they've reached the limit
    const freeGenerationsUsed = user.freeGenerationsUsed || 0;
    const limitReached = freeGenerationsUsed >= 3;
    
    return {
      canGenerate: !limitReached,
      reason: limitReached ? "Free generation limit reached" : "Within limit",
      freeGenerationsUsed,
      limit: 3,
    };
  },
});