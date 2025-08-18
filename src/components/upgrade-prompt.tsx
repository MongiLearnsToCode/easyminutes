'use client';

import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, Crown } from 'lucide-react';

interface UpgradePromptProps {
  onUpgradeClick: () => void;
  freeGenerationsUsed: number;
  limit: number;
}

export function UpgradePrompt({ onUpgradeClick, freeGenerationsUsed, limit }: UpgradePromptProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  
  if (isDismissed) return null;
  
  const isLimitReached = freeGenerationsUsed >= limit;
  
  return (
    <Alert variant={isLimitReached ? "destructive" : "default"} className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>
        {isLimitReached ? "Free Generation Limit Reached" : "Approaching Free Generation Limit"}
      </AlertTitle>
      <AlertDescription>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <p>
              {isLimitReached
                ? "You've reached your limit of 3 free generations."
                : `You've used ${freeGenerationsUsed} of ${limit} free generations.`}
            </p>
            <p className="mt-2">
              Upgrade to Pro for unlimited generations and access to all premium features.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              onClick={onUpgradeClick} 
              className="w-full sm:w-auto"
              variant={isLimitReached ? "default" : "outline"}
            >
              <Crown className="h-4 w-4 mr-2" />
              Upgrade to Pro
            </Button>
            {!isLimitReached && (
              <Button 
                variant="ghost" 
                onClick={() => setIsDismissed(true)}
                className="w-full sm:w-auto"
              >
                Dismiss
              </Button>
            )}
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}