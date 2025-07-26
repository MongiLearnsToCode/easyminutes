import { SignIn } from '@clerk/nextjs'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to access your AI meeting transcription dashboard',
}

export default function SignInPage() {
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
      <SignIn 
        appearance={{
          elements: {
            formButtonPrimary: 'bg-primary hover:bg-primary/90',
            card: 'shadow-none border-0',
          }
        }}
      />
    </div>
  )
}
