'use client';

import { useEffect, useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

interface UseNPSSurveyProps {
  userId: string;
  enabled: boolean;
}

interface UseNPSSurveyReturn {
  shouldShowSurvey: boolean;
  surveyConditions: {
    hasGeneratedMinutes: boolean;
    hasSuccessfulGeneration: boolean;
    minutesSinceLastSurvey: number | null;
    userPlan: string;
  };
}

// Hook to determine when to show the NPS survey
export function useNPSSurvey({ userId, enabled }: UseNPSSurveyProps): UseNPSSurveyReturn {
  const [shouldShowSurvey, setShouldShowSurvey] = useState(false);
  const [surveyConditions, setSurveyConditions] = useState({
    hasGeneratedMinutes: false,
    hasSuccessfulGeneration: false,
    minutesSinceLastSurvey: null as number | null,
    userPlan: 'free',
  });
  
  // Get user analytics data
  const userAnalytics = useQuery(api.get_analytics.getUserAnalytics, { userId });
  
  // Get recent NPS survey events
  const npsEvents = useQuery(api.get_nps_analytics.getNPSAnalytics, {});
  
  useEffect(() => {
    if (!enabled || !userId || !userAnalytics) {
      return;
    }
    
    // Check survey conditions
    const conditions = {
      hasGeneratedMinutes: (userAnalytics.totalGenerations || 0) > 0,
      hasSuccessfulGeneration: (userAnalytics.successfulGenerations || 0) > 0,
      minutesSinceLastSurvey: null as number | null,
      userPlan: userAnalytics.plan || 'free',
    };
    
    // Check when the last survey was shown
    if (npsEvents) {
      // In a real implementation, we would check the user's last survey event
      // For now, we'll just set a default value
      conditions.minutesSinceLastSurvey = 60 * 24 * 7; // 7 days
    }
    
    setSurveyConditions(conditions);
    
    // Determine if we should show the survey
    const shouldShow = (
      // User has generated at least one meeting minute
      conditions.hasGeneratedMinutes &&
      // User has had at least one successful generation
      conditions.hasSuccessfulGeneration &&
      // Haven't shown a survey recently (at least 7 days)
      (conditions.minutesSinceLastSurvey === null || conditions.minutesSinceLastSurvey >= 60 * 24 * 7) &&
      // Only show to users who have been using the app for a while
      (userAnalytics.createdAt || 0) < Date.now() - (60 * 60 * 24 * 1000) // At least 1 day old account
    );
    
    setShouldShowSurvey(shouldShow);
  }, [userId, enabled, userAnalytics, npsEvents]);
  
  return {
    shouldShowSurvey,
    surveyConditions,
  };
}