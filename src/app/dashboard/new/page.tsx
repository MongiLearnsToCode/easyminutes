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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export default function NewMeetingPage() {
  const [meetingTitle, setMeetingTitle] = useState("");
  const [meetingDate, setMeetingDate] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("standard");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState<string>("");

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

  const handleFileSelect = async (
    file: File,
    onProgress?: (progress: number) => void,
    onStatusChange?: (status: string) => void
  ) => {
    setProcessing(true);
    setProcessingStatus("");
    
    const updateStatus = (status: string) => {
      setProcessingStatus(status);
      onStatusChange?.(status);
    };
    
    try {
      updateStatus("Preparing file for upload...");
      
      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]); // Remove data:mime;base64, prefix
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      
      updateStatus("Uploading file...");
      onProgress?.(25);
      
      // Create request payload
      const payload = {
        audioFile: base64,
        audioFileName: file.name,
        audioFileType: file.type,
        options: {
          language: 'auto',
          enableSpeakerDiarization: true,
          maxDuration: 3600 // 1 hour max
        }
      };
      
      updateStatus("Processing with AI...");
      onProgress?.(50);
      
      // Send to transcription API
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      onProgress?.(75);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Transcription failed');
      }
      
      const result = await response.json();
      
      onProgress?.(100);
      updateStatus("Transcription complete!");
      
      if (result.success) {
        setResult(result.data.transcript || null);
        console.log("Transcription Result:", result.data);
      } else {
        throw new Error(result.error || 'Transcription failed');
      }
    } catch (error) {
      console.error('File processing error:', error);
      const errorMessage = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      updateStatus(errorMessage);
      alert(`Processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setProcessing(false);
      // Clear status after a delay when processing is complete
      setTimeout(() => setProcessingStatus(""), 3000);
    }
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

          {/* Status Notification */}
          {processingStatus && (
            <Alert className={`${processingStatus.startsWith('Error:') ? 'border-destructive bg-destructive/10' : processingStatus.includes('complete') ? 'border-green-500 bg-green-50' : 'border-blue-500 bg-blue-50'}`}>
              {processing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : processingStatus.startsWith('Error:') ? (
                <AlertCircle className="h-4 w-4" />
              ) : processingStatus.includes('complete') ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              <AlertDescription>
                {processingStatus}
              </AlertDescription>
            </Alert>
          )}

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
