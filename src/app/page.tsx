'use client';

import { useUser, useAuth } from '@clerk/clerk-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import UserProfile from '@/components/user-profile';
import { TextPasteBox } from '@/components/text-paste-box';
import { FileUpload } from '@/components/file-upload';
import { AudioUpload } from '@/components/audio-upload';
import { MeetingMinutesDisplay } from '@/components/meeting-minutes-display';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useProcessMeetingNotes, ProcessMeetingNotesResult } from '@/hooks/use-process-meeting-notes';
import { Button } from '@/components/ui/button';
import { AIProcessingAnimation } from '@/components/ai-processing-animation';
import { ErrorAlert } from '@/components/error-alert';
import { SuccessAlert } from '@/components/success-alert';
import { UpgradePrompt } from '@/components/upgrade-prompt';
import { NPSSurvey } from '@/components/nps-survey';
import { useNPSSurvey } from '@/hooks/use-nps-survey';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

export default function Home() {
  const { isSignedIn, user, isLoaded } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('text');
  const [showMinutes, setShowMinutes] = useState(false);
  const { processNotes, isLoading, result, setResult } = useProcessMeetingNotes();
  const saveEditedMinutes = useMutation(api.save_edited_minutes.saveEditedMeetingMinutes);
  const checkFreeLimit = useMutation(api.check_free_limit.checkFreeGenerationLimitV2);
  const incrementFreeGenerations = useMutation(api.increment_free_generations.incrementFreeGenerations);
  
  // State to track last input for retry functionality
  const [lastTextInput, setLastTextInput] = useState<string>('');
  const [lastFileInput, setLastFileInput] = useState<{file: File, text: string} | null>(null);
  
  // State to track free generation limit
  const [freeLimit, setFreeLimit] = useState<{canGenerate: boolean, freeGenerationsUsed: number, limit: number} | null>(null);
  
  // State for NPS survey
  const [showNPSSurvey, setShowNPSSurvey] = useState(false);
  
  // Get user profile for Pro status
  const userProfile = useQuery(api.user_profile.getUserProfileByUserId, {
    userId: user?.id || '',
  });
  
  const isProUser = userProfile?.plan === 'pro';
  
  // Determine when to show NPS survey
  const { shouldShowSurvey } = useNPSSurvey({
    userId: user?.id || '',
    enabled: Boolean(isSignedIn && !!user && showMinutes && result !== null && result.success),
  });
  
  // Show NPS survey when conditions are met
  useEffect(() => {
    if (shouldShowSurvey) {
      // Add a slight delay before showing the survey
      const timer = setTimeout(() => {
        setShowNPSSurvey(true);
      }, 5000); // Show after 5 seconds of successful generation
      
      return () => clearTimeout(timer);
    }
  }, [shouldShowSurvey]);

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  const checkFreeLimitAndProcess = async (text: string, userId: string) => {
    // Check if user can generate (for free users)
    const limitCheck = await checkFreeLimit({ userId });
    setFreeLimit(limitCheck);
    
    if (!limitCheck.canGenerate) {
      // User has reached their limit
      const errorResult: ProcessMeetingNotesResult = {
        success: false,
        error: "You've reached your limit of 3 free generations. Please upgrade to Pro for unlimited generations.",
      };
      
      // Update the result state to show the error
      setResult(errorResult);
      return errorResult;
    }
    
    // Process the notes
    const result = await processNotes(text, userId);
    
    // If successful, increment the free generations count for free users
    if (result.success) {
      // We already have userProfile from the query above
      if (userProfile?.plan === 'free') {
        await incrementFreeGenerations({ userId });
      }
    }
    
    return result;
  };

  const handleGenerate = async (text: string) => {
    if (user?.id) {
      setLastTextInput(text);
      try {
        const result = await checkFreeLimitAndProcess(text, user.id);
        if (result.success) {
          setShowMinutes(true);
        }
      } catch (error) {
        console.error("Failed to generate minutes:", error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        setResult({
          success: false,
          error: errorMessage,
        });
      }
      
      // Track user activity
      // TODO: Implement actual tracking
      console.log('Tracking user activity: generate_minutes for user:', user.id);
    }
  };

  const handleFileUpload = async (file: File, text: string) => {
    if (user?.id) {
      setLastFileInput({ file, text });
      try {
        const result = await checkFreeLimitAndProcess(text, user.id);
        if (result.success) {
          setShowMinutes(true);
        }
      } catch (error) {
        console.error("Failed to upload and process file:", error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        setResult({
          success: false,
          error: errorMessage,
        });
      }
      
      // Track user activity
      // TODO: Implement actual tracking
      console.log('Tracking user activity: generate_minutes for user:', user.id);
    }
  };

  const handleAudioUpload = async (result: ProcessMeetingNotesResult) => {
    // Handle the processed audio result
    if (result.success) {
      // Update the result state with the processed minutes
      // This would typically update the UI to show the generated minutes
      console.log('Audio processed successfully:', result);
      alert('Audio file processed successfully! The meeting minutes have been generated.');
      
      // Track user activity
      // TODO: Implement actual tracking
      console.log('Tracking user activity: generate_minutes for user:', user?.id);
    } else {
      // Handle error
      console.error('Error processing audio:', result.error);
      alert('Failed to process audio file. Please try again.');
    }
  };

  const handleUpgradeClick = () => {
    // In a real implementation, this would redirect to the payment page
    // For now, we'll just show an alert, but in a full implementation
    // we would use the LemonSqueezy checkout
    alert('Upgrade to Pro to unlock all premium features!');
  };

  const handleNewMinutes = () => {
    setShowMinutes(false);
  };

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AIProcessingAnimation isLoading={isLoading} estimatedTime={10} />
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-xl font-bold text-gray-900">EasyMinutes</h1>
          {isSignedIn && (
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <span className="text-sm text-gray-700 text-center sm:text-left">
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
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 max-w-4xl w-full">
          {showMinutes && result?.success && result.meetingMinutes ? (
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Meeting Minutes</h2>
                <Button onClick={handleNewMinutes} variant="outline" className="w-full sm:w-auto">
                  Generate New Minutes
                </Button>
              </div>
              <MeetingMinutesDisplay 
                minutes={result.meetingMinutes} 
                isProUser={isProUser}
                onSave={async (editedMinutes) => {
                  // Save the edited minutes with versioning
                  if (result && user?.id && result.minutesId) {
                    try {
                      const saveResult = await saveEditedMinutes({
                        originalMinutesId: result.minutesId,
                        editedMinutes: editedMinutes,
                        userId: user.id,
                      });
                      
                      // Update the result with the new version
                      if (result) {
                        result.meetingMinutes = {
                          ...editedMinutes,
                          actionMinutes: editedMinutes.actionMinutes || '',
                        };
                      }
                      console.log("Minutes saved successfully with version:", saveResult.version);
                    } catch (error) {
                      console.error("Error saving edited minutes:", error);
                    }
                  }
                }}
                onUpgradeClick={handleUpgradeClick}
              />
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
                <div className="mb-6 space-y-4">
                  <UserProfile />
                  {userProfile?.plan === 'free' && userProfile?.freeGenerationsUsed !== undefined && (
                    <UpgradePrompt 
                      onUpgradeClick={handleUpgradeClick}
                      freeGenerationsUsed={userProfile.freeGenerationsUsed}
                      limit={3}
                    />
                  )}
                </div>
              )}
              
              {/* Display result or error */}
              {result && !result.success && (
                <ErrorAlert
                  error={result.error || 'Failed to generate meeting minutes. Please try again.'}
                  onRetry={() => {
                    // Retry the last action based on the active tab
                    if (activeTab === 'text' && lastTextInput) {
                      handleGenerate(lastTextInput);
                    } else if (activeTab === 'file' && lastFileInput) {
                      handleFileUpload(lastFileInput.file, lastFileInput.text);
                    }
                  }}
                  showRetry={true}
                />
              )}
              
              {result && result.success && result.meetingMinutes && (
                <SuccessAlert
                  title="Meeting Minutes Generated"
                  message={`Title: ${result.meetingMinutes.title}`}
                  processingTime={result.processingTime}
                />
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
                      onAudioProcessed={handleAudioUpload} 
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
      
      {/* NPS Survey Dialog */}
      <Dialog open={showNPSSurvey} onOpenChange={setShowNPSSurvey}>
        <DialogContent className="sm:max-w-md p-0">
          <VisuallyHidden>
            <DialogTitle>Net Promoter Score Survey</DialogTitle>
            <DialogDescription>
              A survey to gauge user satisfaction.
            </DialogDescription>
          </VisuallyHidden>
          <NPSSurvey 
            userId={user?.id || ''}
            onDismiss={() => setShowNPSSurvey(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}