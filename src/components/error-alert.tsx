'use client';

import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, RotateCcw } from 'lucide-react';

interface ErrorAlertProps {
  error: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  type?: 'error' | 'warning' | 'info' | 'success';
  retryLabel?: string;
  dismissLabel?: string;
  showRetry?: boolean;
  showDismiss?: boolean;
}

export function ErrorAlert({
  error,
  onRetry,
  onDismiss,
  type = 'error',
  retryLabel = 'Retry',
  dismissLabel = 'Dismiss',
  showRetry = true,
  showDismiss = false
}: ErrorAlertProps) {
  const [isRetrying, setIsRetrying] = useState(false);
  
  const handleRetry = async () => {
    if (onRetry) {
      setIsRetrying(true);
      try {
        await onRetry();
      } finally {
        setIsRetrying(false);
      }
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4" />;
      case 'info':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'success':
        return 'Success';
      case 'warning':
        return 'Warning';
      case 'info':
        return 'Information';
      default:
        return 'Error';
    }
  };

  const getVariant = () => {
    switch (type) {
      case 'success':
        return 'default';
      case 'warning':
        return 'destructive';
      case 'info':
        return 'default';
      default:
        return 'destructive';
    }
  };

  return (
    <Alert variant={getVariant()} className="mb-4">
      {getIcon()}
      <AlertTitle>{getTitle()}</AlertTitle>
      <AlertDescription>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            {error}
          </div>
          <div className="flex gap-2">
            {showRetry && onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
                disabled={isRetrying}
                className="w-full sm:w-auto"
              >
                <RotateCcw className={`h-4 w-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
                {isRetrying ? 'Retrying...' : retryLabel}
              </Button>
            )}
            {showDismiss && onDismiss && (
              <Button
                variant="outline"
                size="sm"
                onClick={onDismiss}
                className="w-full sm:w-auto"
              >
                {dismissLabel}
              </Button>
            )}
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}