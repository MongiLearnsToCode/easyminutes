import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Mutation to track processing time for meeting minutes generation
export const trackProcessingTime = mutation({
  args: {
    userId: v.string(),
    processingTimeMs: v.number(),
    success: v.boolean(),
    inputType: v.union(v.literal("text"), v.literal("file"), v.literal("audio")),
  },
  handler: async (ctx, args) => {
    try {
      // Record the processing time event
      const eventId = await ctx.db.insert("processingTimeEvents", {
        userId: args.userId,
        processingTimeMs: args.processingTimeMs,
        success: args.success,
        inputType: args.inputType,
        timestamp: Date.now(),
      });
      
      // Update user's analytics data
      const userAnalytics = await ctx.db
        .query("userAnalytics")
        .withIndex("by_userId", (q) => q.eq("userId", args.userId))
        .unique();
      
      if (userAnalytics) {
        // Update existing analytics record
        const updates: any = {
          totalGenerations: (userAnalytics.totalGenerations || 0) + 1,
          totalProcessingTimeMs: (userAnalytics.totalProcessingTimeMs || 0) + args.processingTimeMs,
          updatedAt: Date.now(),
        };
        
        if (args.success) {
          updates.successfulGenerations = (userAnalytics.successfulGenerations || 0) + 1;
          
          // Track if this generation was under 2 minutes (120,000 ms)
          if (args.processingTimeMs < 120000) {
            updates.under2MinuteGenerations = (userAnalytics.under2MinuteGenerations || 0) + 1;
          }
        } else {
          updates.failedGenerations = (userAnalytics.failedGenerations || 0) + 1;
        }
        
        await ctx.db.patch(userAnalytics._id, updates);
      } else {
        // Create new analytics record
        await ctx.db.insert("userAnalytics", {
          userId: args.userId,
          totalGenerations: 1,
          successfulGenerations: args.success ? 1 : 0,
          failedGenerations: args.success ? 0 : 1,
          totalProcessingTimeMs: args.processingTimeMs,
          under2MinuteGenerations: args.success && args.processingTimeMs < 120000 ? 1 : 0,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }
      
      return {
        success: true,
        eventId,
      };
    } catch (error) {
      console.error("Error tracking processing time:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to track processing time",
      };
    }
  },
});