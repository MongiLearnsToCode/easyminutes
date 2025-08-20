import { query } from "./_generated/server";
import { v } from "convex/values";

// Query to get the latest version of meeting minutes by ID
export const getLatestMeetingMinutesById = query({
  args: {
    minutesId: v.id("meetingMinutes"),
  },
  handler: async (ctx, args) => {
    // First, get the minutes document by ID
    const minutes = await ctx.db.get(args.minutesId);
    
    if (!minutes) {
      return null;
    }
    
    // If this is already the latest version, return it
    if (minutes.isLatest) {
      return minutes;
    }
    
    // If this is not the latest version, find the latest version
    if (minutes.parentId) {
      // This is a child version, find the latest version with the same parentId
      const latestVersion = await ctx.db
        .query("meetingMinutes")
        .withIndex("by_parentId", (q) => q.eq("parentId", minutes.parentId))
        .filter((q) => q.eq(q.field("isLatest"), true))
        .unique();
      
      return latestVersion || minutes;
    } else {
      // This is a parent version, find the latest child version
      const latestVersion = await ctx.db
        .query("meetingMinutes")
        .withIndex("by_parentId", (q) => q.eq("parentId", args.minutesId))
        .filter((q) => q.eq(q.field("isLatest"), true))
        .unique();
      
      return latestVersion || minutes;
    }
  },
});