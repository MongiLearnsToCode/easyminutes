import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ConvexClientProvider } from '@/components/providers/convex-provider'
import { AuthProvider } from '@/contexts/auth-context'
import { UserProvider } from '@/contexts/user-context'
import { Toaster } from '@/components/ui/sonner'
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Easy Minutes - AI Meeting Transcription Software",
  description: "Transform your meetings into professional minutes with our AI-powered transcription software. Upload audio or text to generate structured meeting notes with action items.",
  keywords: "meeting transcription, AI meeting notes, automated meeting minutes, voice to text meetings, meeting summary generator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <ConvexClientProvider>
            <UserProvider>
              {children}
            </UserProvider>
          </ConvexClientProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
