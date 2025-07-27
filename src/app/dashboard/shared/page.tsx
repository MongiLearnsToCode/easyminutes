"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";

export default function SharedMeetingsPage() {
  // Mock data - replace with actual data from your backend
  const sharedMeetings = [
    {
      id: "1",
      title: "Quarterly Business Review",
      sharedWith: ["alice@example.com", "bob@example.com"],
      accessLevel: "editor"
    },
    {
      id: "2",
      title: "Marketing Strategy Meeting",
      sharedWith: ["carol@example.com"],
      accessLevel: "viewer"
    },
    {
      id: "3",
      title: "Project Roadmap Discussion",
      sharedWith: ["dave@example.com", "eve@example.com"],
      accessLevel: "editor"
    }
  ];

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Shared Meetings</h1>
        <p className="text-muted-foreground">
          Manage meetings shared with you and your team
        </p>
      </div>

      <div className="grid gap-6">
        {sharedMeetings.map((meeting) => (
          <Card key={meeting.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">{meeting.title}</CardTitle>
                  <CardDescription className="mt-2">
                    Shared with: {meeting.sharedWith.join(", ")}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant={meeting.accessLevel === "editor" ? "default" : "outline"}>
                    {meeting.accessLevel.charAt(0).toUpperCase() + meeting.accessLevel.slice(1)}
                  </Button>
                  <Button size="sm" variant="outline" className="flex items-center gap-1">
                    <Share2 className="h-3 w-3" />
                    Share
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button size="sm">Open</Button>
                <Button size="sm" variant="outline">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {sharedMeetings.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Share2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No shared meetings</h3>
            <p className="text-muted-foreground mb-4">
              Start collaborating by sharing a meeting
            </p>
            <Button>Share a Meeting</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
