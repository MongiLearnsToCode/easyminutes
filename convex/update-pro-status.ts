import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Mutation to update a user's Pro status
export const updateUserProStatus = mutation({
  args: {
    userId: v.string(),
    isPro: v.boolean(),
    customerId: v.optional(v.string()),
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
    
    // Update the user's plan and customer ID
    await ctx.db.patch(user._id, {
      plan: args.isPro ? "pro" : "free",
      customerId: args.customerId,
      updatedAt: Date.now(),
    });
    
    return {
      success: true,
      userId: args.userId,
      plan: args.isPro ? "pro" : "free",
    };
  },
});