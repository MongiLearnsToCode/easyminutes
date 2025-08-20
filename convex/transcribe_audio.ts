import { action } from "./_generated/server";
import { v } from "convex/values";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { validateAndNormalizeMeetingMinutes } from "./utils/meeting_minutes_validator";
import { internal } from "./_generated/api";
import type { MeetingMinutes } from "./gemini";

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

      if ((error as any).toString().includes("429 Too Many Requests")) {
        const retryDelayMatch = (error as any).toString().match(/retryDelay\\":\\"(\d+)s/);
        if (retryDelayMatch && retryDelayMatch[1]) {
          delay = parseInt(retryDelayMatch[1], 10) * 1000;
        } else {
          delay = 37000; // Default to 37 seconds if retryDelay is not found
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

// Action to transcribe audio and process meeting notes using Gemini API
export const transcribeAudioAndProcessMeetingNotes = action({
  args: {
    // The audio file data is passed as a string, not bytes
    // This is a temporary workaround for the issue with passing ArrayBuffer
    // to actions. A better solution would be to use file storage.
    audioAsDataUrl: v.string(),
    audioMimeType: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args): Promise<TranscribeAudioResult> => {
    // Get the Gemini API key from Convex environment variables
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured in Convex environment variables");
    }

    // Record start time for performance monitoring
    const startTime = Date.now();

    // Initialize the Gemini API client
    const genAI = new GoogleGenerativeAI(apiKey);

    // Simulate audio transcription
    const transcribedText = await simulateAudioTranscription(args.audioAsDataUrl, args.audioMimeType);

    // Now process the transcribed text using the existing approach
    const processingPrompt = `
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

        Important Instructions:
        - Extract and organize information from the provided notes, even if disorganized
        - Fill in reasonable details where information is missing
        - Ensure all dates are in YYYY-MM-DD format
        - Keep descriptions professional and concise
        - Do NOT reference this prompt or instructions in your output
        - Respond ONLY with the JSON object, no other text

        Meeting Notes to Process:
        ${transcribedText}
      `;

    // Call the Gemini API to process the transcribed text
    const processingResult = await withRetry(async () => {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
      return await withTimeout(
        model.generateContent(processingPrompt),
        9000 // 9 second timeout to ensure we stay under 10s
      );
    }, 2); // Retry up to 2 times

    const processingResponse = await processingResult.response;
    const text = processingResponse.text();

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
    console.log(`Audio transcription and processing completed in ${duration}ms`);

    // Store the generated minutes in the database by calling a mutation
    const minutesId = await ctx.runMutation(internal.transcribe_audio_mutations.internalSaveTranscribedMinutes, {
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