import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
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
    </div>
  )
}
