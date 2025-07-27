import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Define which routes should be protected (require authentication)
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/api/transcribe',
  '/api/generate-minutes',
])

// Define routes that should only be accessible to signed-out users
const isPublicOnlyRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  // Allow webhooks to pass through without authentication
  if (req.nextUrl.pathname.startsWith('/api/webhooks/')) {
    return
  }

  const authData = await auth();

  // If user is signed in and trying to access public-only routes, redirect to dashboard
  if (authData.userId && isPublicOnlyRoute(req)) {
    const dashboardUrl = new URL('/dashboard', req.url)
    return Response.redirect(dashboardUrl)
  }

  // Protect routes that require authentication
  if (isProtectedRoute(req)) {
    if (!authData.userId) {
      // Redirect to sign-in if not authenticated
      const signInUrl = new URL('/sign-in', req.url)
      return Response.redirect(signInUrl)
    }
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
