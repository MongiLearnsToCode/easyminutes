"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useSessionManager } from "@/hooks/use-session-manager";
import { toast } from "@/hooks/use-toast";

// Types for our combined user state
export interface UserProfile {
  // Clerk user data
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  imageUrl?: string;
  
  // Convex user data
  convexId: Id<"users">;
  subscriptionTier: "free" | "pro" | "business";
  subscriptionStatus: "active" | "inactive" | "canceled";
  monthlyTranscriptions: number;
  storageUsedMB: number;
  defaultTemplateId?: string;
  onboardingCompleted: boolean;
  notificationPreferences: {
    emailOnTranscriptionComplete: boolean;
    emailOnShareAccess: boolean;
    emailOnSubscriptionUpdates: boolean;
    inAppNotifications: boolean;
  };
  
  // Computed properties
  isAuthenticated: boolean;
  isLoading: boolean;
  needsOnboarding: boolean;
}

export interface UserUsageStats {
  subscriptionTier: "free" | "pro" | "business";
  monthlyTranscriptions: number;
  transcriptionLimit: number | null;
  storageUsedMB: number;
  storageLimit: number;
  lastUsageReset: number;
}

interface UserContextType {
  user: UserProfile | null;
  usageStats: UserUsageStats | null;
  isLoading: boolean;
  error: string | null;
  refreshUser: () => void;
  // Session management
  isTokenValid: () => Promise<boolean>;
  refreshTokenManually: () => Promise<string | null>;
  isSessionLoaded: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const [error, setError] = useState<string | null>(null);
  
  // Session manager for automatic token refresh
  const sessionManager = useSessionManager({
    onSessionExpired: () => {
      setError("Your session has expired. Please sign in again.");
      toast({
        title: "Session Expired",
        description: "Your session has expired. You will be redirected to sign in.",
        variant: "destructive",
      });
    },
    onTokenRefreshed: () => {
      // Optionally show a success message or just log
      console.log("Session refreshed successfully");
    },
    // Check token every 2 minutes
    checkInterval: 120000,
    // Refresh token 10 minutes before expiry
    refreshBuffer: 600000,
    autoRedirect: true,
  });
  
  // Query Convex user data
  const convexUser = useQuery(
    api.users.getUserByClerkId,
    clerkUser ? { clerkId: clerkUser.id } : "skip"
  );

  // Query usage statistics
  const usageStats = useQuery(
    api.users.getUserUsageStats,
    convexUser ? { userId: convexUser._id } : "skip"
  );

  // Determine loading state
  const isLoading = !clerkLoaded || (clerkUser && !convexUser);

  // Create combined user profile
  const userProfile: UserProfile | null = (() => {
    if (!clerkUser || !convexUser) return null;

    return {
      // Clerk data
      clerkId: clerkUser.id,
      email: clerkUser.primaryEmailAddress?.emailAddress || "",
      firstName: clerkUser.firstName || convexUser.firstName,
      lastName: clerkUser.lastName || convexUser.lastName,
      fullName: clerkUser.fullName || 
        `${convexUser.firstName || ""} ${convexUser.lastName || ""}`.trim(),
      imageUrl: clerkUser.imageUrl,

      // Convex data
      convexId: convexUser._id,
      subscriptionTier: convexUser.subscriptionTier,
      subscriptionStatus: convexUser.subscriptionStatus,
      monthlyTranscriptions: convexUser.monthlyTranscriptions,
      storageUsedMB: convexUser.storageUsedMB,
      defaultTemplateId: convexUser.defaultTemplateId,
      onboardingCompleted: convexUser.onboardingCompleted,
      notificationPreferences: convexUser.notificationPreferences,

      // Computed properties
      isAuthenticated: true,
      isLoading: false,
      needsOnboarding: !convexUser.onboardingCompleted,
    };
  })();

  // Handle errors
  useEffect(() => {
    if (clerkLoaded && clerkUser && convexUser === null) {
      setError("Failed to load user profile data");
    } else {
      setError(null);
    }
  }, [clerkLoaded, clerkUser, convexUser]);

  // Function to refresh user data (useful after updates)
  const refreshUser = () => {
    // The queries will automatically refresh when dependencies change
    // This is mainly for manual refresh triggers
    setError(null);
  };

  const contextValue: UserContextType = {
    user: userProfile,
    usageStats: usageStats || null,
    isLoading: Boolean(isLoading),
    error,
    refreshUser,
    // Session management functions
    isTokenValid: sessionManager.isTokenValid,
    refreshTokenManually: sessionManager.refreshTokenManually,
    isSessionLoaded: Boolean(sessionManager.isSessionLoaded),
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
}

// Custom hook to use the user context
export function useUserContext(): UserContextType {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
}

// Convenience hooks for specific user data
export function useCurrentUser(): UserProfile | null {
  const { user } = useUserContext();
  return user;
}

export function useUserUsageStats(): UserUsageStats | null {
  const { usageStats } = useUserContext();
  return usageStats;
}

export function useAuthState(): {
  isAuthenticated: boolean;
  isLoading: boolean;
  needsOnboarding: boolean;
  user: UserProfile | null;
} {
  const { user, isLoading } = useUserContext();
  
  return {
    isAuthenticated: !!user,
    isLoading,
    needsOnboarding: user?.needsOnboarding ?? false,
    user,
  };
}

// Convenience hook for session management
export function useSessionManagement(): {
  isTokenValid: () => Promise<boolean>;
  refreshTokenManually: () => Promise<string | null>;
  isSessionLoaded: boolean;
} {
  const { isTokenValid, refreshTokenManually, isSessionLoaded } = useUserContext();
  
  return {
    isTokenValid,
    refreshTokenManually,
    isSessionLoaded,
  };
}
