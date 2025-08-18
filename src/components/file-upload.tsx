'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileUpload: (file: File, text: string) => void;
  isLoading?: boolean;
}

export function FileUpload({ onFileUpload, isLoading = false }: FileUploadProps) {
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string => {
    const allowedTypes = [
      'text/plain', // TXT
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
    ];
    
    const allowedExtensions = ['.txt', '.docx'];
    
    // Check file type
    if (!allowedTypes.includes(file.type)) {
      // Also check extension as fallback
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!allowedExtensions.includes(extension)) {
        return `Invalid file type. Please upload a TXT or DOCX file. (Got: ${file.type || extension})`;
      }
    }
    
    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return 'File size too large. Please upload a file smaller than 5MB.';
    }
    
    return '';
  };

  const extractTextFromFile = async (file: File): Promise<string> => {
    const fileType = file.type;
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    // Handle TXT files
    if (fileType === 'text/plain' || extension === '.txt') {
      return await file.text();
    }
    
    // Handle DOCX files
    if (
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      extension === '.docx'
    ) {
      // Dynamically import mammoth to avoid server-side issues
      const { default: mammoth } = await import('mammoth');
      
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = async (event) => {
          try {
            const arrayBuffer = event.target?.result;
            if (arrayBuffer instanceof ArrayBuffer) {
              const result = await mammoth.extractRawText({ arrayBuffer });
              resolve(result.value);
            } else {
              reject(new Error('Failed to read file as ArrayBuffer'));
            }
          } catch (error) {
            reject(error);
          }
        };
        
        reader.onerror = () => {
          reject(new Error('Failed to read file'));
        };
        
        reader.readAsArrayBuffer(file);
      });
    }
    
    // Fallback
    throw new Error('Unsupported file type');
  };

  const handleFiles = async (files: FileList) => {
    if (files.length === 0) return;
    
    const file = files[0];
    const validationError = validateFile(file);
    
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setError('');
    
    try {
      const text = await extractTextFromFile(file);
      onFileUpload(file, text);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process file. Please try another file.';
      setError(errorMessage);
      console.error('File processing error:', err);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="file-upload">Upload Meeting Notes</Label>
        
        <div 
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
            dragActive ? "border-primary bg-primary/5" : "border-gray-300 hover:border-gray-400",
            isLoading && "opacity-50 cursor-not-allowed"
          )}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={handleButtonClick}
        >
          <Input
            id="file-upload"
            ref={fileInputRef}
            type="file"
            accept=".txt,.docx"
            onChange={handleChange}
            className="hidden"
            disabled={isLoading}
          />
          
          <div className="flex flex-col items-center justify-center space-y-4">
            <FileText className="h-10 w-10 text-gray-400" />
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-900">
                Drag and drop your file here, or click to browse
              </p>
              <p className="text-xs text-gray-500">
                Supports TXT and DOCX files (Max 5MB)
              </p>
            </div>
            <Button 
              type="button" 
              variant="secondary" 
              disabled={isLoading}
              className="mt-2"
            >
              Select File
            </Button>
          </div>
        </div>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}