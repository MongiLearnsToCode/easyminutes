import { Metadata } from "next";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { ProfileSettings } from "@/components/settings/profile-settings";
import { NotificationSettings } from "@/components/settings/notification-settings";
import { SubscriptionInfo } from "@/components/settings/subscription-info";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Settings - Easy Minutes",
  description: "Manage your profile, preferences, and subscription settings",
};

export default function SettingsPage() {
  return (
    <ProtectedRoute requireAuth={true}>
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your profile, preferences, and account settings
          </p>
        </div>

        <div className="max-w-4xl space-y-8">
          {/* Profile Settings */}
          <section>
            <div className="mb-6">
              <h2 className="text-xl font-semibold">Profile</h2>
              <p className="text-sm text-muted-foreground">
                Update your personal information and preferences
              </p>
            </div>
            <ProfileSettings />
          </section>

          <Separator />

          {/* Notification Settings */}
          <section>
            <div className="mb-6">
              <h2 className="text-xl font-semibold">Notifications</h2>
              <p className="text-sm text-muted-foreground">
                Choose when and how you want to be notified
              </p>
            </div>
            <NotificationSettings />
          </section>

          <Separator />

          {/* Subscription Information */}
          <section>
            <div className="mb-6">
              <h2 className="text-xl font-semibold">Subscription & Usage</h2>
              <p className="text-sm text-muted-foreground">
                View your current plan and usage statistics
              </p>
            </div>
            <SubscriptionInfo />
          </section>
        </div>
      </div>
    </ProtectedRoute>
  );
}
