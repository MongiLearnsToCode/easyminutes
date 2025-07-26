import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Share Meeting - Easy Minutes",
  description: "Configure sharing settings for your meeting minutes",
};

interface SharePageProps {
  params: {
    id: string;
  };
}

export default function SharePage({ params }: SharePageProps) {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Share Meeting</h1>
        <p className="text-muted-foreground">
          Configure sharing settings for your meeting minutes
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="grid gap-6">
          {/* Meeting Info */}
          <div className="rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Meeting Information</h2>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium">Title:</span> Weekly Team Standup
              </p>
              <p>
                <span className="font-medium">Date:</span> March 15, 2024
              </p>
              <p>
                <span className="font-medium">ID:</span> {params.id}
              </p>
            </div>
          </div>

          {/* Sharing Options */}
          <div className="rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Sharing Settings</h2>
            <div className="space-y-6">
              {/* Public Access */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium">Public Access</h3>
                  <p className="text-sm text-muted-foreground">
                    Anyone with the link can view this meeting
                  </p>
                </div>
                <input type="checkbox" className="mt-1" />
              </div>

              {/* Password Protection */}
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium">Password Protection</h3>
                    <p className="text-sm text-muted-foreground">
                      Require a password to access the meeting
                    </p>
                  </div>
                  <input type="checkbox" className="mt-1" />
                </div>
                <input
                  type="password"
                  placeholder="Enter password..."
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  disabled
                />
              </div>

              {/* Expiration */}
              <div className="space-y-3">
                <h3 className="font-medium">Link Expiration</h3>
                <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="never">Never expires</option>
                  <option value="24h">24 hours</option>
                  <option value="1week">1 week</option>
                  <option value="1month">1 month</option>
                </select>
              </div>
            </div>
          </div>

          {/* Generated Link */}
          <div className="rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Shareable Link</h2>
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value="https://easyminutes.com/share/abc123..."
                  className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  readOnly
                />
                <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                  Copy
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Link will be generated when you enable sharing
              </p>
            </div>
          </div>

          {/* Access Log */}
          <div className="rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Access Log</h2>
            <div className="text-center py-8 text-muted-foreground">
              <p>No access recorded yet</p>
              <p className="text-xs mt-2">
                Access logs will appear here when someone views your shared meeting
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
              Generate Link
            </button>
            <button className="rounded-md border border-input px-4 py-2 text-sm font-medium">
              Revoke Access
            </button>
            <button className="rounded-md border border-input px-4 py-2 text-sm font-medium">
              Back to Meeting
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
