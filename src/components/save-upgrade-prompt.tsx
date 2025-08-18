'use client';

import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, Crown } from 'lucide-react';

interface SaveUpgradePromptProps {
  onUpgradeClick: () => void;
  onDismiss?: () => void;
}

export function SaveUpgradePrompt({ onUpgradeClick, onDismiss }: SaveUpgradePromptProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  
  if (isDismissed) return null;
  
  const handleDismiss = () => {
    setIsDismissed(true);
    if (onDismiss) {
      onDismiss();
    }
  };
  
  return (
    <Alert className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Upgrade to Save Your Work</AlertTitle>
      <AlertDescription>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <p>
              Upgrade to Pro to save and version your meeting minutes.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              onClick={onUpgradeClick} 
              className="w-full sm:w-auto"
            >
              <Crown className="h-4 w-4 mr-2" />
              Upgrade to Pro
            </Button>
            <Button 
              variant="ghost" 
              onClick={handleDismiss}
              className="w-full sm:w-auto"
            >
              Dismiss
            </Button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}