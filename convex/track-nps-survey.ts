import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Mutation to track NPS survey events
export const trackNPSSurvey = mutation({
  args: {
    userId: v.string(),
    eventType: v.union(
      v.literal("survey_shown"), // Survey was displayed to user
      v.literal("survey_submitted"), // User submitted the survey
      v.literal("survey_dismissed") // User dismissed the survey
    ),
    score: v.optional(v.number()), // NPS score (0-10) when submitted
    timestamp: v.number(),
  },
  handler: async (ctx, args) => {
    try {
      // Record the NPS survey event
      const eventId = await ctx.db.insert("npsSurveyEvents", {
        userId: args.userId,
        eventType: args.eventType,
        score: args.score,
        timestamp: args.timestamp,
      });
      
      // Update user's analytics data if submitting a score
      if (args.eventType === "survey_submitted" && args.score !== undefined) {
        const userAnalytics = await ctx.db
          .query("userAnalytics")
          .withIndex("by_userId", (q) => q.eq("userId", args.userId))
          .unique();
        
        if (userAnalytics) {
          const updates: any = {
            updatedAt: Date.now(),
          };
          
          // Categorize the NPS score
          if (args.score >= 0 && args.score <= 6) {
            updates.npsDetractors = (userAnalytics.npsDetractors || 0) + 1;
          } else if (args.score >= 7 && args.score <= 8) {
            updates.npsPassives = (userAnalytics.npsPassives || 0) + 1;
          } else if (args.score >= 9 && args.score <= 10) {
            updates.npsPromoters = (userAnalytics.npsPromoters || 0) + 1;
          }
          
          // Track if this is the user's first NPS submission
          if (!userAnalytics.firstNPSAt) {
            updates.firstNPSAt = args.timestamp;
          }
          
          await ctx.db.patch(userAnalytics._id, updates);
        } else {
          // Create new analytics record if it doesn't exist
          const npsCategory = 
            args.score >= 0 && args.score <= 6 ? 'detractor' :
            args.score >= 7 && args.score <= 8 ? 'passive' : 'promoter';
            
          await ctx.db.insert("userAnalytics", {
            userId: args.userId,
            totalGenerations: 0,
            successfulGenerations: 0,
            failedGenerations: 0,
            totalProcessingTimeMs: 0,
            under2MinuteGenerations: 0,
            proConversions: 0,
            npsDetractors: npsCategory === 'detractor' ? 1 : 0,
            npsPassives: npsCategory === 'passive' ? 1 : 0,
            npsPromoters: npsCategory === 'promoter' ? 1 : 0,
            firstNPSAt: args.timestamp,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });
        }
      }
      
      return {
        success: true,
        eventId,
      };
    } catch (error) {
      console.error("Error tracking NPS survey event:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to track NPS survey event",
      };
    }
  },
});