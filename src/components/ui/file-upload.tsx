"use client";

import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Upload, FileAudio, CheckCircle } from "lucide-react";
import {
  quickValidateAudioFile,
  validateAudioFile,
  AudioValidationResult,
  SUPPORTED_EXTENSIONS,
  MAX_FILE_SIZE_MB
} from "@/lib/utils/audio-processing";

interface FileUploadProps {
  onFileSelect: (
    file: File, 
    onProgress?: (progress: number) => void,
    onStatusChange?: (status: string) => void
  ) => void;
  onMultipleFilesSelect?: (
    files: File[],
    onProgress?: (fileIndex: number, progress: number) => void,
    onStatusChange?: (fileIndex: number, status: string) => void
  ) => void;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
  disabled?: boolean;
  multiple?: boolean;
  supportedFormats?: string[];
}

export function FileUpload({
  onFileSelect,
  onMultipleFilesSelect,
  accept = "audio/*",
  maxSize = MAX_FILE_SIZE_MB,
  className,
  disabled = false,
  multiple = false,
  supportedFormats = SUPPORTED_EXTENSIONS,
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<AudioValidationResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      if (multiple && files.length > 1) {
        handleMultipleFileSelection(files);
      } else {
        handleFileSelection(files[0]);
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      if (multiple && files.length > 1) {
        handleMultipleFileSelection(files);
      } else {
        handleFileSelection(files[0]);
      }
    }
  };

  const handleMultipleFileSelection = async (files: File[]) => {
    if (!onMultipleFilesSelect) {
      // Fallback to single file processing if multiple handler not provided
      return handleFileSelection(files[0]);
    }

    setIsValidating(true);
    setValidationResult(null);
    
    try {
      // Validate all files first
      const validationResults = await Promise.all(
        files.map(file => quickValidateAudioFile(file))
      );
      
      const invalidFiles = validationResults.filter(result => !result.isValid);
      
      if (invalidFiles.length > 0) {
        setValidationResult({
          isValid: false,
          errors: [`${invalidFiles.length} of ${files.length} files are invalid`],
          warnings: []
        });
        setIsValidating(false);
        return;
      }
      
      // All files are valid, start batch processing
      setIsUploading(true);
      setUploadProgress(0);
      
      const handleProgress = (fileIndex: number, progress: number) => {
        // Calculate overall progress based on file index and individual progress
        const overallProgress = ((fileIndex * 100) + progress) / files.length;
        setUploadProgress(Math.round(overallProgress));
      };
      
      const handleStatusChange = (fileIndex: number, status: string) => {
        console.log(`File ${fileIndex + 1}/${files.length}: ${status}`);
      };
      
      try {
        await onMultipleFilesSelect(files, handleProgress, handleStatusChange);
        setValidationResult({
          isValid: true,
          errors: [],
          warnings: [],
          fileInfo: {
            size: files.reduce((acc, file) => acc + file.size, 0),
            sizeFormatted: `${files.length} files selected`,
            duration: undefined,
            durationFormatted: undefined,
            format: 'batch',
            extension: 'batch'
          }
        });
      } catch (error) {
        console.error('Multiple file processing failed:', error);
        setValidationResult({
          isValid: false,
          errors: [`Batch processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
          warnings: []
        });
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    } catch (error) {
      console.error('Multiple file validation error:', error);
      setValidationResult({
        isValid: false,
        errors: ['Failed to validate files. Please try again.'],
        warnings: []
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleFileSelection = async (file: File) => {
    setIsValidating(true);
    setValidationResult(null);
    
    try {
      // Quick validation first (for immediate UI feedback)
      const quickValidation = quickValidateAudioFile(file);
      setValidationResult(quickValidation);
      
      if (!quickValidation.isValid) {
        setIsValidating(false);
        return;
      }
      
      // Full validation including duration check
      const fullValidation = await validateAudioFile(file);
      setValidationResult(fullValidation);
      
      if (fullValidation.isValid) {
        // Use real progress tracking with callbacks
        setIsUploading(true);
        setUploadProgress(0);
        
        const handleProgress = (progress: number) => {
          setUploadProgress(progress);
        };
        
        const handleStatusChange = (status: string) => {
          // Update status but don't show it in this component
          // The status is shown in the parent component
          console.log('Upload status:', status);
        };
        
        try {
          await onFileSelect(file, handleProgress, handleStatusChange);
        } catch (error) {
          console.error('File processing failed:', error);
          setValidationResult({
            isValid: false,
            errors: [`Processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
            warnings: []
          });
        } finally {
          setIsUploading(false);
          setUploadProgress(0);
        }
      }
    } catch (error) {
      console.error('File validation error:', error);
      setValidationResult({
        isValid: false,
        errors: ['Failed to validate file. Please try again.'],
        warnings: []
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div
      className={cn(
        "relative rounded-lg border-2 border-dashed p-8 text-center transition-colors",
        {
          "border-primary bg-primary/5": isDragOver,
          "border-border hover:border-primary/50": !isDragOver && !disabled,
          "border-muted bg-muted/50 cursor-not-allowed": disabled,
          "cursor-pointer": !disabled,
        },
        className
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileInputChange}
        disabled={disabled}
        className="hidden"
      />

      {isValidating ? (
        <div className="space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <div className="space-y-2">
            <p className="text-sm font-medium">{multiple ? 'Validating files...' : 'Validating file...'}</p>
            <p className="text-xs text-muted-foreground">Checking format, size, and duration</p>
          </div>
        </div>
      ) : isUploading ? (
        <div className="space-y-4">
          <FileAudio className="mx-auto h-12 w-12 text-primary" />
          <div className="space-y-2">
            <p className="text-sm font-medium">Processing file...</p>
            <Progress value={uploadProgress} className="w-full" />
            <p className="text-xs text-muted-foreground">{uploadProgress}%</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {validationResult && !validationResult.isValid ? (
            <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
          ) : validationResult && validationResult.isValid ? (
            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
          ) : (
            <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
          )}
          
          <div>
            <p className="text-lg font-medium">
              {isDragOver 
                ? "Drop audio files here" 
                : multiple 
                  ? "Upload Audio Files"
                  : "Upload Audio File"
              }
            </p>
            <p className="text-sm text-muted-foreground">
              {validationResult && validationResult.isValid
                ? `Ready to process: ${validationResult.fileInfo?.sizeFormatted}`
                : multiple
                  ? "Drop files here or click to browse (multiple files supported)"
                  : "Drop files here or click to browse"}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Supported: {supportedFormats.join(', ')} • Max: {maxSize}MB {multiple ? 'per file' : ''}
            </p>
          </div>
          
          {/* Validation Results */}
          {validationResult && (
            <div className="space-y-2 text-left">
              {validationResult.errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <ul className="list-disc list-inside space-y-1">
                      {validationResult.errors.map((error, index) => (
                        <li key={index} className="text-sm">{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
              
              {validationResult.warnings.length > 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <ul className="list-disc list-inside space-y-1">
                      {validationResult.warnings.map((warning, index) => (
                        <li key={index} className="text-sm">{warning}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
              
              {validationResult.isValid && validationResult.fileInfo && (
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Size: {validationResult.fileInfo.sizeFormatted}</p>
                  {validationResult.fileInfo.durationFormatted && (
                    <p>Duration: {validationResult.fileInfo.durationFormatted}</p>
                  )}
                  <p>Format: {validationResult.fileInfo.extension.toUpperCase()}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
