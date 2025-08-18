'use client';

import { useState, useRef, ChangeEvent, KeyboardEvent } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface TextPasteBoxProps {
  onGenerate: (text: string) => void;
  isLoading?: boolean;
}

export function TextPasteBox({ onGenerate, isLoading = false }: TextPasteBoxProps) {
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const validateInput = (input: string): string => {
    if (input.trim().length === 0) {
      return 'Please enter some text to generate meeting minutes.';
    }
    
    if (input.trim().length < 10) {
      return 'Input text is too short. Please provide more details about the meeting.';
    }
    
    if (input.length > 10000) {
      return 'Input text is too long. Please limit your input to 10,000 characters.';
    }
    
    return '';
  };

  const handleGenerate = () => {
    const validationError = validateInput(text);
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setError('');
    onGenerate(text);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Allow Ctrl+Enter or Cmd+Enter to submit
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleGenerate();
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="meeting-notes">Meeting Notes</Label>
        <Textarea
          ref={textareaRef}
          id="meeting-notes"
          placeholder="Paste your meeting notes here... (Ctrl+Enter to generate)"
          value={text}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
            setText(e.target.value);
            // Clear error when user starts typing
            if (error) setError('');
          }}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          rows={8}
          className="font-mono text-sm"
        />
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="flex justify-end">
        <Button 
          onClick={handleGenerate} 
          disabled={isLoading || text.trim().length === 0}
          className="w-full sm:w-auto"
        >
          {isLoading ? 'Generating...' : 'Generate Minutes'}
        </Button>
      </div>
    </div>
  );
}