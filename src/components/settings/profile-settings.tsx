"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, User } from "lucide-react";

export function ProfileSettings() {
  const { user: clerkUser } = useUser();
  const { toast } = useToast();

  // Get user data from Convex
  const convexUser = useQuery(
    api.users.getUserByClerkId,
    clerkUser ? { clerkId: clerkUser.id } : "skip"
  );

  // Get available templates for default selection
  const templatesData = useQuery(
    api.templates.getAvailableTemplates,
    convexUser ? { userId: convexUser._id } : "skip"
  );

  // Mutations
  const updateProfile = useMutation(api.users.updateUserProfile);

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    defaultTemplateId: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form with user data
  useEffect(() => {
    if (convexUser) {
      setFormData({
        firstName: convexUser.firstName || "",
        lastName: convexUser.lastName || "",
        defaultTemplateId: convexUser.defaultTemplateId || "",
      });
    }
  }, [convexUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!convexUser) return;

    setIsLoading(true);
    try {
      await updateProfile({
        userId: convexUser._id,
        firstName: formData.firstName || undefined,
        lastName: formData.lastName || undefined,
        defaultTemplateId: formData.defaultTemplateId ? 
          formData.defaultTemplateId as Id<"templates"> : undefined,
      });

      toast({
        title: "Profile updated",
        description: "Your profile settings have been saved successfully.",
      });
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast({
        title: "Error",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!convexUser) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading profile...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Profile Information
        </CardTitle>
        <CardDescription>
          Update your personal information and set your default preferences
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={clerkUser?.imageUrl} alt={clerkUser?.fullName || "User"} />
              <AvatarFallback>
                {clerkUser?.firstName?.[0]}{clerkUser?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium">{clerkUser?.fullName || "User"}</h3>
              <p className="text-sm text-muted-foreground">{clerkUser?.primaryEmailAddress?.emailAddress}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Profile picture is managed through your account provider
              </p>
            </div>
          </div>

          {/* Name Fields */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                placeholder="Enter your first name"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                placeholder="Enter your last name"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
              />
            </div>
          </div>

          {/* Default Template Selection */}
          <div className="space-y-2">
            <Label htmlFor="defaultTemplate">Default Meeting Template</Label>
            <Select
              value={formData.defaultTemplateId}
              onValueChange={(value) => handleInputChange("defaultTemplateId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a default template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No default template</SelectItem>
                {/* Default System Templates */}
                {templatesData?.defaultTemplates.map((template) => (
                  <SelectItem key={template._id} value={template._id}>
                    {template.name} (System Default)
                  </SelectItem>
                ))}
                {/* User's Custom Templates */}
                {templatesData?.userTemplates.map((template) => (
                  <SelectItem key={template._id} value={template._id}>
                    {template.name} (Custom)
                  </SelectItem>
                ))}
                {/* Public Templates from Other Users */}
                {templatesData?.publicTemplates.map((template) => (
                  <SelectItem key={template._id} value={template._id}>
                    {template.name} (Community)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              This template will be automatically selected when creating new meetings
            </p>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
