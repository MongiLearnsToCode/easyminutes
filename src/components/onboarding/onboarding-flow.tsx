"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { WelcomeStep } from "./welcome-step";
import { ProfileStep } from "./profile-step";
import { TemplateStep } from "./template-step";
import { CompletionStep } from "./completion-step";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export type OnboardingStep = "welcome" | "profile" | "template" | "completion";

export interface OnboardingData {
  firstName?: string;
  lastName?: string;
  selectedTemplateId?: string;
}

export function OnboardingFlow() {
  const router = useRouter();
  const { user: supabaseUser } = useAuth();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState<OnboardingStep>("welcome");
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({});
  const [isLoading, setIsLoading] = useState(false);

  // Get user data from Convex
  const convexUser = useQuery(
    api.users.getUserBySupabaseId,
    supabaseUser ? { supabaseId: supabaseUser.id } : "skip"
  );

  // Complete onboarding mutation
  const completeOnboarding = useMutation(api.users.completeOnboarding);

  // Redirect if user has already completed onboarding
  useEffect(() => {
    if (convexUser && convexUser.onboardingCompleted) {
      router.push("/dashboard");
    }
  }, [convexUser, router]);

  // Initialize form data with user info
  useEffect(() => {
    if (supabaseUser && !onboardingData.firstName && !onboardingData.lastName) {
      setOnboardingData({
        firstName: supabaseUser.user_metadata?.firstName || "",
        lastName: supabaseUser.user_metadata?.lastName || "",
      });
    }
  }, [supabaseUser, onboardingData]);

  const updateOnboardingData = (data: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    switch (currentStep) {
      case "welcome":
        setCurrentStep("profile");
        break;
      case "profile":
        setCurrentStep("template");
        break;
      case "template":
        setCurrentStep("completion");
        break;
      case "completion":
        // This will be handled by the completion step
        break;
    }
  };

  const prevStep = () => {
    switch (currentStep) {
      case "profile":
        setCurrentStep("welcome");
        break;
      case "template":
        setCurrentStep("profile");
        break;
      case "completion":
        setCurrentStep("template");
        break;
    }
  };

  const finishOnboarding = async () => {
    if (!convexUser) return;

    setIsLoading(true);
    try {
      await completeOnboarding({
        userId: convexUser._id,
        selectedTemplateId: onboardingData.selectedTemplateId ? 
          onboardingData.selectedTemplateId as Id<"templates"> : undefined,
        firstName: onboardingData.firstName,
        lastName: onboardingData.lastName,
      });

      toast({
        title: "Welcome to Easy Minutes!",
        description: "Your account has been set up successfully.",
      });

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
      toast({
        title: "Error",
        description: "Failed to complete setup. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking user data
  if (!convexUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  const commonProps = {
    onNext: nextStep,
    onPrev: prevStep,
    onboardingData,
    updateOnboardingData,
    currentStep,
    isLoading,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {currentStep === "welcome" && (
        <WelcomeStep {...commonProps} />
      )}

      {currentStep === "profile" && (
        <ProfileStep {...commonProps} />
      )}

      {currentStep === "template" && (
        <TemplateStep {...commonProps} />
      )}

      {currentStep === "completion" && (
        <CompletionStep 
          {...commonProps} 
          onFinish={finishOnboarding}
        />
      )}
    </div>
  );
}
