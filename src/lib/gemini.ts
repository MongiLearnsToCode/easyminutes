/**
 * Google Gemini API integration for audio transcription and text processing
 * Handles file upload, transcription requests, and response processing
 */

import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

// Initialize Gemini AI client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

// Configuration constants
const TRANSCRIPTION_MODEL = 'gemini-1.5-flash'; // Best model for transcription tasks
const TEXT_PROCESSING_MODEL = 'gemini-1.5-pro'; // Best model for text analysis
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB limit
const SUPPORTED_FORMATS = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/flac'];

export interface TranscriptionOptions {
  language?: string;
  includeTimestamps?: boolean;
  speakerLabels?: boolean;
  enhanceAccuracy?: boolean;
}

export interface TranscriptionResult {
  success: boolean;
  transcript?: string;
  confidence?: number;
  duration?: number;
  language?: string;
  timestamps?: Array<{
    start: number;
    end: number;
    text: string;
  }>;
  speakers?: Array<{
    speaker: string;
    segments: Array<{
      start: number;
      end: number;
      text: string;
    }>;
  }>;
  error?: string;
  retryable?: boolean;
}

export interface ProcessingProgress {
  stage: 'uploading' | 'processing' | 'analyzing' | 'complete' | 'error';
  progress: number;
  message: string;
  estimatedTimeRemaining?: number;
}

/**
 * Convert audio file to base64 format for Gemini API
 */
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix (data:audio/mpeg;base64,)
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Validate audio file for Gemini API compatibility
 */
export function validateAudioForGemini(file: File): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size (${Math.round(file.size / 1024 / 1024)}MB) exceeds maximum limit of 100MB`
    };
  }

  // Check format
  if (!SUPPORTED_FORMATS.includes(file.type)) {
    return {
      valid: false,
      error: `Unsupported format: ${file.type}. Supported formats: MP3, WAV, M4A, FLAC`
    };
  }

  return { valid: true };
}

/**
 * Get the appropriate MIME type for Gemini API
 */
function getGeminiMimeType(fileType: string): string {
  const mimeMap: Record<string, string> = {
    'audio/mpeg': 'audio/mpeg',
    'audio/wav': 'audio/wav',
    'audio/mp4': 'audio/mp4',
    'audio/flac': 'audio/flac',
    'audio/x-wav': 'audio/wav',
    'audio/x-m4a': 'audio/mp4',
    'audio/x-flac': 'audio/flac'
  };
  
  return mimeMap[fileType] || fileType;
}

/**
 * Create transcription prompt with options
 */
function createTranscriptionPrompt(options: TranscriptionOptions = {}): string {
  let prompt = `Please transcribe this audio file accurately. Follow these guidelines:

