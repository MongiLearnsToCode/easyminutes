'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Download } from 'lucide-react';
import { MeetingMinutes } from '@/hooks/use-process-meeting-notes';
import { exportToWord, exportToPdf } from '@/lib/export-utils';

interface ExportButtonProps {
  minutes: MeetingMinutes;
  filename?: string;
  isProUser?: boolean;
  onUpgradeClick?: () => void;
}

export function ExportButton({ minutes, filename, isProUser = false, onUpgradeClick }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  
  const handleExport = async (format: 'word' | 'pdf') => {
    if (!isProUser) {
      onUpgradeClick?.();
      return;
    }
    
    setIsExporting(true);
    try {
      if (format === 'word') {
        await exportToWord(minutes, filename ? `${filename}.docx` : undefined);
      } else {
        await exportToPdf(minutes, filename ? `${filename}.pdf` : undefined);
      }
      
      // Track user activity
      // TODO: Implement actual tracking
      console.log('Tracking user activity: export_minutes');
    } catch (error) {
      console.error(`Error exporting to ${format}:`, error);
      // In a real implementation, we would show an error message to the user
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="default" 
          disabled={isExporting || (!isProUser && true)}
        >
          <Download className="mr-2 h-4 w-4" />
          {isExporting ? 'Exporting...' : 'Export'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => handleExport('word')}
          disabled={!isProUser}
        >
          Export as Word (.docx)
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleExport('pdf')}
          disabled={!isProUser}
        >
          Export as PDF
        </DropdownMenuItem>
        {!isProUser && (
          <div className="p-2 text-sm text-gray-500 border-t">
            Export is a Pro feature. 
            <Button 
              variant="link" 
              className="px-1 text-blue-600 hover:text-blue-800" 
              onClick={(e) => {
                e.stopPropagation();
                onUpgradeClick?.();
              }}
            >
              Upgrade to Pro
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}