import { action } from "./_generated/server";
import { v } from "convex/values";
import OpenAI from "openai";
import { validateAndNormalizeMeetingMinutes } from "./utils/meeting_minutes_validator";
import { internal } from "./_generated/api";
import type { MeetingMinutes } from "./openai";

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

export interface TranscribeAudioResult {
  success: boolean;
  minutesId: any;
  meetingMinutes: MeetingMinutes;
  processingTime: number;
}

// Action to transcribe audio and process meeting notes using OpenAI API
export const transcribeAudioAndProcessMeetingNotes = action({
  args: {
    audioAsDataUrl: v.string(),
    audioMimeType: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args): Promise<TranscribeAudioResult> => {
    // Get the OpenAI API key from Convex environment variables
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not configured in Convex environment variables");
    }

    // Record start time for performance monitoring
    const startTime = Date.now();

    // Initialize the OpenAI API client
    const openai = new OpenAI({ apiKey });

    // Simulate audio transcription
    const transcribedText = await simulateAudioTranscription(args.audioAsDataUrl, args.audioMimeType);

    // Now process the transcribed text using the existing approach
    const processingPrompt = `
        You are an AI assistant specialized in creating professional meeting minutes following Fortune-500 standards.
        Your task is to transform raw meeting notes into a structured, executive-ready document.
        Respond ONLY with the JSON object, no other text.

        Meeting Notes to Process:
        ${transcribedText}
      `;

    // Call the OpenAI API to process the transcribed text
    const processingResult = await withRetry(async () => {
      return await withTimeout(
        openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: processingPrompt }],
          response_format: { type: "json_object" },
        }),
        9000 // 9 second timeout to ensure we stay under 10s
      );
    }, 2); // Retry up to 2 times

    const text = processingResult.choices[0].message.content;

    if (!text) {
      throw new Error("OpenAI API returned an empty message content.");
    }

    // Parse the JSON response
    let meetingMinutes: any;
    try {
      meetingMinutes = JSON.parse(text);
    } catch (parseError) {
      // If parsing fails, try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/s);
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
    console.log(`Audio transcription and processing completed in ${duration}ms`);

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

// Simulate audio transcription
// In a real implementation, this would use an actual transcription service
async function simulateAudioTranscription(audioAsDataUrl: string, mimeType: string): Promise<string> {
  // This is a placeholder implementation
  // In a real implementation, you might use:
  // 1. Google Cloud Speech-to-Text API
  // 2. Wait for Gemini to support audio input directly
  // 3. Use another transcription service

  // For now, we'll return a sample transcription
  return `This is a simulated transcription of an audio meeting recording.
  
  Participants:
  - John Smith, Project Manager
  - Sarah Johnson, Product Designer
  - Michael Chen, Developer
  
  Agenda:
  1. Review Q3 project progress
  2. Discuss upcoming feature releases
  3. Address technical challenges
  
  Key decisions made:
  - Approved the new user interface design
  - Scheduled the beta release for next Friday
  - Assigned Michael to resolve the database performance issue
  
  Action items:
  - John to prepare Q3 progress report by Wednesday
  - Sarah to finalize UI design by Thursday
  - Michael to optimize database queries by Friday
  
  Risks identified:
  - Potential delay in beta release due to testing requirements
  - Resource constraints for additional feature development
  
  Next meeting scheduled for next Tuesday at 10 AM.`;
}
