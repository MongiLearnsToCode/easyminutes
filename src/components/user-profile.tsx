'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/clerk-react';

export default function UserProfile() {
  const { isSignedIn, user } = useUser();
  const userProfile = useQuery(api.user_profile.getUserProfileByUserId, {
    userId: user?.id || '',
  });

  if (!isSignedIn) {
    return <div>Please sign in to view your profile</div>;
  }

  if (userProfile === undefined) {
    return <div>Loading...</div>;
  }

  const freeGenerationsUsed = userProfile?.freeGenerationsUsed || 0;
  const freeGenerationsRemaining = Math.max(0, 3 - freeGenerationsUsed);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">User Profile</h2>
      <p>
        <span className="font-medium">Name:</span> {userProfile?.name}
      </p>
      <p>
        <span className="font-medium">Email:</span> {userProfile?.email}
      </p>
      <p>
        <span className="font-medium">Plan:</span> {userProfile?.plan}
      </p>
      {userProfile?.plan === 'free' && (
        <p>
          <span className="font-medium">Free Generations:</span> {freeGenerationsUsed}/3 used
          <span className={`ml-2 ${freeGenerationsRemaining === 0 ? 'text-red-600' : 'text-green-600'}`}>
            ({freeGenerationsRemaining} remaining)
          </span>
        </p>
      )}
      <p>
        <span className="font-medium">User ID:</span> {userProfile?.userId}
      </p>
    </div>
  );
}