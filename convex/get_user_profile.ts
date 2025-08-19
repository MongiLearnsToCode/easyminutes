import { query } from "./_generated/server";
import { v } from "convex/values";

// API endpoint to get user profile
export const getUserProfile = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
      
    return user;
  },
});