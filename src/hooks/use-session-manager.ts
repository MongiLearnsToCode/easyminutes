"use client";

import { useEffect, useCallback, useRef } from "react";
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from "next/navigation";

interface UseSessionManagerOptions {
  /** How often to check session validity (in milliseconds) */
  checkInterval?: number;
  /** Whether to auto-redirect to sign-in on session expiry */
  autoRedirect?: boolean;
  /** Callback when session expires */
  onSessionExpired?: () => void;
  /** Callback when session is refreshed */
  onSessionRefreshed?: () => void;
}

export function useSessionManager(options: UseSessionManagerOptions = {}) {
  const {
    checkInterval = 60000, // Check every minute
    autoRedirect = true,
    onSessionExpired,
    onSessionRefreshed,
  } = options;

  const { user, session, signOut, supabaseClient } = useAuth();
  const router = useRouter();
  
  // Use refs to store the latest callbacks to avoid effect dependencies
  const onSessionExpiredRef = useRef(onSessionExpired);
  const onSessionRefreshedRef = useRef(onSessionRefreshed);
  
  useEffect(() => {
    onSessionExpiredRef.current = onSessionExpired;
    onSessionRefreshedRef.current = onSessionRefreshed;
  });

  // Function to check session validity
  const checkSession = useCallback(async () => {
    if (!session) return;

    try {
      // Check if session is still valid
      const { data: { user: currentUser }, error } = await supabaseClient.auth.getUser();
      
      if (error || !currentUser) {
        console.warn("Session expired or invalid");
        onSessionExpiredRef.current?.();
        
        if (autoRedirect) {
          await signOut();
          router.push("/sign-in");
        }
        return;
      }

      // Session is still valid
      onSessionRefreshedRef.current?.();
      
    } catch (error) {
      console.error("Error checking session:", error);
      onSessionExpiredRef.current?.();
      
      if (autoRedirect) {
        await signOut();
        router.push("/sign-in");
      }
    }
  }, [session, supabaseClient, signOut, router, autoRedirect]);

  // Set up periodic session checking
  useEffect(() => {
    if (!session || !user) return;

    // Initial check
    checkSession();

    // Set up interval for periodic checks
    const intervalId = setInterval(checkSession, checkInterval);

    return () => {
      clearInterval(intervalId);
    };
  }, [session, user, checkSession, checkInterval]);

  // Listen for visibility change to check session when user returns to tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && session) {
        checkSession();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [session, checkSession]);

  // Manual session refresh function for external use
  const refreshSessionManually = useCallback(async () => {
    if (!session) return null;
    
    try {
      const { data: { session: refreshedSession }, error } = await supabaseClient.auth.refreshSession();
      if (refreshedSession && !error) {
        onSessionRefreshedRef.current?.();
        return refreshedSession;
      }
      return null;
    } catch (error) {
      console.error("Manual session refresh failed:", error);
      return null;
    }
  }, [session, supabaseClient]);

  // Function to check current session validity
  const isSessionValid = useCallback(async () => {
    if (!session) return false;

    try {
      const { data: { user }, error } = await supabaseClient.auth.getUser();
      return !error && !!user;
    } catch (error) {
      console.error("Error checking session validity:", error);
      return false;
    }
  }, [session, supabaseClient]);

  return {
    session,
    user,
    isSessionValid,
    refreshSessionManually,
    checkSession,
  };
}
