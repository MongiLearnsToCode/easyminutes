import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Mutation to create a shareable link for meeting minutes
export const createShareableLink = mutation({
  args: {
    minutesId: v.id("meetingMinutes"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify the user owns these minutes
    const minutes = await ctx.db.get(args.minutesId);
    
    if (!minutes) {
      throw new Error("Meeting minutes not found");
    }
    
    if (minutes.userId !== args.userId) {
      throw new Error("User does not have permission to share these minutes");
    }
    
    // Create a shareable link (in a real implementation, this would be more complex)
    // For now, we'll just return the minutes ID as the "shareable link"
    const shareableLink = `${ctx.host}/shared/${args.minutesId}`;
    
    // In a real implementation, we would store this in the database
    // and set an expiration time, etc.
    
    return {
      success: true,
      shareableLink,
    };
  },
});