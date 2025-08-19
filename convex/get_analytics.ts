import { query } from "./_generated/server";
import { v } from "convex/values";

// Query to get user analytics
export const getUserAnalytics = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const analytics = await ctx.db
      .query("userAnalytics")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
      
    return analytics || null;
  },
});

// Query to get overall analytics (for admin dashboard)
export const getOverallAnalytics = query({
  args: {},
  handler: async (ctx) => {
    // Get all user analytics records
    const allAnalytics = await ctx.db.query("userAnalytics").collect();
    
    // Calculate overall metrics
    let totalUsers = 0;
    let totalGenerations = 0;
    let successfulGenerations = 0;
    let under2MinuteGenerations = 0;
    let totalProcessingTimeMs = 0;
    
    for (const analytics of allAnalytics) {
      totalUsers++;
      totalGenerations += analytics.totalGenerations || 0;
      successfulGenerations += analytics.successfulGenerations || 0;
      under2MinuteGenerations += analytics.under2MinuteGenerations || 0;
      totalProcessingTimeMs += analytics.totalProcessingTimeMs || 0;
    }
    
    // Calculate percentages
    const successRate = totalGenerations > 0 ? (successfulGenerations / totalGenerations) * 100 : 0;
    const under2MinuteRate = successfulGenerations > 0 ? (under2MinuteGenerations / successfulGenerations) * 100 : 0;
    const averageProcessingTime = successfulGenerations > 0 ? totalProcessingTimeMs / successfulGenerations : 0;
    
    return {
      totalUsers,
      totalGenerations,
      successfulGenerations,
      successRate,
      under2MinuteGenerations,
      under2MinuteRate,
      averageProcessingTime,
    };
  },
});