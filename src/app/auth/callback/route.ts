import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@/convex/_generated/api'


const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

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
          try {
            // Sync user to Convex database
            await convex.mutation(api.users.upsertUser, {
              supabaseId: user.id,
              email: user.email || '',
              firstName: user.user_metadata?.firstName || 
                         user.user_metadata?.full_name?.split(' ')[0] ||
                         user.user_metadata?.name?.split(' ')[0] ||
                         '',
              lastName: user.user_metadata?.lastName || 
                        user.user_metadata?.full_name?.split(' ').slice(1).join(' ') ||
                        user.user_metadata?.name?.split(' ').slice(1).join(' ') ||
                        '',
              imageUrl: user.user_metadata?.avatar_url || 
                        user.user_metadata?.picture ||
                        '',
            })
            
            console.log('User synced to Convex successfully:', user.id)
          } catch (convexError) {
            console.error('Failed to sync user to Convex:', convexError)
            // Continue with redirect even if Convex sync fails
          }

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
