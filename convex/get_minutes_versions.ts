import { query } from "./_generated/server";
import { v } from "convex/values";

// Query to get all versions of meeting minutes
export const getMeetingMinutesVersions = query({
  args: {
    minutesId: v.id("meetingMinutes"),
  },
  handler: async (ctx, args) => {
    // First, get the minutes document by ID
    const minutes = await ctx.db.get(args.minutesId);
    
    if (!minutes) {
      return [];
    }
    
    let parentId: string;
    
    // Determine the parent ID
    if (minutes.parentId) {
      parentId = minutes.parentId;
    } else {
      parentId = args.minutesId;
    }
    
    // Get all versions with the same parentId
    const versions = await ctx.db
      .query("meetingMinutes")
      .withIndex("by_parentId", (q) => q.eq("parentId", parentId))
      .collect();
    
    // Also get the original version (the one with no parentId or its own ID as parentId)
    const originalVersion = await ctx.db
      .query("meetingMinutes")
      .filter((q) => q.eq(q.field("_id"), parentId))
      .unique();
    
    // Combine all versions and sort by version number
    const allVersions = originalVersion 
      ? [originalVersion, ...versions] 
      : versions;
      
    return allVersions.sort((a, b) => (a.version || 1) - (b.version || 1));
  },
});