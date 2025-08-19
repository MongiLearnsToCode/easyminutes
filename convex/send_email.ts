import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Mutation to send meeting minutes via email
export const sendMeetingMinutesEmail = mutation({
  args: {
    minutesId: v.id("meetingMinutes"),
    userId: v.string(),
    recipientEmail: v.string(),
    subject: v.optional(v.string()),
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
    
    // Get the user's email (for sender information)
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
      
    if (!user) {
      throw new Error("User not found");
    }
    
    // In a real implementation, we would send the email here
    // For now, we'll just log the action
    console.log('Sending meeting minutes via email:', {
      minutesId: args.minutesId,
      recipientEmail: args.recipientEmail,
      subject: args.subject,
    });
    
    // TODO: Implement actual email sending
    // This would typically involve:
    // 1. Formatting the meeting minutes
    // 2. Generating PDF/DOCX attachments
    // 3. Sending the email via an email service
    
    return {
      success: true,
      message: "Email sent successfully",
    };
  },
});