'use client'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClient } from '@/lib/supabase'

export default function SignUpPage() {
  const supabase = createClient()
  
  return (
    <div className="flex flex-col justify-center space-y-6">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Join Easy Minutes
        </h1>
        <p className="text-sm text-muted-foreground">
          Create your account to start generating AI-powered meeting minutes
        </p>
      </div>
      <Auth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        providers={['google', 'github']}
        socialLayout="horizontal"
        view="sign_up"
        redirectTo={typeof window !== 'undefined' ? `${window.location.origin}/auth/callback?next=/onboarding` : '/auth/callback?next=/onboarding'}
      />
    </div>
  )
}