1. Transcribe exactly what is spoken, including filler words like "um", "uh", "you know"
2. Use proper punctuation and capitalization
3. Format as readable text with appropriate paragraph breaks
4. Preserve the natural flow of conversation`;

  if (options.speakerLabels) {
    prompt += `\n5. Identify different speakers and label them as "Speaker 1:", "Speaker 2:", etc.`;
  }

  if (options.includeTimestamps) {
    prompt += `\n6. Include approximate timestamps for major topic changes`;
  }

  if (options.language && options.language !== 'auto') {
    prompt += `\n7. The audio is primarily in ${options.language}`;
  }

  prompt += `\n\nProvide only the transcription text, no additional commentary or analysis.`;

  return prompt;
}

/**
 * Transcribe audio file using Gemini API
 */
export async function transcribeAudio(
  file: File,
  options: TranscriptionOptions = {},
  onProgress?: (progress: ProcessingProgress) => void
): Promise<TranscriptionResult> {
  try {
    // Validate file
    const validation = validateAudioForGemini(file);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error,
        retryable: false
      };
    }

    // Report upload progress
    onProgress?.({
      stage: 'uploading',
      progress: 10,
      message: 'Preparing audio file for processing...'
    });

    // Convert file to base64
    const base64Data = await fileToBase64(file);
    
    onProgress?.({
      stage: 'processing',
      progress: 30,
      message: 'Uploading to Gemini API...',
      estimatedTimeRemaining: 60
    });

    // Initialize model
    const model: GenerativeModel = genAI.getGenerativeModel({ 
      model: TRANSCRIPTION_MODEL 
    });

    // Prepare the request
    const prompt = createTranscriptionPrompt(options);
    const mimeType = getGeminiMimeType(file.type);

    onProgress?.({
      stage: 'analyzing',
      progress: 60,
      message: 'Transcribing audio content...',
      estimatedTimeRemaining: 90
    });

    // Make transcription request
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        }
      }
    ]);

    onProgress?.({
      stage: 'analyzing',
      progress: 90,
      message: 'Processing transcription results...'
    });

    const response = await result.response;
    const transcript = response.text();

    if (!transcript || transcript.trim().length === 0) {
      return {
        success: false,
        error: 'No transcription was generated. The audio may be unclear or contain no speech.',
        retryable: true
      };
    }

    onProgress?.({
      stage: 'complete',
      progress: 100,
      message: 'Transcription completed successfully!'
    });

    // Estimate confidence based on response quality
    const confidence = estimateTranscriptionConfidence(transcript);

    return {
      success: true,
      transcript: transcript.trim(),
      confidence,
      language: options.language || 'auto-detected'
    };

  } catch (error) {
    console.error('Gemini transcription error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const isRetryable = !errorMessage.toLowerCase().includes('quota') && 
                       !errorMessage.toLowerCase().includes('permission');

    onProgress?.({
      stage: 'error',
      progress: 0,
      message: `Transcription failed: ${errorMessage}`
    });

    return {
      success: false,
      error: errorMessage,
      retryable: isRetryable
    };
  }
}

/**
 * Estimate transcription confidence based on text quality indicators
 */
function estimateTranscriptionConfidence(transcript: string): number {
  let confidence = 0.7; // Base confidence
  
  // Increase confidence for longer transcripts
  if (transcript.length > 500) confidence += 0.1;
  if (transcript.length > 1000) confidence += 0.1;
  
  // Decrease confidence for excessive filler words
  const fillerWords = (transcript.match(/\b(um|uh|er|ah|you know|like)\b/gi) || []).length;
  const wordCount = transcript.split(/\s+/).length;
  const fillerRatio = fillerWords / wordCount;
  
  if (fillerRatio > 0.1) confidence -= 0.1;
  if (fillerRatio > 0.2) confidence -= 0.1;
  
  // Increase confidence for proper punctuation
  const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const avgSentenceLength = transcript.length / sentences.length;
  
  if (avgSentenceLength > 50 && avgSentenceLength < 200) confidence += 0.05;
  
  return Math.max(0.1, Math.min(0.95, confidence));
}

/**
 * Process raw meeting notes using Gemini for structure and clarity
 */
export async function processRawNotes(
  rawText: string,
  onProgress?: (progress: ProcessingProgress) => void
): Promise<TranscriptionResult> {
  try {
    if (!rawText || rawText.trim().length === 0) {
      return {
        success: false,
        error: 'No text provided for processing',
        retryable: false
      };
    }

    onProgress?.({
      stage: 'processing',
      progress: 20,
      message: 'Analyzing raw notes...'
    });

    const model: GenerativeModel = genAI.getGenerativeModel({ 
      model: TEXT_PROCESSING_MODEL 
    });

    const prompt = `Please process and improve these raw meeting notes while preserving all important information:

Raw Notes:
${rawText}

Please:
1. Correct any obvious spelling or grammar errors
2. Organize the content into coherent paragraphs
3. Maintain the original meaning and tone
4. Preserve all names, dates, numbers, and specific details
5. Improve readability without changing the substance
6. Keep the same general structure and flow

Provide only the processed text, no additional commentary.`;

    onProgress?.({
      stage: 'analyzing',
      progress: 60,
      message: 'Processing and structuring content...'
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const processedText = response.text();

    if (!processedText || processedText.trim().length === 0) {
      return {
        success: false,
        error: 'Failed to process the raw notes. Please try again.',
        retryable: true
      };
    }

    onProgress?.({
      stage: 'complete',
      progress: 100,
      message: 'Notes processed successfully!'
    });

    return {
      success: true,
      transcript: processedText.trim(),
      confidence: 0.9, // High confidence for text processing
      language: 'processed'
    };

  } catch (error) {
    console.error('Gemini text processing error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const isRetryable = !errorMessage.toLowerCase().includes('quota');

    onProgress?.({
      stage: 'error',
      progress: 0,
      message: `Processing failed: ${errorMessage}`
    });

    return {
      success: false,
      error: errorMessage,
      retryable: isRetryable
    };
  }
}

/**
 * Check API key and model availability
 */
export async function checkGeminiConnection(): Promise<{ available: boolean; error?: string }> {
  try {
    if (!process.env.GOOGLE_AI_API_KEY) {
      return {
        available: false,
        error: 'Google Gemini API key is not configured'
      };
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // Test with a simple prompt
    const result = await model.generateContent('Say "API connection successful"');
    const response = await result.response;
    const text = response.text();
    
    if (text.toLowerCase().includes('successful')) {
      return { available: true };
    } else {
      return {
        available: false,
        error: 'API responded but test failed'
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      available: false,
      error: `API connection failed: ${errorMessage}`
    };
  }
}

/**
 * Get transcription usage and rate limit info
 */
export function getTranscriptionLimits() {
  return {
    maxFileSize: MAX_FILE_SIZE,
    maxFileSizeMB: MAX_FILE_SIZE / 1024 / 1024,
    supportedFormats: SUPPORTED_FORMATS,
    models: {
      transcription: TRANSCRIPTION_MODEL,
      textProcessing: TEXT_PROCESSING_MODEL
    }
  };
}
