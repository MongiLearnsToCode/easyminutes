import { mutation } from "./_generated/server";
import { query } from "./_generated/server";
import { v } from "convex/values";

// Helper function to get user profile, exported for use in other modules
export const getUserProfile = async (ctx: any, args: { userId: string }) => {
  return await ctx.db
    .query("users") // Correct table name
    .withIndex("by_userId", (q: any) => q.eq("userId", args.userId))
    .unique();
};

// Define the user profile type
export type UserProfile = {
  userId: string;
  email: string;
  name: string;
  plan: "free" | "pro";
  freeGenerationsUsed?: number;
  createdAt: number;
  updatedAt: number;
};

// Mutation to create or update a user profile
export const storeUserProfile = mutation({
  args: {
    userId: v.string(),
    email: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await getUserProfile(ctx, { userId: args.userId });
      
    const timestamp = Date.now();
    
    if (existingUser) {
      // Update existing user
      await ctx.db.patch(existingUser._id, {
        email: args.email,
        name: args.name,
        updatedAt: timestamp,
      });
      return existingUser._id;
    } else {
      // Create new user with free plan by default
      const userId = await ctx.db.insert("users", {
        userId: args.userId,
        email: args.email,
        name: args.name,
        plan: "free",
        freeGenerationsUsed: 0,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
      return userId;
    }
  },
});

// Query to get a user profile by userId
export const getUserProfileByUserId = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.userId) {
      return null;
    }
    // Use the helper function for consistency
    return await getUserProfile(ctx, args);
  },
});