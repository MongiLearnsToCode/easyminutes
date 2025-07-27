"use client";

import { useState } from "react";
import { processRawNotes } from "@/lib/gemini";
import { TextInput } from "@/components/ui/text-input";
import { FileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function NewMeetingPage() {
  const [meetingTitle, setMeetingTitle] = useState("");
  const [meetingDate, setMeetingDate] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("standard");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleTextSubmit = async (text: string) => {
    setProcessing(true);
    try {
      const response = await processRawNotes(text);

      if (response.success) {
        setResult(response.transcript || null);
        console.log("Processed Transcript:", response.transcript);
      } else {
        alert("Processing failed: " + response.error);
      }
    } catch (error) {
      console.error("Processing error:", error);
      alert("An error occurred during processing.");
    } finally {
      setProcessing(false);
    }
  };

  const handleFileSelect = async (file: File) => {
    // TODO: Implement audio transcription
    console.log("Audio file selected:", file.name);
    alert("Audio transcription will be implemented in the next task.");
  };
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
          <Card>
            <CardHeader>
              <CardTitle>Meeting Details</CardTitle>
              <CardDescription>Basic information about your meeting</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="meeting-title">Meeting Title</Label>
                <Input
                  id="meeting-title"
                  type="text"
                  placeholder="Enter meeting title..."
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="meeting-date">Date</Label>
                <Input
                  id="meeting-date"
                  type="date"
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="template-select">Template</Label>
                <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard Business Meeting</SelectItem>
                    <SelectItem value="standup">Project Standup</SelectItem>
                    <SelectItem value="client">Client Meeting</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Import Options */}
          <Card>
            <CardHeader>
              <CardTitle>Import Content</CardTitle>
              <CardDescription>Upload audio files or paste text to generate meeting minutes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Audio Upload */}
              <div>
                <FileUpload
                  onFileSelect={handleFileSelect}
                  disabled={processing}
                />
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">or</span>
                </div>
              </div>

              {/* Text Input */}
              <div>
                <TextInput
                  onTextSubmit={handleTextSubmit}
                  disabled={processing}
                  placeholder="Paste your raw meeting notes here..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Result Display */}
          {result && (
            <Card>
              <CardHeader>
                <CardTitle>Processed Meeting Notes</CardTitle>
                <CardDescription>AI-generated meeting minutes ready for editing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-md">
                  <pre className="whitespace-pre-wrap text-sm font-mono">{result}</pre>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button>Edit Minutes</Button>
                  <Button variant="outline">Save as Draft</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
