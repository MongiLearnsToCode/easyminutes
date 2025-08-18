'use client';

import { MeetingMinutes } from '@/hooks/use-process-meeting-notes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface MeetingMinutesDisplayProps {
  minutes: MeetingMinutes;
}

export function MeetingMinutesDisplay({ minutes }: MeetingMinutesDisplayProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">{minutes.title}</h1>
        <p className="text-sm text-gray-500">
          Generated on {new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      <Separator />

      {/* Executive Summary & Action Minutes */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-3">Executive Summary & Action Minutes</h2>
        <p className="text-gray-700 whitespace-pre-wrap">{minutes.executiveSummary}</p>
        {minutes.actionMinutes && (
          <div className="mt-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-gray-700 whitespace-pre-wrap">{minutes.actionMinutes}</p>
          </div>
        )}
      </section>

      <Separator />

      {/* Attendees */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-3">Attendees</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {minutes.attendees.map((attendee, index) => (
            <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="ml-3">
                <p className="font-medium text-gray-900">{attendee.name}</p>
                <p className="text-sm text-gray-500">{attendee.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* Decisions Made */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-3">Decisions Made</h2>
        <div className="space-y-4">
          {minutes.decisions.map((decision, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg">
              <p className="text-gray-700 mb-2">{decision.description}</p>
              <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                <span>Made by: {decision.madeBy}</span>
                <span>Date: {decision.date}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* Risks & Mitigations */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-3">Risks & Mitigations</h2>
        <div className="space-y-4">
          {minutes.risks.map((risk, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-1">Risk:</h3>
              <p className="text-gray-700 mb-3">{risk.description}</p>
              <h3 className="font-medium text-gray-900 mb-1">Mitigation:</h3>
              <p className="text-gray-700">{risk.mitigation}</p>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* Action Items */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-3">Action Items</h2>
        <div className="space-y-3">
          {minutes.actionItems.map((item, index) => (
            <div key={index} className="flex items-start p-4 border border-gray-200 rounded-lg">
              <div className="flex-1">
                <p className="text-gray-700 mb-2">{item.description}</p>
                <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                  <span>Owner: {item.owner}</span>
                  <span>Deadline: {item.deadline}</span>
                </div>
              </div>
              <Badge variant="secondary" className="ml-2">Pending</Badge>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* Observations & Insights */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-3">Observations & Insights</h2>
        <div className="space-y-3">
          {minutes.observations.map((observation, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700">{observation.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}