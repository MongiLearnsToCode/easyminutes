import { createServerClient } from '@supabase/ssr'
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

/**
 * Server-side authentication guard that protects routes based on auth state.
 * Uses Supabase server-side auth to check authentication status.
 */
export async function ProtectedRoute({ 
  children, 
  requireAuth = true, 
  redirectTo 
}: ProtectedRouteProps) {
  const cookieStore = await cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
  
  const { data: { user } } = await supabase.auth.getUser()

  // If authentication is required but user is not authenticated
  if (requireAuth && !user) {
    redirect(redirectTo || "/sign-in");
  }

  // If authentication is not required but user is authenticated
  if (!requireAuth && user) {
    redirect(redirectTo || "/dashboard");
  }

  return <>{children}</>;
}
