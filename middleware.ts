import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Define which routes should be protected (require authentication)
const protectedRoutes = [
  '/dashboard',
  '/api/transcribe',
  '/api/generate-minutes',
]

// Define routes that should only be accessible to signed-out users
const publicOnlyRoutes = [
  '/sign-in',
  '/sign-up',
]

function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some(route => pathname.startsWith(route))
}

function isPublicOnlyRoute(pathname: string): boolean {
  return publicOnlyRoutes.some(route => pathname.startsWith(route))
}

export async function middleware(req: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: req,
  })

  // Allow webhooks to pass through without authentication
  if (req.nextUrl.pathname.startsWith('/api/webhooks/')) {
    return supabaseResponse
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            req.cookies.set(name, value)
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Get user from Supabase
  const { data: { user } } = await supabase.auth.getUser()

  // If user is signed in and trying to access public-only routes, redirect to dashboard
  if (user && isPublicOnlyRoute(req.nextUrl.pathname)) {
    const dashboardUrl = new URL('/dashboard', req.url)
    return NextResponse.redirect(dashboardUrl)
  }

  // Protect routes that require authentication
  if (isProtectedRoute(req.nextUrl.pathname)) {
    if (!user) {
      // Redirect to sign-in if not authenticated
      const signInUrl = new URL('/sign-in', req.url)
      return NextResponse.redirect(signInUrl)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
