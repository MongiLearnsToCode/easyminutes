'use client';

import { useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useCallback, useState } from 'react';

export interface MeetingMinutes {
  title: string;
  executiveSummary: string;
  actionMinutes: string;
  attendees: Array<{
    name: string;
    role: string;
  }>;
  decisions: Array<{
    description: string;
    madeBy: string;
    date: string;
  }>;
  risks: Array<{
    description: string;
    mitigation: string;
  }>;
  actionItems: Array<{
    description: string;
    owner: string;
    deadline: string;
  }>;
  observations: Array<{
    description: string;
  }>;
}

export interface ProcessMeetingNotesResult {
  success: boolean;
  minutesId?: string;
  meetingMinutes?: MeetingMinutes;
  error?: string;
  processingTime?: number;
}

export function useProcessMeetingNotes() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ProcessMeetingNotesResult | null>(null);
  
  const processMeetingNotes = useAction(api.openai.processMeetingNotes);

  const processNotes = useCallback(async (text: string, userId: string) => {
    setIsLoading(true);
    setResult(null);
    
    try {
      const response = await processMeetingNotes({ text, userId });
      setResult(response);
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      const errorResult: ProcessMeetingNotesResult = {
        success: false,
        error: errorMessage,
      };
      setResult(errorResult);
      return errorResult;
    } finally {
      setIsLoading(false);
    }
  }, [processMeetingNotes]);

  return {
    processNotes,
    isLoading,
    result,
    setResult,
  };
}