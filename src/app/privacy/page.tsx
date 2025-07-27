import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Privacy Policy - Easy Minutes",
  description: "Privacy policy for Easy Minutes AI meeting transcription service",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">EM</span>
            </div>
            <span className="font-semibold text-xl">Easy Minutes</span>
          </Link>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/" className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="prose dark:prose-invert max-w-none">
          <h1>Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>

          <section className="mt-8">
            <h2>Introduction</h2>
            <p>
              Easy Minutes ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy 
              explains how we collect, use, disclose, and safeguard your information when you use our AI-powered 
              meeting transcription service.
            </p>
          </section>

          <section className="mt-8">
            <h2>Information We Collect</h2>
            <h3>Personal Information</h3>
            <ul>
              <li>Account information (name, email address, profile picture)</li>
              <li>Authentication data managed through Supabase</li>
              <li>Subscription and billing information through Polar.sh</li>
            </ul>

            <h3>Meeting Data</h3>
            <ul>
              <li>Audio files you upload for transcription</li>
              <li>Transcribed text and generated meeting minutes</li>
              <li>Meeting metadata (titles, dates, participant names)</li>
              <li>Templates and custom settings</li>
            </ul>

            <h3>Usage Information</h3>
            <ul>
              <li>Log data and analytics</li>
              <li>Device and browser information</li>
              <li>Usage patterns and feature interactions</li>
            </ul>
          </section>

          <section className="mt-8">
            <h2>How We Use Your Information</h2>
            <ul>
              <li>Provide and improve our transcription services</li>
              <li>Process your audio files using Google Gemini AI</li>
              <li>Manage your account and subscription</li>
              <li>Send important service notifications</li>
              <li>Analyze usage to improve our platform</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="mt-8">
            <h2>Data Processing and AI</h2>
            <p>
              We use Google's Gemini AI service to transcribe your audio files and generate meeting minutes. 
              Your audio data is processed according to Google's privacy policies and data handling practices. 
              We do not store your audio files permanently - they are processed and then deleted.
            </p>
          </section>

          <section className="mt-8">
            <h2>Data Sharing and Disclosure</h2>
            <p>We may share your information with:</p>
            <ul>
              <li><strong>Service Providers:</strong> Supabase (authentication), Convex (database), Google (AI processing), Polar.sh (payments)</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Business Transfers:</strong> In connection with mergers or acquisitions</li>
            </ul>
            <p>We never sell your personal data to third parties.</p>
          </section>

          <section className="mt-8">
            <h2>Data Security</h2>
            <p>
              We implement appropriate security measures to protect your information, including:
            </p>
            <ul>
              <li>Encryption in transit and at rest</li>
              <li>Access controls and authentication</li>
              <li>Regular security assessments</li>
              <li>Secure cloud infrastructure</li>
            </ul>
          </section>

          <section className="mt-8">
            <h2>Data Retention</h2>
            <ul>
              <li><strong>Account Data:</strong> Retained while your account is active</li>
              <li><strong>Meeting Data:</strong> Retained according to your subscription plan</li>
              <li><strong>Audio Files:</strong> Deleted immediately after processing</li>
              <li><strong>Logs:</strong> Retained for up to 90 days</li>
            </ul>
          </section>

          <section className="mt-8">
            <h2>Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access your personal data</li>
              <li>Correct inaccurate information</li>
              <li>Delete your account and associated data</li>
              <li>Export your data</li>
              <li>Opt out of non-essential communications</li>
            </ul>
          </section>

          <section className="mt-8">
            <h2>International Data Transfers</h2>
            <p>
              Your data may be processed in countries other than your own. We ensure appropriate 
              safeguards are in place to protect your data in accordance with applicable privacy laws.
            </p>
          </section>

          <section className="mt-8">
            <h2>Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any 
              material changes by email or through our service.
            </p>
          </section>

          <section className="mt-8">
            <h2>Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy or our data practices, please contact us at:
            </p>
            <ul>
              <li>Email: privacy@easyminutes.com</li>
              <li>Address: [Your Business Address]</li>
            </ul>
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 Easy Minutes. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
