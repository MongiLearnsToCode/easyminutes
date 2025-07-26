import { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Meeting - Easy Minutes",
  description: "Create new meeting minutes from audio or text",
};

export default function NewMeetingPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create New Meeting</h1>
        <p className="text-muted-foreground">
          Import meeting content from audio files or paste text directly
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="grid gap-6">
          {/* Meeting Details */}
          <div className="rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Meeting Details</h2>
            <div className="grid gap-4">
              <div>
                <label className="text-sm font-medium">Meeting Title</label>
                <input
                  type="text"
                  placeholder="Enter meeting title..."
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Date</label>
                <input
                  type="date"
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Template</label>
                <select className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option>Standard Business Meeting</option>
                  <option>Project Standup</option>
                  <option>Client Meeting</option>
                </select>
              </div>
            </div>
          </div>

          {/* Import Options */}
          <div className="rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Import Content</h2>
            <div className="grid gap-4">
              {/* Audio Upload */}
              <div className="rounded-lg border-2 border-dashed p-8 text-center">
                <div className="text-muted-foreground mb-4">
                  <svg
                    className="mx-auto h-12 w-12 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 4a3 3 0 016 0v4a3 3 0 01-6 0V4zM5.5 9.643a.75.75 0 00-1.5 0V10c0 3.06 2.29 5.585 5.25 5.954V17.5h-1.5a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5H10.5v-1.546A6.001 6.001 0 0016 10v-.357a.75.75 0 00-1.5 0V10a4.5 4.5 0 01-9 0v-.357z"
                    />
                  </svg>
                  <p className="text-lg font-medium">Upload Audio File</p>
                  <p className="text-sm">Drop audio files here or click to browse</p>
                  <p className="text-xs mt-2">Supports MP3, WAV, M4A, FLAC (max 100MB)</p>
                </div>
                <input type="file" accept="audio/*" className="hidden" />
                <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                  Choose File
                </button>
              </div>

              <div className="text-center text-muted-foreground">
                <span className="bg-background px-2">or</span>
              </div>

              {/* Text Input */}
              <div>
                <label className="text-sm font-medium">Paste Meeting Notes</label>
                <textarea
                  placeholder="Paste your raw meeting notes here..."
                  className="mt-1 w-full h-32 rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
              Process Meeting
            </button>
            <button className="rounded-md border border-input px-4 py-2 text-sm font-medium">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
