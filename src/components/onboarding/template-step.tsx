"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, FileText, CheckCircle, Users, Lightbulb, Briefcase } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { OnboardingData, OnboardingStep } from "./onboarding-flow";
import { Loader2 } from "lucide-react";

interface TemplateStepProps {
  onNext: () => void;
  onPrev: () => void;
  onboardingData: OnboardingData;
  updateOnboardingData: (data: Partial<OnboardingData>) => void;
  currentStep: OnboardingStep;
  isLoading: boolean;
}

export function TemplateStep({ 
  onNext, 
  onPrev, 
  onboardingData, 
  updateOnboardingData 
}: TemplateStepProps) {
  // Get default templates
  const defaultTemplates = useQuery(api.templates.getDefaultTemplates);

  const handleTemplateSelect = (templateId: string) => {
    updateOnboardingData({ selectedTemplateId: templateId });
  };

  const handleSkip = () => {
    updateOnboardingData({ selectedTemplateId: undefined });
    onNext();
  };

  const handleContinue = () => {
    onNext();
  };

  const getTemplateIcon = (templateName: string) => {
    if (templateName.toLowerCase().includes('standup')) {
      return Users;
    }
    if (templateName.toLowerCase().includes('client')) {
      return Briefcase;
    }
    return Lightbulb;
  };

  const getTemplateColor = (index: number) => {
    const colors = ['bg-blue-50 border-blue-200', 'bg-green-50 border-green-200', 'bg-purple-50 border-purple-200'];
    return colors[index % colors.length];
  };

  if (!defaultTemplates) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading templates...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Step 3 of 4</span>
          <span className="text-sm text-muted-foreground">75%</span>
        </div>
        <Progress value={75} className="h-2" />
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <FileText className="h-6 w-6 text-primary" />
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-2">Choose your meeting style</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Select a default template to get started. You can always change this later or create 
          custom templates for different meeting types.
        </p>
      </div>

      {/* Template Options */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {defaultTemplates.map((template, index) => {
          const Icon = getTemplateIcon(template.name);
          const isSelected = onboardingData.selectedTemplateId === template._id;
          
          return (
            <Card 
              key={template._id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                isSelected 
                  ? 'ring-2 ring-primary shadow-md' 
                  : 'hover:border-primary/50'
              } ${getTemplateColor(index)}`}
              onClick={() => handleTemplateSelect(template._id)}
            >
              <CardHeader className="text-center">
                <div className="flex justify-center mb-3">
                  <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                    isSelected ? 'bg-primary text-primary-foreground' : 'bg-white/50'
                  }`}>
                    {isSelected ? (
                      <CheckCircle className="h-6 w-6" />
                    ) : (
                      <Icon className="h-6 w-6 text-primary" />
                    )}
                  </div>
                </div>
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <CardDescription className="text-sm">
                  {template.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Includes:</h4>
                  <div className="space-y-1">
                    {template.sections.slice(0, 4).map((section, sectionIndex) => (
                      <div key={sectionIndex} className="flex items-center gap-2 text-xs">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary/60" />
                        <span className="text-muted-foreground">{section.title}</span>
                      </div>
                    ))}
                    {template.sections.length > 4 && (
                      <div className="text-xs text-muted-foreground">
                        +{template.sections.length - 4} more sections
                      </div>
                    )}
                  </div>
                </div>
                {isSelected && (
                  <Badge className="mt-3 w-full justify-center">
                    Selected
                  </Badge>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Skip Option */}
      <div className="text-center mb-8">
        <Card className="border-dashed">
          <CardContent className="py-6">
            <div className="text-center">
              <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <h3 className="font-medium mb-1">Not sure yet?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                You can skip this step and choose a template later when creating your first meeting.
              </p>
              <Button variant="outline" onClick={handleSkip}>
                Skip for now
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <Button 
          onClick={handleContinue}
          disabled={!onboardingData.selectedTemplateId}
        >
          Continue
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* Help Text */}
      <div className="text-center mt-6">
        <p className="text-sm text-muted-foreground">
          You can customize templates and create new ones anytime from your dashboard
        </p>
      </div>
    </div>
  );
}
