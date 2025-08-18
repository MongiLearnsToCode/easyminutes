'use client';

import { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { Clock } from 'lucide-react';

interface AIProcessingAnimationProps {
  isLoading: boolean;
  estimatedTime?: number; // in seconds
}

export function AIProcessingAnimation({ isLoading, estimatedTime = 10 }: AIProcessingAnimationProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isLoading) {
      interval = setInterval(() => {
        setElapsedTime(prev => {
          const newTime = prev + 0.1;
          // Calculate progress as a percentage (0-100)
          // We'll make it a bit optimistic to seem faster
          const calculatedProgress = Math.min(100, (newTime / (estimatedTime * 0.9)) * 100);
          setProgress(calculatedProgress);
          return newTime;
        });
      }, 100);
    } else {
      // Reset when loading is complete
      setElapsedTime(0);
      setProgress(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading, estimatedTime]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-xl">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-24 h-24 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Clock className="w-10 h-10 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-900">Processing Meeting Minutes</h3>
            <p className="text-gray-600">
              Our AI is analyzing your content and generating Fortune-500 style minutes...
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
            <div className="flex justify-between text-sm text-gray-500">
              <span>Time elapsed: {elapsedTime.toFixed(1)}s</span>
              <span>Estimated: {estimatedTime}s</span>
            </div>
          </div>
          
          <div className="flex justify-center pt-2">
            <div className="flex space-x-1">
              {[...Array(3)].map((_, i) => (
                <div 
                  key={i} 
                  className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" 
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}