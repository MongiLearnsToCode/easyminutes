import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
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
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (!error) {
        // Get the user to check if they exist in Convex
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          // User signed in successfully, redirect to dashboard or onboarding
          const forwardedHost = request.headers.get('x-forwarded-host')
          const isLocalEnv = process.env.NODE_ENV === 'development'
          
          if (isLocalEnv) {
            // In development, redirect to localhost
            return NextResponse.redirect(`${origin}${next}`)
          } else if (forwardedHost) {
            // In production, use the forwarded host
            return NextResponse.redirect(`https://${forwardedHost}${next}`)
          } else {
            // Fallback to origin
            return NextResponse.redirect(`${origin}${next}`)
          }
        }
      } else {
        console.error('Auth callback error:', error)
      }
    } catch (err) {
      console.error('Auth callback exception:', err)
    }
  }

  // If there's an error or no code, redirect to sign-in with error
  return NextResponse.redirect(`${origin}/sign-in?error=auth_callback_error`)
}
