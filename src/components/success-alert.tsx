'use client';

import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, X } from 'lucide-react';

interface SuccessAlertProps {
  title?: string;
  message: string;
  processingTime?: number;
  onDismiss?: () => void;
  showDismiss?: boolean;
  dismissLabel?: string;
}

export function SuccessAlert({
  title = 'Success',
  message,
  processingTime,
  onDismiss,
  showDismiss = false,
  dismissLabel = 'Dismiss'
}: SuccessAlertProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  
  const handleDismiss = () => {
    setIsDismissed(true);
    if (onDismiss) {
      onDismiss();
    }
  };

  if (isDismissed) return null;

  return (
    <Alert className="mb-4">
      <CheckCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <p>{message}</p>
            {processingTime && (
              <div className="flex items-center text-sm text-gray-500 mt-2">
                <Clock className="h-4 w-4 mr-1" />
                Processed in {(processingTime / 1000).toFixed(1)}s
              </div>
            )}
          </div>
          {showDismiss && onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}