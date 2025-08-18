'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Mail } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';

interface EmailDialogProps {
  minutes: any; // The meeting minutes object
  onUpgradeClick?: () => void;
  isProUser?: boolean;
}

export function EmailDialog({ minutes, onUpgradeClick, isProUser = false }: EmailDialogProps) {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [subject, setSubject] = useState(`Meeting Minutes: ${minutes.title}`);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<{success: boolean, message: string} | null>(null);
  
  const handleSendEmail = async () => {
    if (!isProUser) {
      onUpgradeClick?.();
      return;
    }
    
    if (!recipientEmail) {
      setSendResult({ success: false, message: 'Please enter a recipient email address.' });
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      setSendResult({ success: false, message: 'Please enter a valid email address.' });
      return;
    }
    
    setIsSending(true);
    setSendResult(null);
    
    try {
      // In a real implementation, we would call the Convex mutation to send the email
      // For now, we'll just simulate the action
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate success
      setSendResult({ 
        success: true, 
        message: `Meeting minutes sent successfully to ${recipientEmail}` 
      });
      
      // Close the dialog after a short delay
      setTimeout(() => {
        setIsOpen(false);
        setSendResult(null);
      }, 2000);
    } catch (error) {
      console.error('Error sending email:', error);
      setSendResult({ 
        success: false, 
        message: 'Failed to send email. Please try again.' 
      });
    } finally {
      setIsSending(false);
    }
  };
  
  const resetForm = () => {
    setRecipientEmail('');
    setSubject(`Meeting Minutes: ${minutes.title}`);
    setMessage('');
    setSendResult(null);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full sm:w-auto"
          disabled={!isProUser}
        >
          <Mail className="h-4 w-4 mr-2" />
          Email
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Send Meeting Minutes</DialogTitle>
          <DialogDescription>
            Send these meeting minutes to a colleague via email.
          </DialogDescription>
        </DialogHeader>
        
        {!isProUser ? (
          <div className="py-4 text-center">
            <p className="text-gray-600 mb-4">
              Email integration is a Pro feature.
            </p>
            <Button onClick={onUpgradeClick}>
              Upgrade to Pro
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="recipient" className="text-right">
                To
              </Label>
              <div className="col-span-3">
                <Input
                  id="recipient"
                  type="email"
                  placeholder="colleague@example.com"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="subject" className="text-right">
                Subject
              </Label>
              <div className="col-span-3">
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="message" className="text-right">
                Message
              </Label>
              <div className="col-span-3">
                <Textarea
                  id="message"
                  placeholder="Add a personal message (optional)"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full"
                  rows={3}
                />
              </div>
            </div>
            
            {sendResult && (
              <div className={`p-3 rounded-md ${sendResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {sendResult.message}
              </div>
            )}
          </div>
        )}
        
        {isProUser && (
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSendEmail} 
              disabled={isSending || !recipientEmail}
            >
              {isSending ? 'Sending...' : 'Send Email'}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}