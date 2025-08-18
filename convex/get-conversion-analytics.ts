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
    let eventsQuery = ctx.db.query("subscriptionEvents");
    
    if (args.startDate) {
      eventsQuery = eventsQuery.withIndex("by_timestamp", (q) => 
        q.gte("timestamp", args.startDate)
      );
    }
    
    if (args.endDate) {
      eventsQuery = eventsQuery.withIndex("by_timestamp", (q) => 
        q.lte("timestamp", args.endDate)
      );
    }
    
    const events = await eventsQuery.collect();
    
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
    const totalFreeUsers = await ctx.db.query("users")
      .withIndex("by_userId", (q) => q.neq("plan", "pro")) // Simplified query
      .collect()
      .then(users => users.length);
      
    const conversionRate = totalFreeUsers > 0 ? (totalConversions / totalFreeUsers) * 100 : 0;
    
    // Calculate churn rate
    const totalProUsers = await ctx.db.query("users")
      .withIndex("by_userId", (q) => q.eq("plan", "pro"))
      .collect()
      .then(users => users.length);
      
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