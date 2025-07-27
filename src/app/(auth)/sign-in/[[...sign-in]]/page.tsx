'use client'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClient } from '@/lib/supabase'

export default function SignInPage() {
  const supabase = createClient()
  
  return (
    <div className="flex flex-col justify-center space-y-6">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back to Easy Minutes
        </h1>
        <p className="text-sm text-muted-foreground">
          Sign in to access your AI meeting transcription dashboard
        </p>
      </div>
      <Auth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        providers={['google', 'github']}
        socialLayout="horizontal"
        view="sign_in"
        redirectTo={typeof window !== 'undefined' ? `${window.location.origin}/auth/callback?next=/dashboard` : '/auth/callback?next=/dashboard'}
      />
    </div>
  )
}
