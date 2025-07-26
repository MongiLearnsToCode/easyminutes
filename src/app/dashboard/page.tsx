import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard - Easy Minutes",
  description: "Manage your meeting minutes and transcriptions",
};

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-8">
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
