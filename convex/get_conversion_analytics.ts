import { query } from "./_generated/server";
import { v } from "convex/values";

// Query to get conversion analytics
export const getConversionAnalytics = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get all subscription events within the date range
    let events;
    
    if (args.startDate && args.endDate) {
      // Both start and end dates are provided
      events = await ctx.db.query("subscriptionEvents")
        .withIndex("by_timestamp", (q) => 
          q.gte("timestamp", args.startDate!).lte("timestamp", args.endDate!)
        )
        .collect();
    } else if (args.startDate) {
      // Only start date is provided
      events = await ctx.db.query("subscriptionEvents")
        .withIndex("by_timestamp", (q) => 
          q.gte("timestamp", args.startDate!)
        )
        .collect();
    } else if (args.endDate) {
      // Only end date is provided
      events = await ctx.db.query("subscriptionEvents")
        .withIndex("by_timestamp", (q) => 
          q.lte("timestamp", args.endDate!)
        )
        .collect();
    } else {
      // No date range specified, get all events
      events = await ctx.db.query("subscriptionEvents").collect();
    }
    
    // Calculate conversion metrics
    let totalConversions = 0;
    let totalCancellations = 0;
    let totalExpirations = 0;
    let totalRenewals = 0;
    let uniqueUsersConverted = new Set<string>();
    let uniqueUsersCancelled = new Set<string>();
    
    // Track conversion events over time
    const conversionsOverTime: Record<string, number> = {};
    const cancellationsOverTime: Record<string, number> = {};
    
    for (const event of events) {
      const dateKey = new Date(event.timestamp).toISOString().split('T')[0]; // YYYY-MM-DD
      
      switch (event.eventType) {
        case "conversion":
          totalConversions++;
          uniqueUsersConverted.add(event.userId);
          conversionsOverTime[dateKey] = (conversionsOverTime[dateKey] || 0) + 1;
          break;
        case "cancellation":
          totalCancellations++;
          uniqueUsersCancelled.add(event.userId);
          cancellationsOverTime[dateKey] = (cancellationsOverTime[dateKey] || 0) + 1;
          break;
        case "expiration":
          totalExpirations++;
          break;
        case "renewal":
          totalRenewals++;
          break;
      }
    }
    
    // Calculate conversion rate
    const freeUsers = await ctx.db.query("users")
      .filter((q) => q.neq(q.field("plan"), "pro"))
      .collect();
    const totalFreeUsers = freeUsers.length;
      
    const conversionRate = totalFreeUsers > 0 ? (totalConversions / totalFreeUsers) * 100 : 0;
    
    // Calculate churn rate
    const proUsers = await ctx.db.query("users")
      .filter((q) => q.eq(q.field("plan"), "pro"))
      .collect();
    const totalProUsers = proUsers.length;
      
    const churnRate = totalProUsers > 0 ? ((totalCancellations + totalExpirations) / totalProUsers) * 100 : 0;
    
    // Calculate retention rate
    const retentionRate = totalProUsers > 0 ? (totalRenewals / totalProUsers) * 100 : 0;
    
    return {
      totalConversions,
      totalCancellations,
      totalExpirations,
      totalRenewals,
      uniqueUsersConverted: uniqueUsersConverted.size,
      uniqueUsersCancelled: uniqueUsersCancelled.size,
      conversionRate,
      churnRate,
      retentionRate,
      conversionsOverTime,
      cancellationsOverTime,
    };
  },
});