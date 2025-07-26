"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, 
  FileAudio, 
  Brain, 
  Share2, 
  CheckCircle, 
  ArrowRight,
  Sparkles
} from "lucide-react";
import { OnboardingData, OnboardingStep } from "./onboarding-flow";

interface WelcomeStepProps {
  onNext: () => void;
  onPrev: () => void;
  onboardingData: OnboardingData;
  updateOnboardingData: (data: Partial<OnboardingData>) => void;
  currentStep: OnboardingStep;
  isLoading: boolean;
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  const features = [
    {
      icon: FileAudio,
      title: "Upload & Transcribe",
      description: "Upload audio files or paste text from any meeting",
    },
    {
      icon: Brain,
      title: "AI-Powered Processing",
      description: "Advanced AI generates structured, professional minutes",
    },
    {
      icon: Share2,
      title: "Easy Sharing",
      description: "Share meeting minutes securely with team members",
    },
  ];

  const benefits = [
    "Save 75% of your time on meeting documentation",
    "Professional, structured meeting minutes every time",
    "Secure storage with easy search and organization",
    "Free tier includes 5 transcriptions per month",
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center mb-6">
          <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center">
            <Sparkles className="h-8 w-8 text-primary-foreground" />
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-4">
          Welcome to Easy Minutes
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Transform your meetings into professional, structured minutes with AI-powered 
          transcription and intelligent formatting.
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Card key={index} className="text-center">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      {/* Benefits */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            What You'll Get
          </CardTitle>
          <CardDescription>
            Everything you need to revolutionize your meeting documentation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{benefit}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Free Tier Badge */}
      <div className="text-center mb-8">
        <Badge variant="secondary" className="px-4 py-2 text-sm">
          <Zap className="h-4 w-4 mr-2" />
          Starting with our Free tier - No credit card required
        </Badge>
      </div>

      {/* Action */}
      <div className="text-center">
        <Button 
          size="lg" 
          onClick={onNext}
          className="px-8"
        >
          Get Started
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
        <p className="text-xs text-muted-foreground mt-3">
          Setup takes less than 2 minutes
        </p>
      </div>
    </div>
  );
}
