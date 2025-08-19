import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Mutation to create a shareable link for meeting minutes
export const createShareableLink = mutation({
  args: {
    minutesId: v.id("meetingMinutes"),
    userId: v.string(),
    expiresInDays: v.optional(v.number()), // Optional expiration in days
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
    
    // Generate a unique share ID
    const shareId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    // Calculate expiration time if provided
    let expiresAt: number | undefined;
    if (args.expiresInDays) {
      expiresAt = Date.now() + (args.expiresInDays * 24 * 60 * 60 * 1000);
    }
    
    // Create the shareable link record
    const shareLinkId = await ctx.db.insert("shareableLinks", {
      minutesId: args.minutesId,
      userId: args.userId,
      shareId: shareId,
      expiresAt: expiresAt,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Generate the shareable URL
    // Use NEXT_PUBLIC_BASE_URL environment variable or fallback to localhost for development
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const shareableUrl = `${baseUrl}/shared/${shareId}`;
    
    return {
      success: true,
      shareLinkId,
      shareableUrl,
      shareId,
      expiresAt,
    };
  },
});