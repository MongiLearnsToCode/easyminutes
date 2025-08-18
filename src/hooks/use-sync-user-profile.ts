'use client';

import { useUser } from '@clerk/clerk-react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useEffect } from 'react';

export function useSyncUserProfile() {
  const { user } = useUser();
  const storeUserProfile = useMutation(api.user_profile.storeUserProfile);

  useEffect(() => {
    if (user) {
      // Sync user profile to Convex
      storeUserProfile({
        userId: user.id,
        email: user.emailAddresses[0]?.emailAddress || '',
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      });
    }
  }, [user, storeUserProfile]);
}