import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { validateAndNormalizeMeetingMinutes } from "./utils/meeting-minutes-validator";

// Mutation to save edited meeting minutes with versioning
export const saveEditedMeetingMinutes = mutation({
  args: {
    originalMinutesId: v.id("meetingMinutes"),
    editedMinutes: v.any(), // The edited meeting minutes object
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get the original meeting minutes
    const originalMinutes = await ctx.db.get(args.originalMinutesId);
    
    if (!originalMinutes) {
      throw new Error("Original meeting minutes not found");
    }
    
    if (originalMinutes.userId !== args.userId) {
      throw new Error("User does not have permission to edit these minutes");
    }
    
    // Validate and normalize the edited minutes
    const normalizedMinutes = validateAndNormalizeMeetingMinutes(args.editedMinutes);
    
    // Create a new version
    const newVersion = (originalMinutes.version || 1) + 1;
    
    // Mark the original as not latest
    await ctx.db.patch(args.originalMinutesId, {
      isLatest: false,
      updatedAt: Date.now(),
    });
    
    // Insert the new version
    const newMinutesId = await ctx.db.insert("meetingMinutes", {
      userId: args.userId,
      title: normalizedMinutes.title,
      executiveSummary: normalizedMinutes.executiveSummary,
      actionMinutes: normalizedMinutes.actionMinutes,
      attendees: normalizedMinutes.attendees,
      decisions: normalizedMinutes.decisions,
      risks: normalizedMinutes.risks,
      actionItems: normalizedMinutes.actionItems,
      observations: normalizedMinutes.observations,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      version: newVersion,
      parentId: args.originalMinutesId,
      isLatest: true,
    });
    
    return {
      success: true,
      minutesId: newMinutesId,
      version: newVersion,
    };
  },
});