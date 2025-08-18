'use client';

import { useEffect, useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { MeetingMinutesDisplay } from '@/components/meeting-minutes-display';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function SharedMinutesPage({ params }: { params: { shareId: string } }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // TODO: Implement the query to get shared meeting minutes
  // const sharedMinutes = useQuery(api.get_shared_minutes.getSharedMeetingMinutes, {
  //   shareId: params.shareId,
  // });
  
  // For now, we'll simulate the data
  const sharedMinutes: any = null;
  
  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
      // Simulate error for demo purposes
      setError('Shared minutes not found or expired.');
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [params.shareId]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading shared meeting minutes...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Unable to Access Shared Minutes</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => router.push('/')}>
            Generate Your Own Minutes
          </Button>
        </div>
      </div>
    );
  }
  
  // This part would be used when we have real data
  /*
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">EasyMinutes</h1>
        </div>
      </header>
      
      <main className="flex-grow flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl w-full">
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <h2 className="text-lg font-semibold text-blue-800">Shared Meeting Minutes</h2>
            <p className="text-blue-700">
              This document was shared with you. It was generated on{' '}
              {new Date(sharedMinutes.shareableLink.createdAt).toLocaleDateString()}.
            </p>
          </div>
          
          <MeetingMinutesDisplay 
            minutes={sharedMinutes.minutes} 
            isProUser={false} // Shared minutes are view-only
          />
        </div>
      </main>
    </div>
  );
  */
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Shared Meeting Minutes</h1>
        <p className="text-gray-600 mb-6">
          This feature is not yet implemented in this demo.
        </p>
        <Button onClick={() => router.push('/')}>
          Generate Your Own Minutes
        </Button>
      </div>
    </div>
  );
}