import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

// Internal mutation to save the generated meeting minutes to the database
export const internalSaveMeetingMinutes = internalMutation({
  args: {
    userId: v.string(),
    title: v.string(),
    executiveSummary: v.string(),
    actionMinutes: v.string(),
    attendees: v.array(v.object({ name: v.string(), role: v.string() })),
    decisions: v.array(v.object({ description: v.string(), madeBy: v.string(), date: v.string() })),
    risks: v.array(v.object({ description: v.string(), mitigation: v.string() })),
    actionItems: v.array(v.object({ description: v.string(), owner: v.string(), deadline: v.string() })),
    observations: v.array(v.object({ description: v.string() })),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("meetingMinutes", {
      userId: args.userId,
      title: args.title,
      executiveSummary: args.executiveSummary,
      actionMinutes: args.actionMinutes,
      attendees: args.attendees,
      decisions: args.decisions,
      risks: args.risks,
      actionItems: args.actionItems,
      observations: args.observations,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});