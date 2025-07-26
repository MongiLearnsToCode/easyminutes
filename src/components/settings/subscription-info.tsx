"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Loader2, 
  Crown, 
  Zap, 
  Building, 
  Calendar, 
  HardDrive, 
  FileAudio,
  ArrowUpCircle
} from "lucide-react";
import Link from "next/link";

export function SubscriptionInfo() {
  const { user: clerkUser } = useUser();
  const { toast } = useToast();

  // Get user data from Convex
  const convexUser = useQuery(
    api.users.getUserByClerkId,
    clerkUser ? { clerkId: clerkUser.id } : "skip"
  );

  // Get usage statistics
  const usageStats = useQuery(
    api.users.getUserUsageStats,
    convexUser ? { userId: convexUser._id } : "skip"
  );

  if (!convexUser || !usageStats) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading subscription info...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatStorageSize = (mb: number) => {
    if (mb >= 1024) {
      return `${(mb / 1024).toFixed(1)} GB`;
    }
    return `${mb} MB`;
  };

  const getPlanIcon = (tier: string) => {
    switch (tier) {
      case "free":
        return <Zap className="h-5 w-5" />;
      case "pro":
        return <Crown className="h-5 w-5" />;
      case "business":
        return <Building className="h-5 w-5" />;
      default:
        return <Zap className="h-5 w-5" />;
    }
  };

  const getPlanColor = (tier: string) => {
    switch (tier) {
      case "free":
        return "secondary";
      case "pro":
        return "default";
      case "business":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const transcriptionProgress = usageStats.transcriptionLimit 
    ? (usageStats.monthlyTranscriptions / usageStats.transcriptionLimit) * 100 
    : 0;
  
  const storageProgress = (usageStats.storageUsedMB / usageStats.storageLimit) * 100;

  const lastResetDate = new Date(usageStats.lastUsageReset).toLocaleDateString();

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getPlanIcon(usageStats.subscriptionTier)}
              Current Plan
            </div>
            <Badge variant={getPlanColor(usageStats.subscriptionTier)}>
              {usageStats.subscriptionTier.charAt(0).toUpperCase() + usageStats.subscriptionTier.slice(1)}
            </Badge>
          </CardTitle>
          <CardDescription>
            {usageStats.subscriptionTier === "free" && 
              "Perfect for getting started with AI meeting transcription"
            }
            {usageStats.subscriptionTier === "pro" && 
              "Unlimited transcriptions and advanced features for professionals"
            }
            {usageStats.subscriptionTier === "business" && 
              "Enterprise-grade features with team collaboration tools"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {/* Plan Features */}
            <div className="space-y-3">
              <h4 className="font-medium">Plan Features</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <FileAudio className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {usageStats.transcriptionLimit ? 
                      `${usageStats.transcriptionLimit} transcriptions/month` : 
                      "Unlimited transcriptions"
                    }
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                  <span>{formatStorageSize(usageStats.storageLimit)} storage</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {usageStats.subscriptionTier === "free" && "Basic templates"}
                    {usageStats.subscriptionTier === "pro" && "Custom templates + Priority support"}
                    {usageStats.subscriptionTier === "business" && "Team features + Advanced analytics"}
                  </span>
                </div>
              </div>
            </div>

            {/* Upgrade Option */}
            {usageStats.subscriptionTier === "free" && (
              <div className="space-y-3">
                <h4 className="font-medium">Upgrade Your Plan</h4>
                <p className="text-sm text-muted-foreground">
                  Get unlimited transcriptions, custom templates, and priority support
                </p>
                <Button asChild className="w-full">
                  <Link href="/dashboard/billing">
                    <ArrowUpCircle className="h-4 w-4 mr-2" />
                    Upgrade to Pro
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Usage Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Monthly Usage
          </CardTitle>
          <CardDescription>
            Usage statistics for the current billing period (resets on {lastResetDate})
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Transcriptions Usage */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Transcriptions</span>
                <span className="text-muted-foreground">
                  {usageStats.monthlyTranscriptions} / {usageStats.transcriptionLimit || "∞"}
                </span>
              </div>
              {usageStats.transcriptionLimit && (
                <Progress 
                  value={transcriptionProgress} 
                  className="h-2"
                />
              )}
              {usageStats.transcriptionLimit && transcriptionProgress >= 80 && (
                <p className="text-xs text-orange-600">
                  You're nearing your monthly transcription limit
                </p>
              )}
            </div>

            <Separator />

            {/* Storage Usage */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Storage Used</span>
                <span className="text-muted-foreground">
                  {formatStorageSize(usageStats.storageUsedMB)} / {formatStorageSize(usageStats.storageLimit)}
                </span>
              </div>
              <Progress 
                value={storageProgress} 
                className="h-2"
              />
              {storageProgress >= 80 && (
                <p className="text-xs text-orange-600">
                  You're running low on storage space
                </p>
              )}
            </div>

            {/* Usage Tips */}
            {(transcriptionProgress >= 80 || storageProgress >= 80) && usageStats.subscriptionTier === "free" && (
              <div className="rounded-lg bg-orange-50 border border-orange-200 p-4">
                <h4 className="text-sm font-medium text-orange-800 mb-2">
                  Consider Upgrading
                </h4>
                <p className="text-xs text-orange-700 mb-3">
                  You're approaching your plan limits. Upgrade to Pro for unlimited transcriptions 
                  and {formatStorageSize(10240)} of storage.
                </p>
                <Button size="sm" variant="outline" className="border-orange-300" asChild>
                  <Link href="/dashboard/billing">
                    View Upgrade Options
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Account Management */}
      <Card>
        <CardHeader>
          <CardTitle>Account Management</CardTitle>
          <CardDescription>
            Manage your billing, subscription, and account settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="outline" asChild>
              <Link href="/dashboard/billing">
                Manage Billing
              </Link>
            </Button>
            {usageStats.subscriptionTier !== "free" && (
              <Button variant="outline" asChild>
                <Link href="/dashboard/billing">
                  View Invoices
                </Link>
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link href="/dashboard/analytics">
                Usage Analytics
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
