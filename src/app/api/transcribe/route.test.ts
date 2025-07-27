/**
 * Unit tests for the transcription API route
 * Tests both audio file transcription and raw text processing
 */

import { POST, GET } from './route';
import { NextRequest } from 'next/server';
import * as geminiLib from '@/lib/gemini';
import * as supabaseServer from '@/lib/supabase-server';

// Mock the dependencies
jest.mock('@/lib/gemini');
jest.mock('@/lib/supabase-server');

const mockedGemini = geminiLib as jest.Mocked<typeof geminiLib>;
const mockedSupabase = supabaseServer as jest.Mocked<typeof supabaseServer>;

// Mock Supabase client
const mockSupabaseClient = {
  auth: {
    getUser: jest.fn()
  }
};

describe('/api/transcribe', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedSupabase.createServerClient.mockResolvedValue(mockSupabaseClient as any);
  });

  describe('GET', () => {
    it('should return endpoint information', async () => {
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        endpoint: 'transcribe',
        status: 'ready',
        methods: ['POST'],
        description: 'Process audio files for transcription using Gemini AI'
      });
    });
  });

  describe('POST', () => {
    it('should return 400 if neither audioFile nor rawText is provided', async () => {
      const request = new NextRequest('http://localhost/api/transcribe', {
        method: 'POST',
        body: JSON.stringify({})
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Either audioFile or rawText is required');
    });

    it('should return 401 if user authentication fails', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Unauthorized')
      });

      const request = new NextRequest('http://localhost/api/transcribe', {
        method: 'POST',
        body: JSON.stringify({
          rawText: 'Test meeting notes',
          userId: 'invalid-user-id'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Unauthorized');
    });

    it('should process raw text successfully', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'valid-user-id' } },
        error: null
      });

      mockedGemini.processRawNotes.mockResolvedValue({
        success: true,
        transcript: 'Processed meeting notes with better formatting.',
        confidence: 0.9,
        language: 'processed'
      });

      const request = new NextRequest('http://localhost/api/transcribe', {
        method: 'POST',
        body: JSON.stringify({
          rawText: 'raw meeting notes here',
          userId: 'valid-user-id'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.transcript).toBe('Processed meeting notes with better formatting.');
      expect(data.data.confidence).toBe(0.9);
      expect(mockedGemini.processRawNotes).toHaveBeenCalledWith('raw meeting notes here');
    });

    it('should return 400 for audio file without required metadata', async () => {
      const request = new NextRequest('http://localhost/api/transcribe', {
        method: 'POST',
        body: JSON.stringify({
          audioFile: 'base64-encoded-audio-data'
          // Missing audioFileName and audioFileType
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Audio file name and type are required for audio transcription');
    });

    it('should return 400 for invalid audio file', async () => {
      mockedGemini.validateAudioForGemini.mockReturnValue({
        valid: false,
        error: 'Unsupported format: audio/xyz. Supported formats: MP3, WAV, M4A, FLAC'
      });

      // Create a simple base64 encoded string for testing
      const testBase64 = btoa('fake audio data');

      const request = new NextRequest('http://localhost/api/transcribe', {
        method: 'POST',
        body: JSON.stringify({
          audioFile: testBase64,
          audioFileName: 'test.xyz',
          audioFileType: 'audio/xyz'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Unsupported format: audio/xyz. Supported formats: MP3, WAV, M4A, FLAC');
    });

    it('should transcribe audio file successfully', async () => {
      mockedGemini.validateAudioForGemini.mockReturnValue({
        valid: true
      });

      mockedGemini.transcribeAudio.mockResolvedValue({
        success: true,
        transcript: 'This is the transcribed audio content.',
        confidence: 0.85,
        language: 'auto-detected',
        duration: 120
      });

      // Create a simple base64 encoded string for testing
      const testBase64 = btoa('fake audio data');

      const request = new NextRequest('http://localhost/api/transcribe', {
        method: 'POST',
        body: JSON.stringify({
          audioFile: testBase64,
          audioFileName: 'test.mp3',
          audioFileType: 'audio/mpeg',
          options: {
            language: 'en',
            includeTimestamps: true
          }
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.transcript).toBe('This is the transcribed audio content.');
      expect(data.data.confidence).toBe(0.85);
      expect(data.data.language).toBe('auto-detected');
      expect(data.data.duration).toBe(120);
    });

    it('should return 422 for failed transcription', async () => {
      mockedGemini.processRawNotes.mockResolvedValue({
        success: false,
        error: 'Failed to process the raw notes. Please try again.',
        retryable: true
      });

      const request = new NextRequest('http://localhost/api/transcribe', {
        method: 'POST',
        body: JSON.stringify({
          rawText: 'problematic text that fails processing'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(422);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to process the raw notes. Please try again.');
      expect(data.retryable).toBe(true);
    });

    it('should handle unexpected errors gracefully', async () => {
      mockedGemini.processRawNotes.mockRejectedValue(new Error('Unexpected API error'));

      const request = new NextRequest('http://localhost/api/transcribe', {
        method: 'POST',
        body: JSON.stringify({
          rawText: 'test notes'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Internal server error during transcription');
    });

    it('should handle malformed JSON gracefully', async () => {
      const request = new NextRequest('http://localhost/api/transcribe', {
        method: 'POST',
        body: 'invalid json'
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Internal server error during transcription');
    });
  });
});
