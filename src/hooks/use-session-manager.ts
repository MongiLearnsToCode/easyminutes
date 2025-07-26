"use client";

import { useEffect, useCallback, useRef } from "react";
import { useAuth, useSession } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

interface UseSessionManagerOptions {
  /** How often to check token validity (in milliseconds) */
  checkInterval?: number;
  /** How early to refresh before token expires (in milliseconds) */
  refreshBuffer?: number;
  /** Whether to auto-redirect to sign-in on session expiry */
  autoRedirect?: boolean;
  /** Callback when session expires */
  onSessionExpired?: () => void;
  /** Callback when token is refreshed */
  onTokenRefreshed?: (newToken: string) => void;
}

export function useSessionManager(options: UseSessionManagerOptions = {}) {
  const {
    checkInterval = 60000, // Check every minute
    refreshBuffer = 300000, // Refresh 5 minutes before expiry
    autoRedirect = true,
    onSessionExpired,
    onTokenRefreshed,
  } = options;

  const { getToken, signOut } = useAuth();
  const { session, isLoaded } = useSession();
  const router = useRouter();
  
  // Use refs to store the latest callbacks to avoid effect dependencies
  const onSessionExpiredRef = useRef(onSessionExpired);
  const onTokenRefreshedRef = useRef(onTokenRefreshed);
  
  useEffect(() => {
    onSessionExpiredRef.current = onSessionExpired;
    onTokenRefreshedRef.current = onTokenRefreshed;
  });

  // Function to check and refresh token if needed
  const checkAndRefreshToken = useCallback(async () => {
    if (!session || !isLoaded) return;

    try {
      // Get current token with a reasonable timeout
      const token = await getToken();
      
      if (!token) {
        console.warn("No token available, session may have expired");
        onSessionExpiredRef.current?.();
        
        if (autoRedirect) {
          await signOut();
          router.push("/sign-in");
        }
        return;
      }

      // Check if token is close to expiring
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      const expiryTime = tokenPayload.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      const timeUntilExpiry = expiryTime - currentTime;

      // If token expires soon, refresh it
      if (timeUntilExpiry < refreshBuffer) {
        console.log("Token expiring soon, refreshing...");
        const newToken = await getToken({ skipCache: true });
        
        if (newToken) {
          onTokenRefreshedRef.current?.(newToken);
          console.log("Token refreshed successfully");
        } else {
          console.warn("Failed to refresh token");
          onSessionExpiredRef.current?.();
          
          if (autoRedirect) {
            await signOut();
            router.push("/sign-in");
          }
        }
      }
    } catch (error) {
      console.error("Error checking/refreshing token:", error);
      onSessionExpiredRef.current?.();
      
      if (autoRedirect) {
        await signOut();
        router.push("/sign-in");
      }
    }
  }, [session, isLoaded, getToken, signOut, router, autoRedirect, refreshBuffer]);

  // Set up periodic token checking
  useEffect(() => {
    if (!isLoaded || !session) return;

    // Initial check
    checkAndRefreshToken();

    // Set up interval for periodic checks
    const intervalId = setInterval(checkAndRefreshToken, checkInterval);

    return () => {
      clearInterval(intervalId);
    };
  }, [isLoaded, session, checkAndRefreshToken, checkInterval]);

  // Listen for visibility change to check token when user returns to tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && session) {
        checkAndRefreshToken();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [session, checkAndRefreshToken]);

  // Manual refresh function for external use
  const refreshTokenManually = useCallback(async () => {
    if (!session) return null;
    
    try {
      const newToken = await getToken({ skipCache: true });
      if (newToken) {
        onTokenRefreshedRef.current?.(newToken);
      }
      return newToken;
    } catch (error) {
      console.error("Manual token refresh failed:", error);
      return null;
    }
  }, [session, getToken]);

  // Function to check current token validity
  const isTokenValid = useCallback(async () => {
    if (!session) return false;

    try {
      const token = await getToken();
      if (!token) return false;

      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      const expiryTime = tokenPayload.exp * 1000;
      return Date.now() < expiryTime;
    } catch (error) {
      console.error("Error checking token validity:", error);
      return false;
    }
  }, [session, getToken]);

  return {
    session,
    isSessionLoaded: isLoaded,
    isTokenValid,
    refreshTokenManually,
    checkAndRefreshToken,
  };
}
