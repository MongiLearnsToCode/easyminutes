'use client';

import { useUser, useAuth } from '@clerk/clerk-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import UserProfile from '@/components/user-profile';
import { useSyncUserProfile } from '@/hooks/use-sync-user-profile';

export default function Home() {
  const { isSignedIn, user, isLoaded } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();
  
  // Sync user profile with Convex
  useSyncUserProfile();

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

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
        <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl w-full">
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
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
              <p className="text-gray-500">
                Upload document or paste text to get started
              </p>
              <button
                disabled
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                Generate Minutes
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}