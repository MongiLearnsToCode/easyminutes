'use client';

import { useUser, useAuth } from '@clerk/clerk-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import UserProfile from '@/components/user-profile';
import { useSyncUserProfile } from '@/hooks/use-sync-user-profile';
import { TextPasteBox } from '@/components/text-paste-box';
import { FileUpload } from '@/components/file-upload';
import { AudioUpload } from '@/components/audio-upload';
import { MeetingMinutesDisplay } from '@/components/meeting-minutes-display';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useProcessMeetingNotes } from '@/hooks/use-process-meeting-notes';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
  const { isSignedIn, user, isLoaded } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('text');
  const [showMinutes, setShowMinutes] = useState(false);
  const { processNotes, isLoading, result } = useProcessMeetingNotes();
  
  // Sync user profile with Convex
  useSyncUserProfile();
  
  // Get user profile from Convex to check if they're a Pro user
  const userProfile = useQuery(api.user_profile.getUserProfileByUserId, {
    userId: user?.id || '',
  });
  
  const isProUser = userProfile?.plan === 'pro';

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  const handleGenerate = async (text: string) => {
    if (user?.id) {
      await processNotes(text, user.id);
      setShowMinutes(true);
    }
  };

  const handleFileUpload = async (file: File, text: string) => {
    if (user?.id) {
      await processNotes(text, user.id);
      setShowMinutes(true);
    }
  };

  const handleAudioUpload = (file: File) => {
    // In a real implementation, we would first transcribe the audio to text
    // For now, we'll just show a message
    alert('In a full implementation, this audio file would be transcribed and then processed.');
  };

  const handleUpgradeClick = () => {
    // In a real implementation, this would redirect to the payment page
    alert('Upgrade to Pro to unlock audio transcription!');
  };

  const handleNewMinutes = () => {
    setShowMinutes(false);
  };

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">EasyMinutes</h1>
          {isSignedIn && (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {user?.firstName} {user?.lastName}
              </span>
              <button
                onClick={() => signOut()}
                className="text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl w-full">
          {showMinutes && result?.success && result.meetingMinutes ? (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Meeting Minutes</h2>
                <Button onClick={handleNewMinutes} variant="outline">
                  Generate New Minutes
                </Button>
              </div>
              <MeetingMinutesDisplay minutes={result.meetingMinutes} />
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Generate Fortune-500 Style Meeting Minutes
              </h2>
              <p className="text-gray-600 mb-6">
                Paste your meeting notes, upload a document, or record audio to
                quickly generate professional meeting minutes.
              </p>
              
              {isSignedIn && (
                <div className="mb-6">
                  <UserProfile />
                </div>
              )}
              
              {/* Display result or error */}
              {result && !result.success && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {result.error || 'Failed to generate meeting minutes. Please try again.'}
                  </AlertDescription>
                </Alert>
              )}
              
              {result && result.success && result.meetingMinutes && (
                <Alert className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex items-start">
                      <div className="flex-1">
                        <strong>Meeting minutes generated successfully!</strong>
                        <p className="mt-2">Title: {result.meetingMinutes.title}</p>
                      </div>
                      {result.processingTime && (
                        <div className="flex items-center text-sm text-gray-500 ml-2">
                          <Clock className="h-4 w-4 mr-1" />
                          {(result.processingTime / 1000).toFixed(1)}s
                        </div>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
              
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="text">Paste Text</TabsTrigger>
                  <TabsTrigger value="file">Upload File</TabsTrigger>
                  <TabsTrigger value="audio" disabled={!isProUser}>
                    Audio {isProUser ? '' : '(Pro)'}
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="text">
                  <div className="border border-gray-200 rounded-lg p-6 mt-4">
                    <TextPasteBox onGenerate={handleGenerate} isLoading={isLoading} />
                  </div>
                </TabsContent>
                <TabsContent value="file">
                  <div className="border border-gray-200 rounded-lg p-6 mt-4">
                    <FileUpload onFileUpload={handleFileUpload} isLoading={isLoading} />
                  </div>
                </TabsContent>
                <TabsContent value="audio">
                  <div className="border border-gray-200 rounded-lg p-6 mt-4">
                    <AudioUpload 
                      onAudioUpload={handleAudioUpload} 
                      isLoading={isLoading}
                      isProUser={isProUser}
                      onUpgradeClick={handleUpgradeClick}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </main>
    </div>
  );
}