import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Mutation to track user activity (when a user generates meeting minutes)
export const trackUserActivity = mutation({
  args: {
    userId: v.string(),
    activityType: v.union(
      v.literal("generate_minutes"),
      v.literal("edit_minutes"),
      v.literal("export_minutes"),
      v.literal("share_minutes"),
      v.literal("email_minutes")
    ),
    timestamp: v.number(),
  },
  handler: async (ctx, args) => {
    try {
      // Record the user activity event
      const eventId = await ctx.db.insert("userActivityEvents", {
        userId: args.userId,
        activityType: args.activityType,
        timestamp: args.timestamp,
      });
      
      // Update user's analytics data
      const userAnalytics = await ctx.db
        .query("userAnalytics")
        .withIndex("by_userId", (q) => q.eq("userId", args.userId))
        .unique();
      
      if (userAnalytics) {
        // Update existing analytics record
        const updates: any = {
          updatedAt: Date.now(),
        };
        
        // Track different activity types
        switch (args.activityType) {
          case "generate_minutes":
            updates.totalGenerations = (userAnalytics.totalGenerations || 0) + 1;
            break;
          case "edit_minutes":
            updates.totalEdits = (userAnalytics.totalEdits || 0) + 1;
            break;
          case "export_minutes":
            updates.totalExports = (userAnalytics.totalExports || 0) + 1;
            break;
          case "share_minutes":
            updates.totalShares = (userAnalytics.totalShares || 0) + 1;
            break;
          case "email_minutes":
            updates.totalEmails = (userAnalytics.totalEmails || 0) + 1;
            break;
        }
        
        await ctx.db.patch(userAnalytics._id, updates);
      } else {
        // Create new analytics record if it doesn't exist
        const baseAnalytics: any = {
          userId: args.userId,
          totalGenerations: 0,
          successfulGenerations: 0,
          failedGenerations: 0,
          totalProcessingTimeMs: 0,
          under2MinuteGenerations: 0,
          proConversions: 0,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        
        // Track the specific activity type
        switch (args.activityType) {
          case "generate_minutes":
            baseAnalytics.totalGenerations = 1;
            break;
          case "edit_minutes":
            baseAnalytics.totalEdits = 1;
            break;
          case "export_minutes":
            baseAnalytics.totalExports = 1;
            break;
          case "share_minutes":
            baseAnalytics.totalShares = 1;
            break;
          case "email_minutes":
            baseAnalytics.totalEmails = 1;
            break;
        }
        
        await ctx.db.insert("userAnalytics", baseAnalytics);
      }
      
      return {
        success: true,
        eventId,
      };
    } catch (error) {
      console.error("Error tracking user activity:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to track user activity",
      };
    }
  },
});