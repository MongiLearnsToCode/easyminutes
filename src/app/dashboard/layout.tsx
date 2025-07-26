import { Metadata } from "next";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Sidebar } from "@/components/layout/sidebar";
import { ProtectedRoute } from "@/components/auth/protected-route";

export const metadata: Metadata = {
  title: {
    template: "%s | Dashboard - Easy Minutes",
    default: "Dashboard - Easy Minutes",
  },
  description: "Manage your meeting minutes and transcriptions with AI-powered tools",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requireAuth={true}>
      <div className="flex min-h-screen bg-background">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main content area */}
        <div className="flex-1 flex flex-col md:ml-64">
          {/* Header */}
          <DashboardHeader />
          
          {/* Page content */}
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-7xl mx-auto">
              <DashboardNav />
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
