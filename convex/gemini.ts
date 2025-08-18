import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { GoogleGenerativeAI } from "@google/generative-ai";

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
    
    // Create the prompt for generating meeting minutes
    const prompt = `
      You are an AI assistant that specializes in creating professional meeting minutes following Fortune-500 standards. 
      
      Please convert the following meeting notes into a structured format with these exact sections:
      
      1. Title: A concise title for the meeting
      2. Executive Summary & Action Minutes: A brief overview of key outcomes, decisions, and risks
      3. Attendees: List of attendees with their roles (format: Name (Role))
      4. Decisions Made: Key decisions made during the meeting
      5. Risks & Mitigations: Identified risks and their mitigations
      6. Action Items: Specific action items with owners and deadlines
      7. Observations & Insights: Key observations and insights from the meeting
      
      Here are the meeting notes:
      ${args.text}
      
      Please format your response as a JSON object with the following structure:
      {
        "title": "string",
        "executiveSummary": "string",
        "actionMinutes": "string",
        "attendees": [
          {
            "name": "string",
            "role": "string"
          }
        ],
        "decisions": [
          {
            "description": "string",
            "madeBy": "string",
            "date": "string"
          }
        ],
        "risks": [
          {
            "description": "string",
            "mitigation": "string"
          }
        ],
        "actionItems": [
          {
            "description": "string",
            "owner": "string",
            "deadline": "string"
          }
        ],
        "observations": [
          {
            "description": "string"
          }
        ]
      }
      
      Ensure your response is ONLY the JSON object, with no additional text, markdown, or formatting.
    `;
    
    try {
      // Call the Gemini API
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Parse the JSON response
      let meetingMinutes: MeetingMinutes;
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
      
      // Store the generated minutes in the database
      const minutesId = await ctx.db.insert("meetingMinutes", {
        userId: args.userId,
        title: meetingMinutes.title,
        executiveSummary: meetingMinutes.executiveSummary,
        actionMinutes: meetingMinutes.actionMinutes,
        attendees: meetingMinutes.attendees,
        decisions: meetingMinutes.decisions,
        risks: meetingMinutes.risks,
        actionItems: meetingMinutes.actionItems,
        observations: meetingMinutes.observations,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      
      return {
        success: true,
        minutesId,
        meetingMinutes,
      };
    } catch (error) {
      console.error("Error processing meeting notes with Gemini API:", error);
      throw new Error(`Failed to process meeting notes: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
});