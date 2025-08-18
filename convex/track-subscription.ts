import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Mutation to track subscription events (conversions, cancellations, etc.)
export const trackSubscriptionEvent = mutation({
  args: {
    userId: v.string(),
    eventType: v.union(
      v.literal("conversion"), // Free user converted to Pro
      v.literal("cancellation"), // Pro user cancelled subscription
      v.literal("expiration"), // Pro subscription expired
      v.literal("renewal") // Pro subscription renewed
    ),
    previousPlan: v.union(v.literal("free"), v.literal("pro")),
    newPlan: v.union(v.literal("free"), v.literal("pro")),
    timestamp: v.number(),
  },
  handler: async (ctx, args) => {
    try {
      // Record the subscription event
      const eventId = await ctx.db.insert("subscriptionEvents", {
        userId: args.userId,
        eventType: args.eventType,
        previousPlan: args.previousPlan,
        newPlan: args.newPlan,
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
        
        // Track conversion events
        if (args.eventType === "conversion") {
          updates.proConversions = (userAnalytics.proConversions || 0) + 1;
          updates.firstProConversionAt = userAnalytics.firstProConversionAt || args.timestamp;
        }
        
        await ctx.db.patch(userAnalytics._id, updates);
      } else {
        // Create new analytics record if it doesn't exist
        await ctx.db.insert("userAnalytics", {
          userId: args.userId,
          totalGenerations: 0,
          successfulGenerations: 0,
          failedGenerations: 0,
          totalProcessingTimeMs: 0,
          under2MinuteGenerations: 0,
          proConversions: args.eventType === "conversion" ? 1 : 0,
          firstProConversionAt: args.eventType === "conversion" ? args.timestamp : undefined,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }
      
      return {
        success: true,
        eventId,
      };
    } catch (error) {
      console.error("Error tracking subscription event:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to track subscription event",
      };
    }
  },
});