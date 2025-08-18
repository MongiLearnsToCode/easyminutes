'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/clerk-react';

export default function UserProfile() {
  const { isSignedIn, user } = useUser();
  const userProfile = useQuery(api.user.getUserProfile);

  if (!isSignedIn) {
    return <div>Please sign in to view your profile</div>;
  }

  if (userProfile === undefined) {
    return <div>Loading...</div>;
  }

  if (userProfile instanceof Error) {
    return <div>Error: {userProfile.message}</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">User Profile</h2>
      <p>
        <span className="font-medium">Name:</span> {userProfile.name}
      </p>
      <p>
        <span className="font-medium">Email:</span> {userProfile.email}
      </p>
      <p>
        <span className="font-medium">User ID:</span> {userProfile.userId}
      </p>
    </div>
  );
}