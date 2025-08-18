'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, AudioLines, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AudioUploadProps {
  onAudioUpload: (file: File) => void;
  isLoading?: boolean;
  isProUser?: boolean;
  onUpgradeClick?: () => void;
}

export function AudioUpload({ 
  onAudioUpload, 
  isLoading = false, 
  isProUser = false,
  onUpgradeClick 
}: AudioUploadProps) {
  const [error, setError] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      handleFile(file);
    }
  };

  const handleFile = (file: File) => {
    // Validate file type
    const allowedTypes = ['audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/mp4', 'audio/mp4a-latm', 'audio/x-m4a'];
    const allowedExtensions = ['.wav', '.mp3', '.m4a'];
    
    const fileType = file.type;
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!allowedTypes.includes(fileType) && !allowedExtensions.includes(extension)) {
      setError('Invalid file type. Please upload a WAV, MP3, or M4A file.');
      return;
    }
    
    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size too large. Please upload a file smaller than 10MB.');
      return;
    }
    
    setError('');
    onAudioUpload(file);
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRecordToggle = () => {
    if (isRecording) {
      setIsRecording(false);
      // In a real implementation, this would stop recording
    } else {
      setIsRecording(true);
      // In a real implementation, this would start recording
    }
  };

  // For free users, show a disabled state with upgrade prompt
  if (!isProUser) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Upload Audio Recording</Label>
          
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center bg-gray-50">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="relative">
                <AudioLines className="h-10 w-10 text-gray-400" />
                <Lock className="h-4 w-4 text-gray-400 absolute -bottom-1 -right-1 bg-white rounded-full" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-900">
                  Audio Upload (Pro Feature)
                </p>
                <p className="text-xs text-gray-500">
                  Upload or record audio to transcribe and generate meeting minutes
                </p>
              </div>
              <Button 
                type="button" 
                variant="secondary" 
                disabled
                className="mt-2"
              >
                Select Audio File
              </Button>
              <Button 
                type="button" 
                variant="secondary" 
                disabled
                className="mt-2"
              >
                {isRecording ? 'Stop Recording' : 'Start Recording'}
              </Button>
            </div>
          </div>
        </div>
        
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Audio upload is a Pro-only feature. 
            <Button 
              variant="link" 
              className="px-1 text-blue-600 hover:text-blue-800" 
              onClick={onUpgradeClick}
            >
              Upgrade to Pro
            </Button> 
            to unlock audio transcription and generate meeting minutes from recordings.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="audio-upload">Upload Audio Recording</Label>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <input
            id="audio-upload"
            ref={fileInputRef}
            type="file"
            accept=".wav,.mp3,.m4a"
            onChange={handleFileChange}
            className="hidden"
            disabled={isLoading}
          />
          
          <div className="flex flex-col items-center justify-center space-y-4">
            <AudioLines className="h-10 w-10 text-gray-400" />
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-900">
                Drag and drop your audio file here, or click to browse
              </p>
              <p className="text-xs text-gray-500">
                Supports WAV, MP3, and M4A files (Max 10MB)
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button 
                type="button" 
                variant="secondary" 
                disabled={isLoading}
                onClick={handleButtonClick}
                className="w-full sm:w-auto"
              >
                Select Audio File
              </Button>
              <Button 
                type="button" 
                variant={isRecording ? "destructive" : "secondary"} 
                disabled={isLoading}
                onClick={handleRecordToggle}
                className="w-full sm:w-auto"
              >
                {isRecording ? 'Stop Recording' : 'Start Recording'}
              </Button>
            </div>
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