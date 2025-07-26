"use client";

import { useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
  disabled?: boolean;
}

export function FileUpload({
  onFileSelect,
  accept = "audio/*",
  maxSize = 100,
  className,
  disabled = false,
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
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
      handleFileSelection(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleFileSelection = (file: File) => {
    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      alert(`File size must be less than ${maxSize}MB`);
      return;
    }

    // Simulate upload progress
    setIsUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          onFileSelect(file);
          return 100;
        }
        return prev + 10;
      });
    }, 100);
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
        onChange={handleFileInputChange}
        disabled={disabled}
        className="hidden"
      />

      {isUploading ? (
        <div className="space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Uploading...</p>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-xs text-muted-foreground">{uploadProgress}%</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <svg
            className="mx-auto h-12 w-12 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <div>
            <p className="text-lg font-medium">
              {isDragOver ? "Drop files here" : "Upload files"}
            </p>
            <p className="text-sm text-muted-foreground">
              Drop files here or click to browse
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Max file size: {maxSize}MB
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
