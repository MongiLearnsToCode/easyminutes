import { Metadata } from "next";
import Link from "next/link";
import { ProtectedRoute } from "@/components/auth/protected-route";

export const metadata: Metadata = {
  title: {
    template: "%s | Easy Minutes",
    default: "Authentication - Easy Minutes",
  },
  description: "Sign in or sign up to access your AI meeting transcription dashboard",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requireAuth={false}>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header with branding */}
        <header className="border-b">
          <div className="container mx-auto px-4 py-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">EM</span>
              </div>
              <span className="font-semibold text-xl">Easy Minutes</span>
            </Link>
          </div>
        </header>

        {/* Main content */}
        <div className="flex-1 flex items-center justify-center py-12">
          <div className="w-full max-w-md">
            {children}
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t py-6">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            <p>
              © 2024 Easy Minutes. Transform your meetings with AI-powered transcription.
            </p>
            <div className="mt-2 space-x-4">
              <Link href="/privacy" className="hover:text-primary">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-primary">
                Terms of Service
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </ProtectedRoute>
  );
}
