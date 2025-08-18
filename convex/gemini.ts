import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { validateAndNormalizeMeetingMinutes } from "./utils/meeting-minutes-validator";

// Define the structure for our meeting minutes
export type MeetingMinutes = {
  title: string;
  executiveSummary: string;
  actionMinutes: string;
  attendees: Array<{
    name: string;
    role: string;
  }>;
  decisions: Array<{
    description: string;
    madeBy: string;
    date: string;
  }>;
  risks: Array<{
    description: string;
    mitigation: string;
  }>;
  actionItems: Array<{
    description: string;
    owner: string;
    deadline: string;
  }>;
  observations: Array<{
    description: string;
  }>;
};

// Utility function to add a timeout to a promise
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs)
    )
  ]);
}

// Utility function to retry a function with exponential backoff
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      // If this was the last retry, throw the error
      if (i === maxRetries) {
        throw error;
      }
      
      // Exponential backoff with jitter
      const delay = Math.min(baseDelay * Math.pow(2, i), 10000) + Math.random() * 1000;
      console.log(`Attempt ${i + 1} failed. Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

// Mutation to process meeting notes using Gemini API
export const processMeetingNotes = mutation({
  args: {
    text: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user has remaining generations (implement in Pro gating phase)
    // For now, we'll proceed with the generation
    
    // Get the Gemini API key from Convex environment variables
    const apiKey = ctx.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured in Convex environment variables");
    }
    
    // Initialize the Gemini API client
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    // Create the enhanced prompt for generating Fortune-500 style meeting minutes
    const prompt = `
      You are an AI assistant specialized in creating professional meeting minutes following Fortune-500 standards. 
      Your task is to transform raw meeting notes into a structured, executive-ready document.

      Fortune-500 Meeting Minutes Format:
      1. Title: A concise, professional title that captures the meeting's purpose
      2. Executive Summary & Action Minutes: A high-level overview (3-5 sentences) covering:
         - Key outcomes and decisions
         - Critical risks and mitigation strategies
         - Immediate next steps
      3. Attendees: List all participants with their titles/roles in format: "Name, Title"
      4. Decisions Made: Each decision should include:
         - Clear description of the decision
         - Who made it (individual or group)
         - Date of decision (use today's date: ${new Date().toISOString().split('T')[0]})
      5. Risks & Mitigations: For each identified risk, specify:
         - Detailed risk description
         - Specific mitigation strategy
      6. Action Items: Each action item must include:
         - Clear, actionable description
         - Assigned owner (person responsible)
         - Realistic deadline (format: YYYY-MM-DD)
      7. Observations & Insights: Key observations and strategic insights from the discussion

      Example of Fortune-500 style output:
      {
        "title": "Q3 Marketing Strategy Review",
        "executiveSummary": "The marketing team reviewed Q3 campaign performance and approved a revised budget allocation for the remainder of the quarter. Key decisions included shifting 15% of digital ad spend to emerging channels and accelerating the product launch timeline by two weeks. The primary risk identified was potential supply chain delays impacting launch materials, which will be mitigated through early vendor orders.",
        "actionMinutes": "The team approved revised Q3 marketing budget allocation with increased focus on emerging channels. Product launch timeline accelerated by two weeks. Supply chain risks identified with mitigation strategies implemented.",
        "attendees": [
          {"name": "Sarah Johnson", "role": "CMO"},
          {"name": "Michael Chen", "role": "Head of Digital Marketing"},
          {"name": "Jennifer Rodriguez", "role": "Product Marketing Lead"}
        ],
        "decisions": [
          {
            "description": "Approved revised Q3 marketing budget with 15% reallocation from traditional digital channels to TikTok and LinkedIn advertising",
            "madeBy": "CMO Sarah Johnson",
            "date": "${new Date().toISOString().split('T')[0]}"
          }
        ],
        "risks": [
          {
            "description": "Potential 2-week delay in custom packaging materials for product launch due to supplier issues",
            "mitigation": "Place early orders with backup suppliers and negotiate rush delivery terms"
          }
        ],
        "actionItems": [
          {
            "description": "Finalize TikTok ad campaign creative assets and launch by July 15th",
            "owner": "Michael Chen",
            "deadline": "${new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}"
          }
        ],
        "observations": [
          {
            "description": "Team noted strong engagement with video content across all channels, suggesting future content strategy should prioritize video-first approach"
          }
        ]
      }

      Important Instructions:
      - Extract and organize information from the provided notes, even if disorganized
      - Fill in reasonable details where information is missing
      - Ensure all dates are in YYYY-MM-DD format
      - Keep descriptions professional and concise
      - Do NOT reference this prompt or instructions in your output
      - Respond ONLY with the JSON object, no other text

      Meeting Notes to Process:
      ${args.text}
    `;
    
    try {
      // Record start time for performance monitoring
      const startTime = Date.now();
      
      // Call the Gemini API with timeout and retry logic
      const result = await withRetry(async () => {
        return await withTimeout(
          model.generateContent(prompt),
          9000 // 9 second timeout to ensure we stay under 10s
        );
      }, 2); // Retry up to 2 times
      
      const response = await result.response;
      const text = response.text();
      
      // Parse the JSON response
      let meetingMinutes: any;
      try {
        meetingMinutes = JSON.parse(text);
      } catch (parseError) {
        // If parsing fails, try to extract JSON from the response
        const jsonMatch = text.match(/\{.*\}/s);
        if (jsonMatch) {
          meetingMinutes = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("Failed to parse Gemini API response as JSON");
        }
      }
      
      // Validate and normalize the meeting minutes
      const normalizedMinutes = validateAndNormalizeMeetingMinutes(meetingMinutes);
      
      // Record end time and log performance
      const endTime = Date.now();
      const duration = endTime - startTime;
      console.log(`Gemini API call completed in ${duration}ms`);
      
      // Track processing time (in a real implementation, this would be done asynchronously)
      // For now, we'll just log that it should be tracked
      console.log(`Should track processing time: ${duration}ms for user ${args.userId}`);
      
      // Store the generated minutes in the database
      const minutesId = await ctx.db.insert("meetingMinutes", {
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
      });
      
      return {
        success: true,
        minutesId,
        meetingMinutes: normalizedMinutes,
        processingTime: duration,
      };
    } catch (error) {
      console.error("Error processing meeting notes with Gemini API:", error);
      
      // Log the error for monitoring
      console.error("Gemini API error details:", {
        errorMessage: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        userId: args.userId,
        textLength: args.text.length
      });
      
      // Provide a more user-friendly error message
      const userMessage = error instanceof Error && error.message.includes("Operation timed out") 
        ? "The request took too long to process. Please try again with a shorter input." 
        : "We encountered an issue processing your meeting notes. Please try again.";
      
      throw new Error(userMessage);
    }
  },
});