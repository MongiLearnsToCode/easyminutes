"use client";

import { useState } from "react";
import { FileUpload } from "./file-upload";
import { Button } from "./button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";
import { Progress } from "./progress";
import { Alert, AlertDescription } from "./alert";
import { Badge } from "./badge";
import { CheckCircle, AlertCircle, FileAudio, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface BatchUploadFile {
  file: File;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  error?: string;
  result?: any;
}

interface BatchUploadProps {
  onFileSelect: (
    file: File,
    onProgress?: (progress: number) => void,
    onStatusChange?: (status: string) => void
  ) => void;
  onBatchComplete?: (results: any[]) => void;
  disabled?: boolean;
  className?: string;
}

export function BatchUpload({
  onFileSelect,
  onBatchComplete,
  disabled = false,
  className
}: BatchUploadProps) {
  const [files, setFiles] = useState<BatchUploadFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showBatchMode, setShowBatchMode] = useState(false);

  const handleSingleFileSelect = async (
    file: File,
    onProgress?: (progress: number) => void,
    onStatusChange?: (status: string) => void
  ) => {
    await onFileSelect(file, onProgress, onStatusChange);
  };

  const handleMultipleFilesSelect = async (
    selectedFiles: File[],
    onProgress?: (fileIndex: number, progress: number) => void,
    onStatusChange?: (fileIndex: number, status: string) => void
  ) => {
    // Set up batch processing
    const batchFiles: BatchUploadFile[] = selectedFiles.map(file => ({
      file,
      status: 'pending' as const,
      progress: 0
    }));
    
    setFiles(batchFiles);
    setShowBatchMode(true);
    setIsProcessing(true);

    const results: any[] = [];

    try {
      // Process files sequentially
      for (let i = 0; i < batchFiles.length; i++) {
        const batchFile = batchFiles[i];
        
        // Update file status to processing
        setFiles(prev => prev.map((f, index) => 
          index === i ? { ...f, status: 'processing' as const } : f
        ));

        try {
          const handleFileProgress = (progress: number) => {
            onProgress?.(i, progress);
            setFiles(prev => prev.map((f, index) => 
              index === i ? { ...f, progress } : f
            ));
          };

          const handleFileStatusChange = (status: string) => {
            onStatusChange?.(i, status);
          };

          // Process individual file
          const result = await new Promise((resolve, reject) => {
            let fileResult: any = null;
            
            const originalOnFileSelect = onFileSelect;
            const wrappedOnFileSelect = async (
              file: File,
              onProgress?: (progress: number) => void,
              onStatusChange?: (status: string) => void
            ) => {
              try {
                await originalOnFileSelect(file, onProgress, onStatusChange);
                resolve(fileResult || { success: true, file: file.name });
              } catch (error) {
                reject(error);
              }
            };

            wrappedOnFileSelect(batchFile.file, handleFileProgress, handleFileStatusChange);
          });

          results.push(result);

          // Update file status to completed
          setFiles(prev => prev.map((f, index) => 
            index === i ? { ...f, status: 'completed' as const, progress: 100, result } : f
          ));

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Processing failed';
          
          // Update file status to error
          setFiles(prev => prev.map((f, index) => 
            index === i ? { ...f, status: 'error' as const, error: errorMessage } : f
          ));
          
          results.push({ success: false, error: errorMessage, file: batchFile.file.name });
        }
      }

      onBatchComplete?.(results);
    } finally {
      setIsProcessing(false);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    if (files.length === 1) {
      setShowBatchMode(false);
    }
  };

  const clearAll = () => {
    setFiles([]);
    setShowBatchMode(false);
    setIsProcessing(false);
  };

  const retryFile = async (index: number) => {
    const file = files[index];
    if (!file) return;

    setFiles(prev => prev.map((f, i) => 
      i === index ? { ...f, status: 'processing' as const, progress: 0, error: undefined } : f
    ));

    try {
      const handleFileProgress = (progress: number) => {
        setFiles(prev => prev.map((f, i) => 
          i === index ? { ...f, progress } : f
        ));
      };

      await onFileSelect(file.file, handleFileProgress);

      setFiles(prev => prev.map((f, i) => 
        i === index ? { ...f, status: 'completed' as const, progress: 100 } : f
      ));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Processing failed';
      setFiles(prev => prev.map((f, i) => 
        i === index ? { ...f, status: 'error' as const, error: errorMessage } : f
      ));
    }
  };

  const completedCount = files.filter(f => f.status === 'completed').length;
  const errorCount = files.filter(f => f.status === 'error').length;
  const overallProgress = files.length > 0 ? (completedCount / files.length) * 100 : 0;

  return (
    <div className={cn("space-y-6", className)}>
      {/* File Upload Component */}
      <FileUpload
        onFileSelect={handleSingleFileSelect}
        onMultipleFilesSelect={handleMultipleFilesSelect}
        multiple={true}
        disabled={disabled || isProcessing}
      />

      {/* Batch Processing Display */}
      {showBatchMode && files.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Batch Processing</CardTitle>
                <CardDescription>
                  Processing {files.length} files • {completedCount} completed • {errorCount} failed
                </CardDescription>
              </div>
              <div className="flex gap-2">
                {!isProcessing && (
                  <Button variant="outline" size="sm" onClick={clearAll}>
                    Clear All
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Overall Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Progress</span>
                <span>{Math.round(overallProgress)}%</span>
              </div>
              <Progress value={overallProgress} className="w-full" />
            </div>

            {/* File List */}
            <div className="space-y-3">
              {files.map((batchFile, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 border rounded-lg"
                >
                  {/* Status Icon */}
                  <div className="flex-shrink-0">
                    {batchFile.status === 'pending' && (
                      <FileAudio className="h-5 w-5 text-muted-foreground" />
                    )}
                    {batchFile.status === 'processing' && (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                    )}
                    {batchFile.status === 'completed' && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    {batchFile.status === 'error' && (
                      <AlertCircle className="h-5 w-5 text-destructive" />
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{batchFile.file.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {(batchFile.file.size / (1024 * 1024)).toFixed(1)} MB
                      </Badge>
                      <Badge 
                        variant={
                          batchFile.status === 'completed' ? 'default' :
                          batchFile.status === 'error' ? 'destructive' :
                          batchFile.status === 'processing' ? 'secondary' : 'outline'
                        }
                        className="text-xs"
                      >
                        {batchFile.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Progress */}
                  {batchFile.status === 'processing' && (
                    <div className="flex-shrink-0 w-20">
                      <Progress value={batchFile.progress} className="h-2" />
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex-shrink-0 flex gap-1">
                    {batchFile.status === 'error' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => retryFile(index)}
                        disabled={isProcessing}
                      >
                        Retry
                      </Button>
                    )}
                    {!isProcessing && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Error Summary */}
            {errorCount > 0 && !isProcessing && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {errorCount} file{errorCount > 1 ? 's' : ''} failed to process. You can retry individual files or remove them from the batch.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
