import { mutation } from "./_generated/server";
import { query } from "./_generated/server";
import { v } from "convex/values";

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
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
      
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
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
      
    return user;
  },
});