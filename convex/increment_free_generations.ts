import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Mutation to increment the free generations count for a user
export const incrementFreeGenerations = mutation({
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
      throw new Error("User not found");
    }
    
    // Only increment for free users
    if (user.plan === "free") {
      const newCount = (user.freeGenerationsUsed || 0) + 1;
      
      // Update the user profile
      await ctx.db.patch(user._id, {
        freeGenerationsUsed: newCount,
        updatedAt: Date.now(),
      });
      
      return {
        success: true,
        freeGenerationsUsed: newCount,
        limitReached: newCount >= 3,
      };
    }
    
    // For pro users, we don't need to track generations
    return {
      success: true,
      freeGenerationsUsed: user.freeGenerationsUsed || 0,
      limitReached: false,
    };
  },
});