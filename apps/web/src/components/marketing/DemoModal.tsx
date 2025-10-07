'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';

interface DemoModalProps {
  trigger?: React.ReactNode;
}

export function DemoModal({ trigger }: DemoModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <div onClick={() => setOpen(true)}>{trigger}</div>
      ) : (
        <Button
          size="lg"
          variant="outline"
          className="group"
          onClick={() => setOpen(true)}
        >
          <Play className="mr-2 h-4 w-4" />
          Watch Demo
        </Button>
      )}
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>MeetSolis Platform Demo</DialogTitle>
        </DialogHeader>
        <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
          {/* Placeholder for demo video - replace with actual video embed */}
          <div className="text-center p-8">
            <Play className="w-16 h-16 text-primary mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              Demo video will be embedded here
            </p>
            <p className="text-sm text-gray-500">
              Replace this placeholder with your product demo video using an
              iframe embed from YouTube, Vimeo, or Loom
            </p>
            {/* Example YouTube embed structure:
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/YOUR_VIDEO_ID"
              title="MeetSolis Demo"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            */}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
