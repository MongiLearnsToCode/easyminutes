import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Terms of Service - Easy Minutes",
  description: "Terms of service for Easy Minutes AI meeting transcription service",
};

export default function TermsPage() {
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
          <h1>Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>

          <section className="mt-8">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using Easy Minutes ("the Service"), you accept and agree to be bound by 
              these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use 
              our Service.
            </p>
          </section>

          <section className="mt-8">
            <h2>2. Description of Service</h2>
            <p>
              Easy Minutes is an AI-powered meeting transcription service that converts audio recordings 
              into text transcripts and generates meeting minutes using artificial intelligence technology.
            </p>
          </section>

          <section className="mt-8">
            <h2>3. User Accounts</h2>
            <h3>Account Creation</h3>
            <ul>
              <li>You must provide accurate and complete information when creating an account</li>
              <li>You are responsible for maintaining the security of your account credentials</li>
              <li>You must be at least 18 years old to create an account</li>
              <li>One person or entity may not maintain multiple accounts</li>
            </ul>

            <h3>Account Responsibility</h3>
            <ul>
              <li>You are responsible for all activities under your account</li>
              <li>You must notify us immediately of any unauthorized use of your account</li>
              <li>We reserve the right to suspend or terminate accounts that violate these Terms</li>
            </ul>
          </section>

          <section className="mt-8">
            <h2>4. Subscription Plans and Billing</h2>
            <h3>Free Plan</h3>
            <ul>
              <li>Limited to 5 transcriptions per month</li>
              <li>100MB storage limit</li>
              <li>Basic features included</li>
            </ul>

            <h3>Paid Plans</h3>
            <ul>
              <li>Subscription fees are billed in advance on a monthly or annual basis</li>
              <li>Fees are non-refundable except as required by law</li>
              <li>We may change subscription prices with 30 days' notice</li>
              <li>Your subscription will auto-renew unless cancelled</li>
            </ul>

            <h3>Cancellation</h3>
            <ul>
              <li>You may cancel your subscription at any time</li>
              <li>Cancellation takes effect at the end of the current billing period</li>
              <li>You retain access to paid features until the end of the billing period</li>
            </ul>
          </section>

          <section className="mt-8">
            <h2>5. Acceptable Use</h2>
            <h3>Permitted Uses</h3>
            <ul>
              <li>Transcribing legitimate business meetings and conversations</li>
              <li>Creating meeting minutes for organizational purposes</li>
              <li>Processing audio content you own or have permission to use</li>
            </ul>

            <h3>Prohibited Uses</h3>
            <ul>
              <li>Uploading copyrighted content without authorization</li>
              <li>Processing illegal, harmful, or offensive content</li>
              <li>Recording or transcribing conversations without proper consent</li>
              <li>Attempting to reverse engineer or hack our services</li>
              <li>Using the service to spam or send unsolicited communications</li>
              <li>Violating any applicable laws or regulations</li>
            </ul>
          </section>

          <section className="mt-8">
            <h2>6. Content and Data</h2>
            <h3>Your Content</h3>
            <ul>
              <li>You retain ownership of all content you upload to our Service</li>
              <li>You grant us a license to process your content to provide our services</li>
              <li>You are responsible for ensuring you have rights to all uploaded content</li>
              <li>You must comply with all applicable privacy and consent laws</li>
            </ul>

            <h3>Generated Content</h3>
            <ul>
              <li>Transcripts and meeting minutes generated by our AI belong to you</li>
              <li>We do not claim ownership of AI-generated content based on your input</li>
              <li>You are responsible for reviewing and verifying AI-generated content</li>
            </ul>
          </section>

          <section className="mt-8">
            <h2>7. Privacy and Data Protection</h2>
            <p>
              Your privacy is important to us. Our Privacy Policy explains how we collect, use, and 
              protect your information. By using our Service, you agree to our Privacy Policy.
            </p>
          </section>

          <section className="mt-8">
            <h2>8. AI and Accuracy Disclaimer</h2>
            <ul>
              <li>Our AI transcription service may not be 100% accurate</li>
              <li>You should review and verify all transcripts and generated content</li>
              <li>We are not responsible for errors in AI-generated content</li>
              <li>The service is provided "as is" without warranties of accuracy</li>
            </ul>
          </section>

          <section className="mt-8">
            <h2>9. Intellectual Property</h2>
            <h3>Our Rights</h3>
            <ul>
              <li>Easy Minutes and our technology are protected by intellectual property laws</li>
              <li>You may not copy, modify, distribute, or reverse engineer our software</li>
              <li>Our trademarks and branding are our exclusive property</li>
            </ul>

            <h3>Third-Party Rights</h3>
            <ul>
              <li>We respect the intellectual property rights of others</li>
              <li>If you believe your rights have been infringed, please contact us</li>
              <li>We will respond to valid DMCA takedown notices</li>
            </ul>
          </section>

          <section className="mt-8">
            <h2>10. Service Availability</h2>
            <ul>
              <li>We strive to maintain high service uptime but cannot guarantee 100% availability</li>
              <li>We may perform maintenance that temporarily affects service availability</li>
              <li>We are not liable for service interruptions beyond our reasonable control</li>
            </ul>
          </section>

          <section className="mt-8">
            <h2>11. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, EASY MINUTES SHALL NOT BE LIABLE FOR ANY 
              INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF 
              PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, 
              USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
            </p>
          </section>

          <section className="mt-8">
            <h2>12. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless Easy Minutes from any claims, damages, losses, 
              or expenses arising from your use of the Service, violation of these Terms, or 
              infringement of any rights of another party.
            </p>
          </section>

          <section className="mt-8">
            <h2>13. Termination</h2>
            <h3>By You</h3>
            <ul>
              <li>You may terminate your account at any time</li>
              <li>Upon termination, you lose access to the Service and your data</li>
              <li>You may export your data before termination</li>
            </ul>

            <h3>By Us</h3>
            <ul>
              <li>We may terminate accounts that violate these Terms</li>
              <li>We may terminate the Service with reasonable notice</li>
              <li>We will provide data export options when feasible</li>
            </ul>
          </section>

          <section className="mt-8">
            <h2>14. Changes to Terms</h2>
            <p>
              We may update these Terms from time to time. We will notify you of material changes 
              by email or through our Service. Your continued use after notification constitutes 
              acceptance of the new Terms.
            </p>
          </section>

          <section className="mt-8">
            <h2>15. Governing Law</h2>
            <p>
              These Terms are governed by and construed in accordance with the laws of [Your Jurisdiction]. 
              Any disputes will be resolved in the courts of [Your Jurisdiction].
            </p>
          </section>

          <section className="mt-8">
            <h2>16. Contact Information</h2>
            <p>
              If you have questions about these Terms, please contact us at:
            </p>
            <ul>
              <li>Email: legal@easyminutes.com</li>
              <li>Address: [Your Business Address]</li>
            </ul>
          </section>

          <section className="mt-8">
            <h2>17. Severability</h2>
            <p>
              If any provision of these Terms is found to be unenforceable, the remaining provisions 
              will remain in full force and effect.
            </p>
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
