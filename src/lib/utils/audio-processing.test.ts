import {
  formatFileSize,
  formatDuration,
  getFileExtension,
  isSupportedFormat,
  validateFileSize,
  validateDuration,
  quickValidateAudioFile,
  SUPPORTED_AUDIO_FORMATS,
  SUPPORTED_EXTENSIONS,
  MAX_FILE_SIZE_MB,
  MAX_DURATION_MINUTES,
  MIN_DURATION_SECONDS
} from './audio-processing';

// Mock File constructor for testing
class MockFile implements File {
  readonly lastModified: number = Date.now();
  readonly name: string;
  readonly webkitRelativePath: string = '';
  readonly size: number;
  readonly type: string;

  constructor(parts: BlobPart[], filename: string, properties?: FilePropertyBag) {
    this.name = filename;
    this.size = properties?.type === 'large' ? 200 * 1024 * 1024 : 1024 * 1024; // 1MB or 200MB
    this.type = properties?.type || 'audio/mpeg';
  }

  slice(): Blob {
    throw new Error('Not implemented');
  }

  stream(): ReadableStream<Uint8Array> {
    throw new Error('Not implemented');
  }

  text(): Promise<string> {
    throw new Error('Not implemented');
  }

  arrayBuffer(): Promise<ArrayBuffer> {
    throw new Error('Not implemented');
  }
}

describe('Audio Processing Utilities', () => {
  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1024 * 1024)).toBe('1 MB');
      expect(formatFileSize(1.5 * 1024 * 1024)).toBe('1.5 MB');
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
    });
  });

  describe('formatDuration', () => {
    it('should format duration correctly', () => {
      expect(formatDuration(30)).toBe('0:30');
      expect(formatDuration(90)).toBe('1:30');
      expect(formatDuration(3600)).toBe('1:00:00');
      expect(formatDuration(3661)).toBe('1:01:01');
      expect(formatDuration(7200)).toBe('2:00:00');
    });
  });

  describe('getFileExtension', () => {
    it('should extract file extensions correctly', () => {
      expect(getFileExtension('audio.mp3')).toBe('.mp3');
      expect(getFileExtension('Meeting_Recording.wav')).toBe('.wav');
      expect(getFileExtension('file.with.dots.m4a')).toBe('.m4a');
      expect(getFileExtension('UPPERCASE.FLAC')).toBe('.flac');
    });
  });

  describe('isSupportedFormat', () => {
    it('should recognize supported audio formats by MIME type', () => {
      const mp3File = new MockFile([], 'test.mp3', { type: 'audio/mpeg' });
      const wavFile = new MockFile([], 'test.wav', { type: 'audio/wav' });
      const m4aFile = new MockFile([], 'test.m4a', { type: 'audio/mp4' });
      const flacFile = new MockFile([], 'test.flac', { type: 'audio/flac' });
      
      expect(isSupportedFormat(mp3File)).toBe(true);
      expect(isSupportedFormat(wavFile)).toBe(true);
      expect(isSupportedFormat(m4aFile)).toBe(true);
      expect(isSupportedFormat(flacFile)).toBe(true);
    });

    it('should recognize supported formats by file extension', () => {
      const mp3File = new MockFile([], 'test.mp3', { type: '' });
      const wavFile = new MockFile([], 'test.wav', { type: '' });
      const m4aFile = new MockFile([], 'test.m4a', { type: '' });
      const flacFile = new MockFile([], 'test.flac', { type: '' });
      
      expect(isSupportedFormat(mp3File)).toBe(true);
      expect(isSupportedFormat(wavFile)).toBe(true);
      expect(isSupportedFormat(m4aFile)).toBe(true);
      expect(isSupportedFormat(flacFile)).toBe(true);
    });

    it('should reject unsupported formats', () => {
      const txtFile = new MockFile([], 'test.txt', { type: 'text/plain' });
      const videoFile = new MockFile([], 'test.mp4', { type: 'video/mp4' });
      
      expect(isSupportedFormat(txtFile)).toBe(false);
      expect(isSupportedFormat(videoFile)).toBe(false);
    });
  });

  describe('validateFileSize', () => {
    it('should validate file size correctly', () => {
      const smallFile = new MockFile([], 'small.mp3');
      const largeFile = new MockFile([], 'large.mp3', { type: 'large' });
      
      expect(validateFileSize(smallFile).isValid).toBe(true);
      expect(validateFileSize(largeFile).isValid).toBe(false);
      expect(validateFileSize(largeFile).error).toContain('exceeds the maximum limit');
    });

    it('should reject empty files', () => {
      const emptyFile = new MockFile([], 'empty.mp3');
      emptyFile.size = 0;
      
      const result = validateFileSize(emptyFile);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('File appears to be empty');
    });
  });

  describe('validateDuration', () => {
    it('should validate duration correctly', () => {
      expect(validateDuration(60).isValid).toBe(true); // 1 minute
      expect(validateDuration(3600).isValid).toBe(true); // 1 hour
      expect(validateDuration(0.5).isValid).toBe(false); // Too short
      expect(validateDuration(MAX_DURATION_MINUTES * 60 + 1).isValid).toBe(false); // Too long
    });

    it('should provide warnings for long files', () => {
      const result = validateDuration(3601); // Just over 1 hour
      expect(result.isValid).toBe(true);
      expect(result.warning).toContain('Long audio file detected');
    });

    it('should provide appropriate error messages', () => {
      const shortResult = validateDuration(0.5);
      expect(shortResult.error).toContain('too short');
      
      const longResult = validateDuration(MAX_DURATION_MINUTES * 60 + 1);
      expect(longResult.error).toContain('exceeds the maximum limit');
    });
  });

  describe('quickValidateAudioFile', () => {
    it('should validate supported audio files', () => {
      const validFile = new MockFile([], 'test.mp3', { type: 'audio/mpeg' });
      const result = quickValidateAudioFile(validFile);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.fileInfo).toBeDefined();
      expect(result.fileInfo?.format).toBe('audio/mpeg');
      expect(result.fileInfo?.extension).toBe('.mp3');
    });

    it('should reject unsupported files', () => {
      const invalidFile = new MockFile([], 'test.txt', { type: 'text/plain' });
      const result = quickValidateAudioFile(invalidFile);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Unsupported file format');
    });

    it('should reject oversized files', () => {
      const largeFile = new MockFile([], 'large.mp3', { type: 'large' });
      const result = quickValidateAudioFile(largeFile);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('exceeds the maximum limit'))).toBe(true);
    });

    it('should handle null file input', () => {
      const result = quickValidateAudioFile(null as any);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('No file provided');
    });
  });

  describe('Constants', () => {
    it('should have correct supported formats', () => {
      expect(SUPPORTED_AUDIO_FORMATS).toContain('audio/mpeg');
      expect(SUPPORTED_AUDIO_FORMATS).toContain('audio/wav');
      expect(SUPPORTED_AUDIO_FORMATS).toContain('audio/mp4');
      expect(SUPPORTED_AUDIO_FORMATS).toContain('audio/flac');
      
      expect(SUPPORTED_EXTENSIONS).toContain('.mp3');
      expect(SUPPORTED_EXTENSIONS).toContain('.wav');
      expect(SUPPORTED_EXTENSIONS).toContain('.m4a');
      expect(SUPPORTED_EXTENSIONS).toContain('.flac');
    });

    it('should have reasonable limits', () => {
      expect(MAX_FILE_SIZE_MB).toBe(100);
      expect(MAX_DURATION_MINUTES).toBe(120);
      expect(MIN_DURATION_SECONDS).toBe(1);
    });
  });
});
