"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Clock, Plus } from "lucide-react";

export default function MeetingsPage() {
  // Mock data - replace with actual data from your backend
  const meetings = [
    {
      id: "1",
      title: "Weekly Team Standup",
      date: "2024-01-15",
      time: "09:00 AM",
      duration: "30 mins",
      participants: 5,
      status: "completed",
      type: "recurring"
    },
    {
      id: "2",
      title: "Client Project Review",
      date: "2024-01-14",
      time: "02:00 PM",
      duration: "60 mins",
      participants: 3,
      status: "completed",
      type: "one-time"
    },
    {
      id: "3",
      title: "Product Planning Meeting",
      date: "2024-01-13",
      time: "10:30 AM",
      duration: "45 mins",
      participants: 8,
      status: "draft",
      type: "recurring"
    },
    {
      id: "4",
      title: "Board Meeting",
      date: "2024-01-20",
      time: "03:00 PM",
      duration: "120 mins",
      participants: 12,
      status: "scheduled",
      type: "one-time"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "default";
      case "scheduled": return "secondary";
      case "in-progress": return "destructive";
      case "draft": return "outline";
      default: return "secondary";
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">All Meetings</h1>
          <p className="text-muted-foreground">
            View and manage all your meeting minutes
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Meeting
        </Button>
      </div>

      <div className="grid gap-6">
        {meetings.map((meeting) => (
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
                  <Badge variant={getStatusColor(meeting.status)}>
                    {meeting.status}
                  </Badge>
                  <Badge variant="outline">
                    {meeting.type}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button size="sm">
                  {meeting.status === "draft" ? "Edit" : "View"}
                </Button>
                <Button size="sm" variant="outline">
                  Share
                </Button>
                <Button size="sm" variant="outline">
                  Export
                </Button>
                {meeting.status === "draft" && (
                  <Button size="sm" variant="destructive">
                    Delete
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {meetings.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No meetings found</h3>
            <p className="text-muted-foreground mb-4">
              Create your first meeting to get started
            </p>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Meeting
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
