import Link from 'next/link'
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Upload, Brain, Edit, FileText } from 'lucide-react'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <FileText className="h-6 w-6" />
            <span className="text-xl font-bold">Easy Minutes</span>
          </div>
          <nav className="flex items-center space-x-4">
            <SignedOut>
              <Link href="/sign-in">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/sign-up">
                <Button>Get Started Free</Button>
              </Link>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 py-12 md:py-24 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center space-y-4 text-center">
            <Badge variant="outline" className="mb-4">
              Best Meeting Transcription App for Business Professionals
            </Badge>
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
              Transform Meetings into 
              <span className="text-primary"> Professional Minutes</span>
            </h1>
            <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
              Easy Minutes is your AI note taker for meetings. Upload audio files or paste text to generate 
              structured meeting minutes with automated action items. The smartest meeting summary generator 
              for business transcription needs.
            </p>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <SignedOut>
                <Link href="/sign-up">
                  <Button size="lg" className="min-w-[200px]">
                    Start Free Trial
                  </Button>
                </Link>
                <Link href="/sign-in">
                  <Button variant="outline" size="lg">
                    Sign In
                  </Button>
                </Link>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard">
                  <Button size="lg" className="min-w-[200px]">
                    Go to Dashboard
                  </Button>
                </Link>
              </SignedIn>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t bg-gray-50 py-12 md:py-24 lg:py-32 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
              Voice to Text Meeting App Features
            </h2>
            <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
              Our meeting intelligence platform combines AI transcription with smart editing tools
            </p>
          </div>
          <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <Upload className="h-10 w-10 text-primary" />
                <CardTitle>Audio Upload & Text Input</CardTitle>
                <CardDescription>
                  Upload meeting recordings (.mp3, .wav, .m4a, .flac) or paste raw text. 
                  Our meeting recording transcription service handles files up to 100MB.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Brain className="h-10 w-10 text-primary" />
                <CardTitle>AI-Powered Generation</CardTitle>
                <CardDescription>
                  Advanced speech to text for meetings with automatic action item extraction. 
                  Conference call transcription with 90%+ accuracy.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Edit className="h-10 w-10 text-primary" />
                <CardTitle>Smart Meeting Notes Editor</CardTitle>
                <CardDescription>
                  Rich text editing with drag-and-drop reordering, highlighting, and 
                  customizable templates for professional meeting minutes.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 md:py-24 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="grid gap-10 px-10 md:gap-16 lg:grid-cols-2">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                Why Choose Our Digital Meeting Assistant?
              </h2>
              <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Experience the future of automated meeting minutes solutions with our comprehensive 
                online meeting notes platform.
              </p>
            </div>
            <div className="flex flex-col justify-center space-y-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>75% time savings compared to manual note-taking</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Secure storage with encryption for business meeting transcription</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Easy sharing with password protection and access logs</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Meeting notes software free tier - 5 transcriptions per month</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-gray-50 py-12 md:py-24 lg:py-32 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
              Ready to Transcribe Audio to Text for Meetings?
            </h2>
            <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
              Join thousands of professionals using Easy Minutes as their automated minute taking system
            </p>
            <SignedOut>
              <Link href="/sign-up">
                <Button size="lg" className="min-w-[200px]">
                  Start Your Free Trial
                </Button>
              </Link>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard/new">
                <Button size="lg" className="min-w-[200px]">
                  Create Your First Minutes
                </Button>
              </Link>
            </SignedIn>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-6 md:py-0">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 md:h-16 md:flex-row">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span className="font-semibold">Easy Minutes</span>
          </div>
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            The leading meeting transcription software for professionals.
          </p>
        </div>
      </footer>
    </div>
  )
}
