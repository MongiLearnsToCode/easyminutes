import { query } from "./_generated/server";
import { v } from "convex/values";

// Query to get NPS analytics
export const getNPSAnalytics = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get all NPS survey events within the date range
    let eventsQuery;
    
    if (args.startDate && args.endDate) {
      // Both start and end dates are provided
      eventsQuery = ctx.db.query("npsSurveyEvents")
        .withIndex("by_timestamp", (q) => 
          q.gte("timestamp", args.startDate).lte("timestamp", args.endDate)
        );
    } else if (args.startDate) {
      // Only start date is provided
      eventsQuery = ctx.db.query("npsSurveyEvents")
        .withIndex("by_timestamp", (q) => 
          q.gte("timestamp", args.startDate)
        );
    } else if (args.endDate) {
      // Only end date is provided
      eventsQuery = ctx.db.query("npsSurveyEvents")
        .withIndex("by_timestamp", (q) => 
          q.lte("timestamp", args.endDate)
        );
    } else {
      // No date range specified, get all events
      eventsQuery = ctx.db.query("npsSurveyEvents");
    }
    
    const events = await eventsQuery.collect();
    
    // Calculate NPS metrics
    let totalSurveysShown = 0;
    let totalSurveysSubmitted = 0;
    let totalSurveysDismissed = 0;
    let totalScores = 0;
    let scoreSum = 0;
    let uniqueUsersSurveyed = new Set<string>();
    let uniqueUsersSubmitted = new Set<string>();
    
    // Track scores distribution
    const scoresDistribution: Record<number, number> = {};
    for (let i = 0; i <= 10; i++) {
      scoresDistribution[i] = 0;
    }
    
    // Track promoters, passives, and detractors
    let promoters = 0;
    let passives = 0;
    let detractors = 0;
    
    // Process each event
    for (const event of events) {
      uniqueUsersSurveyed.add(event.userId);
      
      switch (event.eventType) {
        case "survey_shown":
          totalSurveysShown++;
          break;
        case "survey_submitted":
          totalSurveysSubmitted++;
          uniqueUsersSubmitted.add(event.userId);
          
          if (event.score !== undefined && event.score >= 0 && event.score <= 10) {
            totalScores++;
            scoreSum += event.score;
            scoresDistribution[event.score]++;
            
            // Categorize the score
            if (event.score >= 9 && event.score <= 10) {
              promoters++;
            } else if (event.score >= 7 && event.score <= 8) {
              passives++;
            } else if (event.score >= 0 && event.score <= 6) {
              detractors++;
            }
          }
          break;
        case "survey_dismissed":
          totalSurveysDismissed++;
          break;
      }
    }
    
    // Calculate NPS metrics
    const responseRate = totalSurveysShown > 0 ? (totalSurveysSubmitted / totalSurveysShown) * 100 : 0;
    const averageScore = totalScores > 0 ? scoreSum / totalScores : 0;
    const nps = totalScores > 0 ? ((promoters - detractors) / totalScores) * 100 : 0;
    
    // Calculate promoter, passive, and detractor percentages
    const promoterPercentage = totalScores > 0 ? (promoters / totalScores) * 100 : 0;
    const passivePercentage = totalScores > 0 ? (passives / totalScores) * 100 : 0;
    const detractorPercentage = totalScores > 0 ? (detractors / totalScores) * 100 : 0;
    
    return {
      totalSurveysShown,
      totalSurveysSubmitted,
      totalSurveysDismissed,
      responseRate,
      averageScore,
      nps,
      promoters,
      passives,
      detractors,
      promoterPercentage,
      passivePercentage,
      detractorPercentage,
      uniqueUsersSurveyed: uniqueUsersSurveyed.size,
      uniqueUsersSubmitted: uniqueUsersSubmitted.size,
      scoresDistribution,
    };
  },
});