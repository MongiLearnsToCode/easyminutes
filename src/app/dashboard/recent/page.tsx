"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, FileText } from "lucide-react";

export default function RecentMeetingsPage() {
  // Mock data - replace with actual data from your backend
  const recentMeetings = [
    {
      id: "1",
      title: "Weekly Team Standup",
      date: "2024-01-15",
      time: "09:00 AM",
      duration: "30 mins",
      participants: 5,
      status: "completed",
      transcript: "Available"
    },
    {
      id: "2",
      title: "Client Project Review",
      date: "2024-01-14",
      time: "02:00 PM",
      duration: "60 mins",
      participants: 3,
      status: "completed",
      transcript: "Available"
    },
    {
      id: "3",
      title: "Product Planning Meeting",
      date: "2024-01-13",
      time: "10:30 AM",
      duration: "45 mins",
      participants: 8,
      status: "processing",
      transcript: "Processing"
    }
  ];

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Recent Meetings</h1>
        <p className="text-muted-foreground">
          View and manage your recent meeting minutes and transcripts
        </p>
      </div>

      <div className="grid gap-6">
        {recentMeetings.map((meeting) => (
          <Card key={meeting.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">{meeting.title}</CardTitle>
                  <CardDescription className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {meeting.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {meeting.time} ({meeting.duration})
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {meeting.participants} participants
                    </span>
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={meeting.status === "completed" ? "default" : "secondary"}
                  >
                    {meeting.status}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    {meeting.transcript}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button size="sm">
                  View Minutes
                </Button>
                <Button size="sm" variant="outline">
                  Download
                </Button>
                <Button size="sm" variant="outline">
                  Share
                </Button>
                {meeting.status === "processing" && (
                  <Button size="sm" variant="secondary" disabled>
                    Processing...
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {recentMeetings.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No recent meetings</h3>
            <p className="text-muted-foreground mb-4">
              Start by creating your first meeting minutes
            </p>
            <Button>Create New Meeting</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
