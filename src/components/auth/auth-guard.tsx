import { useRouter } from "next/navigation";
import { useClerk, useSession } from "@clerk/nextjs";
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
  const { sessionId } = useSession();
  const { signOut } = useClerk();

  useEffect(() => {
    const routeNonAuthenticatedUsers = async () => {
      if (requireAuth && !sessionId) {
        router.push("/sign-in");
      } else if (!requireAuth && sessionId) {
        router.push("/dashboard");
      }
    };

    routeNonAuthenticatedUsers();
  }, [sessionId, router, requireAuth]);

  return <>{children}</>;
}

