"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, FileText, CheckCircle, Trash2 } from "lucide-react";

interface TextInputProps {
  onTextSubmit: (text: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  minLength?: number;
  maxLength?: number;
  showStats?: boolean;
}

export function TextInput({
  onTextSubmit,
  placeholder = "Paste your raw meeting notes here...",
  className,
  disabled = false,
  minLength = 10,
  maxLength = 50000,
  showStats = true,
}: TextInputProps) {
  const [text, setText] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [validation, setValidation] = useState<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }>({ isValid: true, errors: [], warnings: [] });
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [text]);

  // Validate text content
  useEffect(() => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (text.length > 0) {
      if (text.length < minLength) {
        errors.push(`Text must be at least ${minLength} characters long`);
      }
      
      if (text.length > maxLength) {
        errors.push(`Text must not exceed ${maxLength} characters`);
      }

      // Check for common issues
      if (text.trim().split('\n').length < 3) {
        warnings.push("Consider adding more structure to your notes for better AI processing");
      }

      // Check for excessive repetition
      const words = text.toLowerCase().split(/\s+/);
      const wordCount = words.length;
      const uniqueWords = new Set(words).size;
      if (wordCount > 20 && uniqueWords / wordCount < 0.3) {
        warnings.push("Text contains a lot of repetition - consider cleaning it up");
      }
    }

    setValidation({
      isValid: errors.length === 0,
      errors,
      warnings,
    });
  }, [text, minLength, maxLength]);

  const handleSubmit = () => {
    if (validation.isValid && text.trim()) {
      onTextSubmit(text.trim());
    }
  };

  const handleClear = () => {
    setText("");
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    // Allow default paste behavior, but could add processing here if needed
    setTimeout(() => {
      if (textareaRef.current) {
        const newText = textareaRef.current.value;
        setText(newText);
      }
    }, 0);
  };

  const wordCount = text.trim().split(/\s+/).filter(word => word.length > 0).length;
  const charCount = text.length;
  const lineCount = text.split('\n').length;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Input Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <label className="text-sm font-medium">Raw Meeting Notes</label>
        </div>
        {text.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="h-auto p-1 text-muted-foreground hover:text-foreground"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Text Input Area */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onPaste={handlePaste}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "w-full min-h-[150px] max-h-[400px] rounded-md border bg-background px-3 py-2 text-sm resize-none transition-colors",
            "placeholder:text-muted-foreground",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            {
              "border-input": !isFocused && validation.isValid,
              "border-primary": isFocused && validation.isValid,
              "border-destructive": !validation.isValid,
              "opacity-50 cursor-not-allowed": disabled,
            }
          )}
        />
        
        {/* Character count indicator */}
        {showStats && text.length > 0 && (
          <div className="absolute bottom-2 right-2 flex gap-2">
            <Badge variant="secondary" className="text-xs">
              {charCount}/{maxLength}
            </Badge>
          </div>
        )}
      </div>

      {/* Statistics */}
      {showStats && text.length > 0 && (
        <div className="flex gap-4 text-xs text-muted-foreground">
          <span>{wordCount} words</span>
          <span>{charCount} characters</span>
          <span>{lineCount} lines</span>
        </div>
      )}

      {/* Validation Messages */}
      {validation.errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {validation.errors.map((error, index) => (
                <li key={index} className="text-sm">{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {validation.warnings.length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {validation.warnings.map((warning, index) => (
                <li key={index} className="text-sm">💡 {warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Success indicator */}
      {text.length > 0 && validation.isValid && validation.errors.length === 0 && (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <CheckCircle className="h-4 w-4" />
          <span>Ready to process</span>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex gap-2">
        <Button
          onClick={handleSubmit}
          disabled={disabled || !validation.isValid || !text.trim()}
          className="flex-1"
        >
          Process Meeting Notes
        </Button>
      </div>
    </div>
  );
}
