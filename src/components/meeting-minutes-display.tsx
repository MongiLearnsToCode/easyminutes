'use client';

import { useState } from 'react';
import { MeetingMinutes } from '@/hooks/use-process-meeting-notes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ExportButton } from '@/components/export-button';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/clerk-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EditableSection } from '@/components/editable-section';
import { Button } from '@/components/ui/button';
import { Plus, Save, X, Share } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { SaveUpgradePrompt } from '@/components/save-upgrade-prompt';

interface EditableMeetingMinutes extends MeetingMinutes {
  edited?: boolean;
}

interface MeetingMinutesDisplayProps {
  minutes: MeetingMinutes;
  isProUser?: boolean;
  onUpgradeClick?: () => void;
  onSave?: (minutes: EditableMeetingMinutes) => void;
}

export function MeetingMinutesDisplay({ minutes, isProUser = false, onUpgradeClick, onSave }: MeetingMinutesDisplayProps) {
  const { user } = useUser();
  const [createShareableLink] = useMutation(api.create_shareable_link.createShareableLink);
  const [shareableLink, setShareableLink] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [showSaveUpgradePrompt, setShowSaveUpgradePrompt] = useState(false);
  
  // Create a local copy of the minutes for editing
  const [editableMinutes, setEditableMinutes] = useState<EditableMeetingMinutes>({ ...minutes });
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    if (!isProUser) {
      // Show upgrade prompt for free users
      setShowSaveUpgradePrompt(true);
      return;
    }
    
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
    <div className="space-y-8 max-w-4xl mx-auto px-4 sm:px-6">
      {/* Save Upgrade Prompt */}
      {showSaveUpgradePrompt && (
        <SaveUpgradePrompt 
          onUpgradeClick={() => {
            setShowSaveUpgradePrompt(false);
            onUpgradeClick?.();
          }}
          onDismiss={() => setShowSaveUpgradePrompt(false)}
        />
      )}
      
      {/* Header */}
      <div className="text-center space-y-4 py-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">{editableMinutes.title}</h1>
        <p className="text-base sm:text-lg text-gray-600">
          Generated on {new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-2 pt-4">
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} variant="outline" className="w-full sm:w-auto">
              Edit Minutes
            </Button>
          ) : (
            <>
              <Button onClick={handleSave} variant="default" className="w-full sm:w-auto">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
              <Button onClick={handleCancel} variant="outline" className="w-full sm:w-auto">
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </>
          )}
          <Button 
            onClick={async () => {
              if (!isProUser) {
                onUpgradeClick?.();
                return;
              }
              
              if (!user) {
                alert('You must be logged in to share meeting minutes.');
                return;
              }
              
              // Create shareable link
              setIsSharing(true);
              try {
                // In a real implementation, we would need to pass the actual minutes ID
                // This is a placeholder implementation
                alert('In a full implementation, this would create a shareable link for your meeting minutes.');
                
                // TODO: Get the actual minutes ID from the context
                // const result = await createShareableLink({
                //   minutesId: /* actual minutes ID */,
                //   userId: user.id,
                //   expiresInDays: 30 // Link expires in 30 days
                // });
                // 
                // if (result.success) {
                //   // Copy the shareable URL to clipboard
                //   navigator.clipboard.writeText(result.shareableUrl);
                //   setShareableLink(result.shareableUrl);
                //   alert(`Shareable link copied to clipboard: ${result.shareableUrl}`);
                // } else {
                //   alert('Failed to create shareable link. Please try again.');
                // }
              } catch (error) {
                console.error('Error creating shareable link:', error);
                alert('Failed to create shareable link. Please try again.');
              } finally {
                setIsSharing(false);
              }
            }} 
            variant="outline" 
            className="w-full sm:w-auto"
            disabled={isSharing}
          >
            <Share className="h-4 w-4 mr-2" />
            {isSharing ? 'Sharing...' : 'Share'}
          </Button>
          <ExportButton 
            minutes={editableMinutes} 
            filename={editableMinutes.title}
            isProUser={isProUser}
            onUpgradeClick={onUpgradeClick}
            className="w-full sm:w-auto"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
        <div className="border rounded-lg overflow-x-auto">
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-2xl font-bold text-gray-900 border-l-4 border-indigo-600 pl-4 py-3">Observations & Insights</h2>
          {isEditing && (
            <Button onClick={addObservation} variant="outline" size="sm" className="w-full sm:w-auto">
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