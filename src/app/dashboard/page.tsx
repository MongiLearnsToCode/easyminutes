"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { user: clerkUser } = useUser();
  
  // Get user data from Convex
  const convexUser = useQuery(
    api.users.getUserByClerkId,
    clerkUser ? { clerkId: clerkUser.id } : "skip"
  );

  // Redirect to onboarding if user hasn't completed it
  useEffect(() => {
    if (convexUser && !convexUser.onboardingCompleted) {
      router.push("/onboarding");
    }
  }, [convexUser, router]);

  // Show loading while checking onboarding status
  if (!convexUser) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  // Don't render dashboard content if user needs onboarding
  if (!convexUser.onboardingCompleted) {
    return null;
  }
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your meeting minutes and transcriptions
        </p>
      </div>

      <div className="grid gap-6">
        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border p-4">
            <h3 className="text-sm font-medium text-muted-foreground">Total Meetings</h3>
            <p className="text-2xl font-bold">0</p>
          </div>
          <div className="rounded-lg border p-4">
            <h3 className="text-sm font-medium text-muted-foreground">This Month</h3>
            <p className="text-2xl font-bold">0</p>
          </div>
          <div className="rounded-lg border p-4">
            <h3 className="text-sm font-medium text-muted-foreground">Processing</h3>
            <p className="text-2xl font-bold">0</p>
          </div>
          <div className="rounded-lg border p-4">
            <h3 className="text-sm font-medium text-muted-foreground">Storage Used</h3>
            <p className="text-2xl font-bold">0 MB</p>
          </div>
        </div>

        {/* Recent Meetings */}
        <div className="rounded-lg border">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Meetings</h2>
            <div className="text-center py-8 text-muted-foreground">
              <p className="mb-4">No meetings yet</p>
              <a
                href="/dashboard/new"
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
              >
                Create Your First Meeting
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
