'use client';

import { useState } from 'react';
import { MeetingMinutes } from '@/hooks/use-process-meeting-notes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ExportButton } from '@/components/export-button';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/clerk-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EditableSection } from '@/components/editable-section';
import { Button } from '@/components/ui/button';
import { Plus, Save, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface EditableMeetingMinutes extends MeetingMinutes {
  edited?: boolean;
}

interface MeetingMinutesDisplayProps {
  minutes: MeetingMinutes;
  onUpgradeClick?: () => void;
  onSave?: (minutes: EditableMeetingMinutes) => void;
}

export function MeetingMinutesDisplay({ minutes, onUpgradeClick, onSave }: MeetingMinutesDisplayProps) {
  const { user } = useUser();
  const userProfile = useQuery(api.user_profile.getUserProfileByUserId, {
    userId: user?.id || '',
  });
  
  const isProUser = userProfile?.plan === 'pro';
  
  // Create a local copy of the minutes for editing
  const [editableMinutes, setEditableMinutes] = useState<EditableMeetingMinutes>({ ...minutes });
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    if (onSave) {
      onSave({ ...editableMinutes, edited: true });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditableMinutes({ ...minutes });
    setIsEditing(false);
  };

  const updateSection = (section: keyof MeetingMinutes, value: any) => {
    setEditableMinutes(prev => ({
      ...prev,
      [section]: value
    }));
  };

  const updateExecutiveSummary = (content: string) => {
    updateSection('executiveSummary', content);
  };

  const updateActionMinutes = (content: string) => {
    updateSection('actionMinutes', content);
  };

  const updateObservation = (index: number, content: string) => {
    const newObservations = [...editableMinutes.observations];
    newObservations[index] = { description: content };
    updateSection('observations', newObservations);
  };

  const addObservation = () => {
    const newObservations = [...editableMinutes.observations, { description: '' }];
    updateSection('observations', newObservations);
  };

  const removeObservation = (index: number) => {
    const newObservations = editableMinutes.observations.filter((_, i) => i !== index);
    updateSection('observations', newObservations);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-4 py-6">
        <h1 className="text-4xl font-bold text-gray-900">{editableMinutes.title}</h1>
        <p className="text-lg text-gray-600">
          Generated on {new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
        <div className="flex justify-center space-x-2 pt-4">
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} variant="outline">
              Edit Minutes
            </Button>
          ) : (
            <>
              <Button onClick={handleSave} variant="default">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
              <Button onClick={handleCancel} variant="outline">
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </>
          )}
          <ExportButton 
            minutes={editableMinutes} 
            filename={editableMinutes.title}
            isProUser={isProUser}
            onUpgradeClick={onUpgradeClick}
          />
        </div>
      </div>

      <Separator className="my-8" />

      {/* Executive Summary & Action Minutes */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 border-l-4 border-blue-600 pl-4 py-3">Executive Summary & Action Minutes</h2>
        <EditableSection 
          title="Executive Summary"
          content={editableMinutes.executiveSummary}
          onSave={updateExecutiveSummary}
          className={isEditing ? "border rounded-lg p-4" : ""}
        />
        {editableMinutes.actionMinutes && (
          <Card className="border-l-4 border-blue-500 bg-blue-50">
            <CardContent className="pt-6">
              <EditableSection 
                title="Action Minutes"
                content={editableMinutes.actionMinutes}
                onSave={updateActionMinutes}
                className={isEditing ? "border rounded-lg p-4" : ""}
              />
            </CardContent>
          </Card>
        )}
      </section>

      <Separator className="my-8" />

      {/* Attendees */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 border-l-4 border-green-600 pl-4 py-3">Attendees</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {editableMinutes.attendees.map((attendee, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{attendee.name}</h3>
                    <p className="text-gray-600">{attendee.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator className="my-8" />

      {/* Decisions Made */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 border-l-4 border-purple-600 pl-4 py-3">Decisions Made</h2>
        <div className="space-y-4">
          {editableMinutes.decisions.map((decision, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <p className="text-gray-700 mb-4 text-lg">{decision.description}</p>
                <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                  <Badge variant="secondary">Made by: {decision.madeBy}</Badge>
                  <Badge variant="secondary">Date: {decision.date}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator className="my-8" />

      {/* Risks & Mitigations */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 border-l-4 border-red-600 pl-4 py-3">Risks & Mitigations</h2>
        <div className="space-y-6">
          {editableMinutes.risks.map((risk, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-l-4 border-red-500">
                <CardHeader>
                  <CardTitle className="text-lg text-red-700">Risk</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{risk.description}</p>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-green-500">
                <CardHeader>
                  <CardTitle className="text-lg text-green-700">Mitigation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{risk.mitigation}</p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </section>

      <Separator className="my-8" />

      {/* Action Items */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 border-l-4 border-yellow-600 pl-4 py-3">Action Items</h2>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-100">
              <TableRow>
                <TableHead className="w-1/2">Description</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {editableMinutes.actionItems.map((item, index) => (
                <TableRow key={index} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{item.description}</TableCell>
                  <TableCell>{item.owner}</TableCell>
                  <TableCell>{item.deadline}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">Pending</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      <Separator className="my-8" />

      {/* Observations & Insights */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 border-l-4 border-indigo-600 pl-4 py-3">Observations & Insights</h2>
          {isEditing && (
            <Button onClick={addObservation} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Observation
            </Button>
          )}
        </div>
        <div className="grid grid-cols-1 gap-4">
          {editableMinutes.observations.map((observation, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6 relative">
                <EditableSection 
                  title={`Observation ${index + 1}`}
                  content={observation.description}
                  onSave={(content) => updateObservation(index, content)}
                  className={isEditing ? "border rounded-lg p-4 pr-12" : ""}
                />
                {isEditing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => removeObservation(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}