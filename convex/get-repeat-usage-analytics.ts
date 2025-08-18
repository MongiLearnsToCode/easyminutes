import { query } from "./_generated/server";
import { v } from "convex/values";

// Query to get repeat usage analytics
export const getRepeatUsageAnalytics = query({
  args: {
    days: v.number(), // Number of days to look back (e.g., 7 for weekly)
  },
  handler: async (ctx, args) => {
    // Calculate the cutoff date
    const cutoffDate = Date.now() - (args.days * 24 * 60 * 60 * 1000);
    
    // Get all user activity events within the time period
    const recentActivities = await ctx.db
      .query("userActivityEvents")
      .withIndex("by_timestamp", (q) => q.gte("timestamp", cutoffDate))
      .collect();
    
    // Group activities by user
    const userActivities: Record<string, Array<{activityType: string, timestamp: number}>> = {};
    
    for (const activity of recentActivities) {
      if (!userActivities[activity.userId]) {
        userActivities[activity.userId] = [];
      }
      userActivities[activity.userId].push({
        activityType: activity.activityType,
        timestamp: activity.timestamp,
      });
    }
    
    // Calculate repeat usage metrics
    let totalActiveUsers = 0;
    let repeatUsers = 0;
    let highlyEngagedUsers = 0; // Users with 5+ activities
    
    // Track activity distribution
    const activityDistribution: Record<string, number> = {
      generate_minutes: 0,
      edit_minutes: 0,
      export_minutes: 0,
      share_minutes: 0,
      email_minutes: 0,
    };
    
    // Track daily active users
    const dailyActiveUsers: Record<string, Set<string>> = {};
    
    // Process each user's activities
    for (const [userId, activities] of Object.entries(userActivities)) {
      totalActiveUsers++;
      
      // Count activities by type
      for (const activity of activities) {
        activityDistribution[activity.activityType] = 
          (activityDistribution[activity.activityType] || 0) + 1;
        
        // Track daily active users
        const dateKey = new Date(activity.timestamp).toISOString().split('T')[0]; // YYYY-MM-DD
        if (!dailyActiveUsers[dateKey]) {
          dailyActiveUsers[dateKey] = new Set();
        }
        dailyActiveUsers[dateKey].add(userId);
      }
      
      // Check if user is a repeat user (has more than 1 activity)
      if (activities.length > 1) {
        repeatUsers++;
      }
      
      // Check if user is highly engaged (5+ activities)
      if (activities.length >= 5) {
        highlyEngagedUsers++;
      }
    }
    
    // Calculate metrics
    const repeatUsageRate = totalActiveUsers > 0 ? (repeatUsers / totalActiveUsers) * 100 : 0;
    const highlyEngagedRate = totalActiveUsers > 0 ? (highlyEngagedUsers / totalActiveUsers) * 100 : 0;
    
    // Calculate average activities per user
    const totalActivities = recentActivities.length;
    const avgActivitiesPerUser = totalActiveUsers > 0 ? totalActivities / totalActiveUsers : 0;
    
    // Calculate daily averages
    const dailyAverages = Object.values(dailyActiveUsers).map(set => set.size);
    const avgDailyActiveUsers = dailyAverages.length > 0 
      ? dailyAverages.reduce((sum, count) => sum + count, 0) / dailyAverages.length 
      : 0;
    
    return {
      totalActiveUsers,
      repeatUsers,
      repeatUsageRate,
      highlyEngagedUsers,
      highlyEngagedRate,
      totalActivities,
      avgActivitiesPerUser,
      avgDailyActiveUsers,
      activityDistribution,
      dailyActiveUsers: Object.keys(dailyActiveUsers).length,
    };
  },
});