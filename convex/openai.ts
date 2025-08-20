import { action } from "./_generated/server";
import { v } from "convex/values";
import OpenAI from "openai";
import { validateAndNormalizeMeetingMinutes } from "./utils/meeting_minutes_validator";
import { internal } from "./_generated/api";

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
  let lastError: any;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (i === maxRetries) {
        throw error;
      }

      let delay = Math.min(baseDelay * Math.pow(2, i), 10000) + Math.random() * 1000;

      if (error instanceof OpenAI.APIError && error.status === 429) {
        const retryAfter = error.headers?.["retry-after"];
        if (retryAfter) {
          delay = parseInt(retryAfter, 10) * 1000;
        }
      }

      console.log(`Attempt ${i + 1} failed. Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

export interface ProcessMeetingNotesResult {
  success: boolean;
  minutesId: any;
  meetingMinutes: MeetingMinutes;
  processingTime: number;
}

// Action to process meeting notes using OpenAI API
export const processMeetingNotes = action({
  args: {
    text: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args): Promise<ProcessMeetingNotesResult> => {
    // Get the OpenAI API key from Convex environment variables
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not configured in Convex environment variables");
    }

    // Initialize the OpenAI API client
    const openai = new OpenAI({ apiKey });

    // Create the enhanced prompt for generating Fortune-500 style meeting minutes
    const prompt = `
      You are an AI assistant specialized in creating professional meeting minutes following Fortune-500 standards.
      Your task is to transform raw meeting notes into a structured, executive-ready document.
      Respond ONLY with the JSON object, no other text.

      Meeting Notes to Process:
      ${args.text}
    `;

    // Record start time for performance monitoring
    const startTime = Date.now();

    // Call the OpenAI API with timeout and retry logic
    const result = await withRetry(async () => {
      return await withTimeout(
        openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" },
        }),
        9000 // 9 second timeout to ensure we stay under 10s
      );
    }, 2); // Retry up to 2 times

    const text = result.choices[0].message.content;

    if (!text) {
      throw new Error("OpenAI API returned an empty message content.");
    }

    // Parse the JSON response
    let meetingMinutes: any;
    try {
      meetingMinutes = JSON.parse(text);
    } catch (parseError) {
      // If parsing fails, try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        meetingMinutes = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Failed to parse OpenAI API response as JSON");
      }
    }

    // Validate and normalize the meeting minutes
    const normalizedMinutes = validateAndNormalizeMeetingMinutes(meetingMinutes);

    // Record end time and log performance
    const endTime = Date.now();
    const duration = endTime - startTime;
    console.log(`OpenAI API call completed in ${duration}ms`);

    // Store the generated minutes in the database by calling a mutation
    const minutesId = await ctx.runMutation(internal.openai_mutations.internalSaveMeetingMinutes, {
      userId: args.userId,
      title: normalizedMinutes.title,
      executiveSummary: normalizedMinutes.executiveSummary,
      actionMinutes: normalizedMinutes.actionMinutes,
      attendees: normalizedMinutes.attendees,
      decisions: normalizedMinutes.decisions,
      risks: normalizedMinutes.risks,
      actionItems: normalizedMinutes.actionItems,
      observations: normalizedMinutes.observations,
    });

    return {
      success: true,
      minutesId,
      meetingMinutes: normalizedMinutes,
      processingTime: duration,
    };
  },
});
