"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Activity, BarChart2, Calendar } from "lucide-react";

export default function MeetingsAnalyticsPage() {
  // Mock data for analytics - replace with actual data from your backend
  const metrics = [
    { label: "Total Meetings", value: 35, icon: Calendar },
    { label: "Participants Engaged", value: 112, icon: Users },
    { label: "Active Projects", value: 8, icon: Activity },
    { label: "Monthly Growth", value: "25%", icon: BarChart2 }
  ];

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Meetings Analytics</h1>
        <p className="text-muted-foreground">
          Gain insights into your meetings and engagement
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <Card key={metric.label} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">{metric.value}</CardTitle>
                <CardDescription>{metric.label}</CardDescription>
              </div>
              <div className="text-muted-foreground">
                {React.createElement(metric.icon, { className: "h-8 w-8" })}
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {metrics.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <BarChart2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No analytics available</h3>
            <p className="text-muted-foreground mb-4">
              Participate in more meetings to generate analytics
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
