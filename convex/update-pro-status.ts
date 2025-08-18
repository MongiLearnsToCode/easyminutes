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
    
    // Update the user's metadata in Clerk
    try {
      // In a real implementation, we would make an HTTP request to our API endpoint
      // that uses the Clerk SDK to update the user's public metadata
      // 
      // Example:
      // await fetch(`${ctx.host}/api/clerk/update-metadata`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ userId: args.userId, plan: args.isPro ? "pro" : "free" })
      // });
    } catch (error) {
      console.error('Error updating user metadata in Clerk:', error);
      // We don't throw an error here because the database update was successful
    }
    
    return {
      success: true,
      userId: args.userId,
      plan: args.isPro ? "pro" : "free",
    };
  },
});