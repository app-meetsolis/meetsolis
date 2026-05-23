'use client';

/**
 * "Learn more →" modal for auto-transcribe toggle (Story 6.5).
 * Renders strings from onboarding-copy.ts (Story 6.2).
 */

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  BOT_DISCLOSURE,
  BOT_CLIENT_TEMPLATE_MESSAGE,
} from '@/lib/constants/onboarding-copy';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BotDisclosureModal({ open, onOpenChange }: Props) {
  const [copied, setCopied] = useState(false);

  async function copyTemplate() {
    try {
      await navigator.clipboard.writeText(BOT_CLIENT_TEMPLATE_MESSAGE);
      setCopied(true);
      toast.success('Copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Copy failed');
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>About MeetSolis Notetaker</DialogTitle>
          <DialogDescription>
            What your clients will see and how to talk about it.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <p className="text-[12px] font-medium text-foreground mb-1.5">
              What clients see in the meeting
            </p>
            <p className="text-[13px] text-muted-foreground leading-relaxed">
              {BOT_DISCLOSURE}
            </p>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[12px] font-medium text-foreground">
                Copyable message for your clients
              </p>
              <button
                type="button"
                onClick={copyTemplate}
                className="flex items-center gap-1 text-[11px] text-primary hover:underline"
              >
                {copied ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <p className="text-[13px] text-muted-foreground leading-relaxed bg-muted rounded-[8px] px-3 py-2.5 italic">
              &ldquo;{BOT_CLIENT_TEMPLATE_MESSAGE}&rdquo;
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
