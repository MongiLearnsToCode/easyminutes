import { useRouter } from "next/navigation";
import { useAuth } from '@/contexts/auth-context'
import React, { useEffect } from "react";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

/**
 * AuthGuard is a React component that wraps children components to
 * enforce authentication rules and redirects based on auth state.
 */
export function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    // Don't redirect while loading
    if (loading) return;
    
    const routeNonAuthenticatedUsers = async () => {
      if (requireAuth && !user) {
        router.push("/sign-in");
      } else if (!requireAuth && user) {
        router.push("/dashboard");
      }
    };

    routeNonAuthenticatedUsers();
  }, [user, loading, router, requireAuth]);

  // Show loading while auth state is being determined
  if (loading) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
}

