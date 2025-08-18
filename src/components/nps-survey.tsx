'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

interface NPSSurveyProps {
  userId: string;
  onDismiss?: () => void;
}

export function NPSSurvey({ userId, onDismiss }: NPSSurveyProps) {
  const [score, setScore] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const trackNPSSurvey = useMutation(api.track_nps_survey.trackNPSSurvey);

  // Track that the survey was shown
  useEffect(() => {
    const trackSurveyShown = async () => {
      try {
        await trackNPSSurvey({
          userId,
          eventType: "survey_shown",
          timestamp: Date.now(),
        });
      } catch (error) {
        console.error("Error tracking NPS survey shown:", error);
      }
    };
    
    trackSurveyShown();
  }, [userId, trackNPSSurvey]);

  const handleSubmit = async () => {
    if (score === null) return;
    
    setIsSubmitting(true);
    
    try {
      // Track the survey submission
      await trackNPSSurvey({
        userId,
        eventType: "survey_submitted",
        score,
        timestamp: Date.now(),
      });
      
      setIsSubmitted(true);
      
      // Close the survey after a short delay
      setTimeout(() => {
        if (onDismiss) {
          onDismiss();
        }
      }, 2000);
    } catch (error) {
      console.error("Error submitting NPS survey:", error);
      alert("Failed to submit survey. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDismiss = async () => {
    try {
      // Track that the survey was dismissed
      await trackNPSSurvey({
        userId,
        eventType: "survey_dismissed",
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error("Error tracking NPS survey dismissal:", error);
    }
    
    if (onDismiss) {
      onDismiss();
    }
  };

  if (isSubmitted) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6 text-center">
          <h3 className="text-lg font-semibold mb-2">Thank you for your feedback!</h3>
          <p className="text-gray-600">
            Your response helps us improve EasyMinutes for everyone.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">How likely are you to recommend EasyMinutes to a friend or colleague?</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex justify-between">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <Button
                key={num}
                variant={score === num ? "default" : "outline"}
                className="w-8 h-8 p-0 text-xs"
                onClick={() => setScore(num)}
              >
                {num}
              </Button>
            ))}
          </div>
          
          <div className="flex justify-between text-xs text-gray-500">
            <span>Not at all likely</span>
            <span>Extremely likely</span>
          </div>
          
          {score !== null && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">
                  {score >= 9 ? "Excellent! What do you like most about EasyMinutes?" : 
                   score >= 7 ? "Thanks! How can we make EasyMinutes better for you?" : 
                   "We're sorry to hear that. What can we do to improve?"}
                </p>
                <textarea 
                  className="w-full p-2 border rounded-md text-sm"
                  rows={3}
                  placeholder="Share your thoughts (optional)"
                />
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleDismiss}
                >
                  Dismiss
                </Button>
              </div>
            </div>
          )}
          
          {score === null && (
            <div className="flex justify-center">
              <Button 
                variant="outline" 
                onClick={handleDismiss}
              >
                Not now
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}