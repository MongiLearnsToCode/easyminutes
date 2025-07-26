import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Meeting Minutes - Easy Minutes",
  description: "Edit and manage your meeting minutes",
};

interface MeetingMinutesPageProps {
  params: {
    id: string;
  };
}

export default function MeetingMinutesPage({ params }: MeetingMinutesPageProps) {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Meeting Minutes</h1>
          <p className="text-muted-foreground">Meeting ID: {params.id}</p>
        </div>
        <div className="flex gap-2">
          <button className="rounded-md border border-input px-4 py-2 text-sm font-medium">
            Share
          </button>
          <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            Export
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Main Editor */}
        <div className="lg:col-span-3">
          <div className="rounded-lg border p-6">
            <div className="mb-6">
              <input
                type="text"
                placeholder="Meeting Title"
                className="text-2xl font-semibold bg-transparent border-none outline-none w-full"
                defaultValue="Weekly Team Standup"
              />
              <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                <span>March 15, 2024</span>
                <span>•</span>
                <span>45 minutes</span>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Completed
                </span>
              </div>
            </div>

            {/* Meeting Sections */}
            <div className="space-y-6">
              {/* Attendees */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Attendees</h3>
                <div className="bg-muted/50 rounded-md p-4">
                  <p className="text-sm">Click to edit attendees...</p>
                </div>
              </div>

              {/* Agenda */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Agenda</h3>
                <div className="bg-muted/50 rounded-md p-4 min-h-[100px]">
                  <p className="text-sm">Click to edit agenda items...</p>
                </div>
              </div>

              {/* Discussion */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Discussion</h3>
                <div className="bg-muted/50 rounded-md p-4 min-h-[200px]">
                  <p className="text-sm">Click to edit discussion notes...</p>
                </div>
              </div>

              {/* Decisions */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Decisions Made</h3>
                <div className="bg-muted/50 rounded-md p-4 min-h-[100px]">
                  <p className="text-sm">Click to edit decisions...</p>
                </div>
              </div>

              {/* Action Items */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Action Items</h3>
                <div className="bg-muted/50 rounded-md p-4 min-h-[100px]">
                  <p className="text-sm">Click to add action items...</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Processing Status */}
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold mb-3">Status</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Transcription Complete</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>AI Processing Complete</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Ready for Editing</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold mb-3">Actions</h3>
            <div className="space-y-2">
              <button className="w-full text-left text-sm p-2 rounded hover:bg-muted">
                View Raw Transcript
              </button>
              <button className="w-full text-left text-sm p-2 rounded hover:bg-muted">
                Change Template
              </button>
              <button className="w-full text-left text-sm p-2 rounded hover:bg-muted">
                Regenerate with AI
              </button>
              <button className="w-full text-left text-sm p-2 rounded hover:bg-muted text-destructive">
                Archive Meeting
              </button>
            </div>
          </div>

          {/* Auto-save */}
          <div className="text-xs text-muted-foreground text-center">
            Auto-saved 2 minutes ago
          </div>
        </div>
      </div>
    </div>
  );
}
