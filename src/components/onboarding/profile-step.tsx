"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, User } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { OnboardingData, OnboardingStep } from "./onboarding-flow";

interface ProfileStepProps {
  onNext: () => void;
  onPrev: () => void;
  onboardingData: OnboardingData;
  updateOnboardingData: (data: Partial<OnboardingData>) => void;
  currentStep: OnboardingStep;
  isLoading: boolean;
}

export function ProfileStep({ 
  onNext, 
  onPrev, 
  onboardingData, 
  updateOnboardingData 
}: ProfileStepProps) {
  const { user: clerkUser } = useUser();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  const handleInputChange = (field: keyof OnboardingData, value: string) => {
    updateOnboardingData({ [field]: value });
  };

  const isFormValid = onboardingData.firstName && onboardingData.lastName;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Step 2 of 4</span>
          <span className="text-sm text-muted-foreground">50%</span>
        </div>
        <Progress value={50} className="h-2" />
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-6 w-6 text-primary" />
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-2">Tell us about yourself</h1>
        <p className="text-muted-foreground">
          We'll use this information to personalize your experience
        </p>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Help us know how to address you in the app
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture Display */}
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={clerkUser?.imageUrl} alt={clerkUser?.fullName || "User"} />
                <AvatarFallback>
                  {onboardingData.firstName?.[0]}{onboardingData.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">Profile Picture</h3>
                <p className="text-sm text-muted-foreground">
                  Your profile picture is managed through your authentication provider
                </p>
              </div>
            </div>

            {/* Name Fields */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  placeholder="Enter your first name"
                  value={onboardingData.firstName || ""}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  placeholder="Enter your last name"
                  value={onboardingData.lastName || ""}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Email Display */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                value={clerkUser?.primaryEmailAddress?.emailAddress || ""}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Your email address is managed through your authentication provider
              </p>
            </div>

            {/* Navigation */}
            <div className="flex justify-between pt-4">
              <Button type="button" variant="outline" onClick={onPrev}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              
              <Button type="submit" disabled={!isFormValid}>
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Help Text */}
      <div className="text-center mt-6">
        <p className="text-sm text-muted-foreground">
          * Required fields
        </p>
      </div>
    </div>
  );
}
