import { Metadata } from "next";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";

export const metadata: Metadata = {
  title: "Welcome to Easy Minutes",
  description: "Get started with AI-powered meeting transcription in just a few steps",
};

export default function OnboardingPage() {
  return (
    <ProtectedRoute requireAuth={true}>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <OnboardingFlow />
      </div>
    </ProtectedRoute>
  );
}
