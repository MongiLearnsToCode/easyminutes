import { query } from "./_generated/server";
import { v } from "convex/values";

// Query to get shared meeting minutes by share ID
export const getSharedMeetingMinutes = query({
  args: {
    shareId: v.string(),
  },
  handler: async (ctx, args) => {
    // Find the shareable link record
    const shareableLink = await ctx.db
      .query("shareableLinks")
      .withIndex("by_shareId", (q) => q.eq("shareId", args.shareId))
      .unique();
      
    if (!shareableLink) {
      throw new Error("Shareable link not found");
    }
    
    // Check if the link has expired
    if (shareableLink.expiresAt && shareableLink.expiresAt < Date.now()) {
      throw new Error("Shareable link has expired");
    }
    
    // Get the meeting minutes
    const minutes = await ctx.db.get(shareableLink.minutesId);
    
    if (!minutes) {
      throw new Error("Meeting minutes not found");
    }
    
    return {
      minutes,
      shareableLink,
    };
  },
});