import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

/**
 * Server-side authentication guard that protects routes based on auth state.
 * Uses Clerk's auth() function to check authentication status on the server.
 */
export async function ProtectedRoute({ 
  children, 
  requireAuth = true, 
  redirectTo 
}: ProtectedRouteProps) {
  const { userId } = await auth();

  // If authentication is required but user is not authenticated
  if (requireAuth && !userId) {
    redirect(redirectTo || "/sign-in");
  }

  // If authentication is not required but user is authenticated
  if (!requireAuth && userId) {
    redirect(redirectTo || "/dashboard");
  }

  return <>{children}</>;
}
