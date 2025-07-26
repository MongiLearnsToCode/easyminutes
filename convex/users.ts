import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create or update user from Clerk webhook
export const upsertUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    const now = Date.now();

    if (existingUser) {
      // Update existing user
      await ctx.db.patch(existingUser._id, {
        email: args.email,
        firstName: args.firstName,
        lastName: args.lastName,
        imageUrl: args.imageUrl,
        updatedAt: now,
      });
      return existingUser._id;
    } else {
      // Create new user with default values
      const userId = await ctx.db.insert("users", {
        clerkId: args.clerkId,
        email: args.email,
        firstName: args.firstName,
        lastName: args.lastName,
        imageUrl: args.imageUrl,
        subscriptionTier: "free",
        subscriptionStatus: "active",
        monthlyTranscriptions: 0,
        storageUsedMB: 0,
        lastUsageReset: now,
        notificationPreferences: {
          emailOnTranscriptionComplete: true,
          emailOnShareAccess: true,
          emailOnSubscriptionUpdates: true,
          inAppNotifications: true,
        },
        createdAt: now,
        updatedAt: now,
      });
      return userId;
    }
  },
});

// Get user by Clerk ID
export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();
  },
});

// Get user profile
export const getUserProfile = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

// Update user profile
export const updateUserProfile = mutation({
  args: {
    userId: v.id("users"),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    defaultTemplateId: v.optional(v.id("templates")),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;
    await ctx.db.patch(userId, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Update notification preferences
export const updateNotificationPreferences = mutation({
  args: {
    userId: v.id("users"),
    preferences: v.object({
      emailOnTranscriptionComplete: v.boolean(),
      emailOnShareAccess: v.boolean(),
      emailOnSubscriptionUpdates: v.boolean(),
      inAppNotifications: v.boolean(),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      notificationPreferences: args.preferences,
      updatedAt: Date.now(),
    });
  },
});

// Update subscription information (called from Polar.sh webhook)
export const updateSubscription = mutation({
  args: {
    userId: v.id("users"),
    subscriptionTier: v.union(v.literal("free"), v.literal("pro"), v.literal("business")),
    subscriptionStatus: v.union(v.literal("active"), v.literal("inactive"), v.literal("canceled")),
    subscriptionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, ...subscriptionData } = args;
    await ctx.db.patch(userId, {
      ...subscriptionData,
      updatedAt: Date.now(),
    });
  },
});

// Check if user can transcribe (within limits)
export const canUserTranscribe = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return false;

    // Reset monthly usage if needed
    const now = Date.now();
    const oneMonthAgo = now - (30 * 24 * 60 * 60 * 1000);
    
    if (user.lastUsageReset < oneMonthAgo) {
      await ctx.db.patch(args.userId, {
        monthlyTranscriptions: 0,
        lastUsageReset: now,
        updatedAt: now,
      });
      return true;
    }

    // Check limits based on tier
    switch (user.subscriptionTier) {
      case "free":
        return user.monthlyTranscriptions < 5;
      case "pro":
      case "business":
        return true; // unlimited
      default:
        return false;
    }
  },
});

// Increment transcription usage
export const incrementTranscriptionUsage = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    await ctx.db.patch(args.userId, {
      monthlyTranscriptions: user.monthlyTranscriptions + 1,
      updatedAt: Date.now(),
    });
  },
});

// Update storage usage
export const updateStorageUsage = mutation({
  args: {
    userId: v.id("users"),
    additionalMB: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    const newStorageUsed = user.storageUsedMB + args.additionalMB;
    
    await ctx.db.patch(args.userId, {
      storageUsedMB: newStorageUsed,
      updatedAt: Date.now(),
    });

    // Check storage limits and create notification if needed
    const storageLimit = getStorageLimit(user.subscriptionTier);
    if (newStorageUsed > storageLimit * 0.8) { // 80% warning
      await ctx.db.insert("notifications", {
        userId: args.userId,
        type: "storage_limit_warning",
        title: "Storage Limit Warning",
        message: `You've used ${Math.round((newStorageUsed / storageLimit) * 100)}% of your storage limit.`,
        isRead: false,
        createdAt: Date.now(),
      });
    }
  },
});

// Check if user has storage space
export const canUserUpload = query({
  args: { 
    userId: v.id("users"),
    fileSizeMB: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return false;

    const storageLimit = getStorageLimit(user.subscriptionTier);
    return (user.storageUsedMB + args.fileSizeMB) <= storageLimit;
  },
});

// Get user usage statistics
export const getUserUsageStats = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;

    const storageLimit = getStorageLimit(user.subscriptionTier);
    const transcriptionLimit = getTranscriptionLimit(user.subscriptionTier);

    return {
      subscriptionTier: user.subscriptionTier,
      monthlyTranscriptions: user.monthlyTranscriptions,
      transcriptionLimit,
      storageUsedMB: user.storageUsedMB,
      storageLimit,
      lastUsageReset: user.lastUsageReset,
    };
  },
});

// Delete user account and all associated data
export const deleteUserAccount = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) return;

    // Delete all user's meetings
    const meetings = await ctx.db
      .query("meetings")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    for (const meeting of meetings) {
      // Delete action items for this meeting
      const actionItems = await ctx.db
        .query("actionItems")
        .withIndex("by_meeting", (q) => q.eq("meetingId", meeting._id))
        .collect();
      
      for (const actionItem of actionItems) {
        await ctx.db.delete(actionItem._id);
      }

      // Delete share access logs
      const accessLogs = await ctx.db
        .query("shareAccessLogs")
        .withIndex("by_meeting", (q) => q.eq("meetingId", meeting._id))
        .collect();
      
      for (const log of accessLogs) {
        await ctx.db.delete(log._id);
      }

      // Delete the meeting
      await ctx.db.delete(meeting._id);
    }

    // Delete user's templates
    const templates = await ctx.db
      .query("templates")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    for (const template of templates) {
      await ctx.db.delete(template._id);
    }

    // Delete notifications
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    for (const notification of notifications) {
      await ctx.db.delete(notification._id);
    }

    // Finally delete the user
    await ctx.db.delete(user._id);
  },
});

// Helper functions for subscription limits
function getStorageLimit(tier: "free" | "pro" | "business"): number {
  switch (tier) {
    case "free":
      return 100; // 100MB
    case "pro":
      return 10 * 1024; // 10GB
    case "business":
      return 100 * 1024; // 100GB
    default:
      return 100;
  }
}

function getTranscriptionLimit(tier: "free" | "pro" | "business"): number | null {
  switch (tier) {
    case "free":
      return 5;
    case "pro":
    case "business":
      return null; // unlimited
    default:
      return 5;
  }
}
