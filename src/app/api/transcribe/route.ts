import { NextRequest, NextResponse } from "next/server";
import { transcribeAudio, processRawNotes, validateAudioForGemini, TranscriptionOptions } from "@/lib/gemini";
import { createServerClient } from "@/lib/supabase-server";

interface TranscriptionRequest {
  audioFile?: string; // Base64 encoded audio file
  audioFileName?: string;
  audioFileType?: string;
  rawText?: string;
  options?: TranscriptionOptions;
  userId?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: TranscriptionRequest = await request.json();
    const { audioFile, audioFileName, audioFileType, rawText, options, userId } = body;

    // Validate that we have either audio file or raw text
    if (!audioFile && !rawText) {
      return NextResponse.json(
        {
          success: false,
          error: "Either audioFile or rawText is required",
        },
        { status: 400 }
      );
    }

    // Initialize Supabase client for user authentication
    const supabase = await createServerClient();
    
    // Verify user authentication if userId is provided
    if (userId) {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user || user.id !== userId) {
        return NextResponse.json(
          {
            success: false,
            error: "Unauthorized",
          },
          { status: 401 }
        );
      }
    }

    let transcriptionResult;

    if (audioFile) {
      // Handle audio file transcription
      if (!audioFileName || !audioFileType) {
        return NextResponse.json(
          {
            success: false,
            error: "Audio file name and type are required for audio transcription",
          },
          { status: 400 }
        );
      }

      try {
        // Convert base64 back to File object for validation
        const byteCharacters = atob(audioFile);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const file = new File([byteArray], audioFileName, { type: audioFileType });

        // Validate the audio file
        const validation = validateAudioForGemini(file);
        if (!validation.valid) {
          return NextResponse.json(
            {
              success: false,
              error: validation.error,
            },
            { status: 400 }
          );
        }

        // Transcribe the audio file
        transcriptionResult = await transcribeAudio(file, options);
      } catch (error) {
        console.error("Audio processing error:", error);
        return NextResponse.json(
          {
            success: false,
            error: "Failed to process audio file",
          },
          { status: 500 }
        );
      }
    } else if (rawText) {
      // Handle raw text processing
      transcriptionResult = await processRawNotes(rawText);
    }

    // Return the transcription result
    if (transcriptionResult?.success) {
      return NextResponse.json({
        success: true,
        data: {
          transcript: transcriptionResult.transcript,
          confidence: transcriptionResult.confidence,
          language: transcriptionResult.language,
          duration: transcriptionResult.duration,
          timestamps: transcriptionResult.timestamps,
          speakers: transcriptionResult.speakers,
        },
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: transcriptionResult?.error || "Transcription failed",
          retryable: transcriptionResult?.retryable || false,
        },
        { status: 422 }
      );
    }
  } catch (error) {
    console.error("Transcription API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error during transcription",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: "transcribe",
    status: "ready",
    methods: ["POST"],
    description: "Process audio files for transcription using Gemini AI",
  });
}
