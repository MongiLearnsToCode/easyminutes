import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { validateAndNormalizeMeetingMinutes } from "./utils/meeting_minutes_validator";

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

// Mutation to transcribe audio and process meeting notes using Gemini API
export const transcribeAudioAndProcessMeetingNotes = mutation({
  args: {
    audioData: v.bytes(), // The audio file data
    audioMimeType: v.string(), // The MIME type of the audio file
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
    
    try {
      // Record start time for performance monitoring
      const startTime = Date.now();
      
      // Initialize the Gemini API client
      const genAI = new GoogleGenerativeAI(apiKey);
      
      // For audio transcription, we'll first transcribe the audio to text
      // Then process the text using the existing Gemini function
      
      // Create the prompt for transcribing audio
      // Note: As of now, the @google/generative-ai library doesn't directly support
      // audio transcription. We'll simulate this process for now.
      // In a production environment, you might use Google Cloud Speech-to-Text API
      // or wait for Gemini to support audio input directly.
      
      // Simulate audio transcription
      // In a real implementation, this would be replaced with actual transcription code
      const transcribedText = await simulateAudioTranscription(args.audioData, args.audioMimeType);
      
      // Now process the transcribed text using the existing approach
      // Create the enhanced prompt for generating Fortune-500 style meeting minutes
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
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
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
      console.error("Error transcribing audio and processing meeting notes with Gemini API:", error);
      throw new Error(`Failed to transcribe audio and process meeting notes: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
});

// Simulate audio transcription
// In a real implementation, this would use an actual transcription service
async function simulateAudioTranscription(audioData: ArrayBuffer, mimeType: string): Promise<string> {
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