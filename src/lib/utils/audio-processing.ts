/**
 * Audio file validation and processing utilities
 * Handles file format validation, size limits, and duration checks
 */

// Supported audio formats as specified in PRD
export const SUPPORTED_AUDIO_FORMATS = [
  'audio/mpeg', // .mp3
  'audio/wav', // .wav
  'audio/x-wav', // .wav (alternative MIME type)
  'audio/mp4', // .m4a
  'audio/x-m4a', // .m4a (alternative MIME type)
  'audio/flac', // .flac
  'audio/x-flac', // .flac (alternative MIME type)
];

// File extensions mapping
export const SUPPORTED_EXTENSIONS = ['.mp3', '.wav', '.m4a', '.flac'];

// Constants from PRD requirements
export const MAX_FILE_SIZE_MB = 100;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
export const MAX_DURATION_MINUTES = 120; // 2 hours reasonable limit
export const MIN_DURATION_SECONDS = 1; // Minimum 1 second

export interface AudioValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  fileInfo?: {
    size: number;
    sizeFormatted: string;
    duration?: number;
    durationFormatted?: string;
    format: string;
    extension: string;
  };
}

export interface AudioFileInfo {
  size: number;
  sizeFormatted: string;
  duration: number;
  durationFormatted: string;
  format: string;
  extension: string;
  bitrate?: number;
  sampleRate?: number;
}

/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format duration in human-readable format
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.toLowerCase().substring(filename.lastIndexOf('.'));
}

/**
 * Check if file format is supported
 */
export function isSupportedFormat(file: File): boolean {
  const extension = getFileExtension(file.name);
  return SUPPORTED_AUDIO_FORMATS.includes(file.type) || SUPPORTED_EXTENSIONS.includes(extension);
}

/**
 * Validate file size
 */
export function validateFileSize(file: File): { isValid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      isValid: false,
      error: `File size (${formatFileSize(file.size)}) exceeds the maximum limit of ${MAX_FILE_SIZE_MB}MB`
    };
  }
  
  if (file.size === 0) {
    return {
      isValid: false,
      error: 'File appears to be empty'
    };
  }
  
  return { isValid: true };
}

/**
 * Get audio duration using Web Audio API
 */
export async function getAudioDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    const objectUrl = URL.createObjectURL(file);
    
    audio.addEventListener('loadedmetadata', () => {
      URL.revokeObjectURL(objectUrl);
      resolve(audio.duration);
    });
    
    audio.addEventListener('error', () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load audio metadata'));
    });
    
    audio.src = objectUrl;
  });
}

/**
 * Validate audio duration
 */
export function validateDuration(duration: number): { isValid: boolean; error?: string; warning?: string } {
  if (duration < MIN_DURATION_SECONDS) {
    return {
      isValid: false,
      error: `Audio duration (${formatDuration(duration)}) is too short. Minimum duration is ${MIN_DURATION_SECONDS} second.`
    };
  }
  
  const maxDurationSeconds = MAX_DURATION_MINUTES * 60;
  if (duration > maxDurationSeconds) {
    return {
      isValid: false,
      error: `Audio duration (${formatDuration(duration)}) exceeds the maximum limit of ${MAX_DURATION_MINUTES} minutes (${formatDuration(maxDurationSeconds)})`
    };
  }
  
  // Warning for long files (over 1 hour)
  if (duration > 3600) {
    return {
      isValid: true,
      warning: `Long audio file detected (${formatDuration(duration)}). Processing may take several minutes.`
    };
  }
  
  return { isValid: true };
}

/**
 * Comprehensive audio file validation
 */
export async function validateAudioFile(file: File): Promise<AudioValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Basic file checks
  if (!file) {
    return {
      isValid: false,
      errors: ['No file provided'],
      warnings: []
    };
  }
  
  // Format validation
  if (!isSupportedFormat(file)) {
    errors.push(`Unsupported file format. Supported formats: ${SUPPORTED_EXTENSIONS.join(', ')}`);
  }
  
  // Size validation
  const sizeValidation = validateFileSize(file);
  if (!sizeValidation.isValid && sizeValidation.error) {
    errors.push(sizeValidation.error);
  }
  
  // If basic validations fail, return early
  if (errors.length > 0) {
    return {
      isValid: false,
      errors,
      warnings,
      fileInfo: {
        size: file.size,
        sizeFormatted: formatFileSize(file.size),
        format: file.type || 'unknown',
        extension: getFileExtension(file.name)
      }
    };
  }
  
  // Duration validation (requires loading the file)
  let duration: number | undefined;
  try {
    duration = await getAudioDuration(file);
    const durationValidation = validateDuration(duration);
    
    if (!durationValidation.isValid && durationValidation.error) {
      errors.push(durationValidation.error);
    }
    
    if (durationValidation.warning) {
      warnings.push(durationValidation.warning);
    }
  } catch {
    warnings.push('Could not determine audio duration. File will be processed, but duration validation was skipped.');
  }
  
  const fileInfo: AudioValidationResult['fileInfo'] = {
    size: file.size,
    sizeFormatted: formatFileSize(file.size),
    format: file.type || 'unknown',
    extension: getFileExtension(file.name),
    duration,
    durationFormatted: duration ? formatDuration(duration) : undefined
  };
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    fileInfo
  };
}

/**
 * Quick validation for UI feedback (without duration check)
 */
export function quickValidateAudioFile(file: File): AudioValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!file) {
    return {
      isValid: false,
      errors: ['No file provided'],
      warnings: []
    };
  }
  
  // Format validation
  if (!isSupportedFormat(file)) {
    errors.push(`Unsupported file format. Supported formats: ${SUPPORTED_EXTENSIONS.join(', ')}`);
  }
  
  // Size validation
  const sizeValidation = validateFileSize(file);
  if (!sizeValidation.isValid && sizeValidation.error) {
    errors.push(sizeValidation.error);
  }
  
  const fileInfo: AudioValidationResult['fileInfo'] = {
    size: file.size,
    sizeFormatted: formatFileSize(file.size),
    format: file.type || 'unknown',
    extension: getFileExtension(file.name)
  };
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    fileInfo
  };
}

/**
 * Get detailed audio file information (for display purposes)
 */
export async function getAudioFileInfo(file: File): Promise<AudioFileInfo> {
  const duration = await getAudioDuration(file);
  
  return {
    size: file.size,
    sizeFormatted: formatFileSize(file.size),
    duration,
    durationFormatted: formatDuration(duration),
    format: file.type || 'unknown',
    extension: getFileExtension(file.name)
  };
}
