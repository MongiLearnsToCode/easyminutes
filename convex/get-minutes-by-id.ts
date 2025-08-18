import { query } from "./_generated/server";
import { v } from "convex/values";

// Query to get meeting minutes by ID
export const getMeetingMinutesById = query({
  args: {
    minutesId: v.id("meetingMinutes"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.minutesId);
  },
});