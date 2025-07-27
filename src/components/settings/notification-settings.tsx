"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Bell, Mail, Smartphone } from "lucide-react";

interface NotificationPreferences {
  emailOnTranscriptionComplete: boolean;
  emailOnShareAccess: boolean;
  emailOnSubscriptionUpdates: boolean;
  inAppNotifications: boolean;
}

export function NotificationSettings() {
  const { user: supabaseUser } = useAuth();
  const { toast } = useToast();

  // Get user data from Convex
  const convexUser = useQuery(
    api.users.getUserBySupabaseId,
    supabaseUser ? { supabaseId: supabaseUser.id } : "skip"
  );

  // Mutations
  const updateNotificationPreferences = useMutation(api.users.updateNotificationPreferences);

  // Form state
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    emailOnTranscriptionComplete: true,
    emailOnShareAccess: true,
    emailOnSubscriptionUpdates: true,
    inAppNotifications: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize form with user data
  useEffect(() => {
    if (convexUser?.notificationPreferences) {
      setPreferences(convexUser.notificationPreferences);
      setHasChanges(false);
    }
  }, [convexUser]);

  const handlePreferenceChange = (key: keyof NotificationPreferences, value: boolean) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!convexUser) return;

    setIsLoading(true);
    try {
      await updateNotificationPreferences({
        userId: convexUser._id,
        preferences,
      });

      toast({
        title: "Preferences updated",
        description: "Your notification settings have been saved successfully.",
      });
      setHasChanges(false);
    } catch (error) {
      console.error("Failed to update notification preferences:", error);
      toast({
        title: "Error",
        description: "Failed to update your notification preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!convexUser) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading notification settings...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Preferences
        </CardTitle>
        <CardDescription>
          Choose when and how you want to receive notifications
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Notifications */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-medium">Email Notifications</h3>
            </div>
            
            <div className="space-y-4 pl-6 border-l border-border">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="emailTranscription" className="text-sm font-medium">
                    Transcription Complete
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Get notified when your meeting transcription is ready
                  </p>
                </div>
                <Switch
                  id="emailTranscription"
                  checked={preferences.emailOnTranscriptionComplete}
                  onCheckedChange={(checked) => 
                    handlePreferenceChange("emailOnTranscriptionComplete", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="emailShareAccess" className="text-sm font-medium">
                    Share Access
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Get notified when someone accesses your shared meeting minutes
                  </p>
                </div>
                <Switch
                  id="emailShareAccess"
                  checked={preferences.emailOnShareAccess}
                  onCheckedChange={(checked) => 
                    handlePreferenceChange("emailOnShareAccess", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="emailSubscription" className="text-sm font-medium">
                    Subscription Updates
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Get notified about billing, plan changes, and account updates
                  </p>
                </div>
                <Switch
                  id="emailSubscription"
                  checked={preferences.emailOnSubscriptionUpdates}
                  onCheckedChange={(checked) => 
                    handlePreferenceChange("emailOnSubscriptionUpdates", checked)
                  }
                />
              </div>
            </div>
          </div>

          {/* In-App Notifications */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Smartphone className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-medium">In-App Notifications</h3>
            </div>
            
            <div className="space-y-4 pl-6 border-l border-border">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="inAppNotifications" className="text-sm font-medium">
                    Browser Notifications
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Show notifications in your browser for important updates
                  </p>
                </div>
                <Switch
                  id="inAppNotifications"
                  checked={preferences.inAppNotifications}
                  onCheckedChange={(checked) => 
                    handlePreferenceChange("inAppNotifications", checked)
                  }
                />
              </div>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="rounded-lg bg-muted/50 p-4">
            <h4 className="text-sm font-medium mb-2">Privacy & Data</h4>
            <p className="text-xs text-muted-foreground">
              We respect your privacy and only send notifications you&apos;ve opted into.
              You can change these settings at any time. Critical security and account 
              notifications will always be sent regardless of your preferences.
            </p>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={isLoading || !hasChanges}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Preferences
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
