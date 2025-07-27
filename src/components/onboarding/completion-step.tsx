"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  CheckCircle, 
  Rocket, 
  Upload, 
  FileText, 
  Share2,
  Loader2
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { OnboardingData, OnboardingStep } from "./onboarding-flow";

interface CompletionStepProps {
  onNext: () => void;
  onPrev: () => void;
  onFinish: () => void;
  onboardingData: OnboardingData;
  updateOnboardingData: (data: Partial<OnboardingData>) => void;
  currentStep: OnboardingStep;
  isLoading: boolean;
}

export function CompletionStep({ 
  onPrev, 
  onFinish, 
  onboardingData, 
  isLoading 
}: CompletionStepProps) {
  // Get the selected template details
  const defaultTemplates = useQuery(api.templates.getDefaultTemplates);
  
  const selectedTemplate = defaultTemplates?.find(
    template => template._id === onboardingData.selectedTemplateId
  );

  const nextSteps = [
    {
      icon: Upload,
      title: "Upload your first meeting",
      description: "Upload an audio file or paste meeting text to get started",
      action: "Create New Meeting"
    },
    {
      icon: FileText,
      title: "Review your AI-generated minutes",
      description: "Edit and customize the structured minutes created by AI",
      action: "View Dashboard"
    },
    {
      icon: Share2,
      title: "Share with your team",
      description: "Generate secure links to share minutes with stakeholders",
      action: "Share Minutes"
    },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Step 4 of 4</span>
          <span className="text-sm text-muted-foreground">100%</span>
        </div>
        <Progress value={100} className="h-2" />
      </div>

      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center mb-6">
          <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-4">You&apos;re all set!</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Welcome to Easy Minutes, {onboardingData.firstName}! Your AI-powered meeting 
          assistant is ready to transform how you document meetings.
        </p>
      </div>

      {/* Setup Summary */}
      <Card className="mb-12">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Setup Complete
          </CardTitle>
          <CardDescription>
          Here&apos;s what we&apos;ve configured for your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">Profile Information</h3>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>Name: {onboardingData.firstName} {onboardingData.lastName}</p>
                <p>Plan: Free Tier (5 transcriptions/month)</p>
                <p>Storage: 100MB included</p>
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-2">Default Template</h3>
              <div className="text-sm text-muted-foreground">
                {selectedTemplate ? (
                  <>
                    <p className="font-medium text-foreground">{selectedTemplate.name}</p>
                    <p>{selectedTemplate.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {selectedTemplate.sections.slice(0, 3).map((section, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {section.title}
                        </Badge>
                      ))}
                      {selectedTemplate.sections.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{selectedTemplate.sections.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </>
                ) : (
                  <p>No default template selected</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-center mb-8">What&apos;s next?</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {nextSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="flex justify-center mb-3">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                  <CardDescription>{step.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center">
                    <Badge variant="outline" className="text-xs">
                      Step {index + 1}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Tips */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-primary" />
            Pro Tips to Get Started
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">For best results:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Upload clear audio files (MP3, WAV, M4A)</li>
                <li>• Keep meetings under 2 hours for optimal processing</li>
                <li>• Review and edit AI-generated content before sharing</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Explore features:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Create custom templates for different meeting types</li>
                <li>• Use the search function to find past meetings quickly</li>
                <li>• Set up sharing preferences in your settings</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev} disabled={isLoading}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <Button size="lg" onClick={onFinish} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Setting up your account...
            </>
          ) : (
            <>
              <Rocket className="h-4 w-4 mr-2" />
              Enter Dashboard
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
