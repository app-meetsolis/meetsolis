'use client';

/**
 * Auto-transcribe sessions toggle + "Learn more" disclosure modal trigger (Story 6.5).
 * Pro-only.
 */

import { useState } from 'react';
import Link from 'next/link';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { BotDisclosureModal } from './BotDisclosureModal';

interface Props {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  isPro: boolean;
  disabled?: boolean;
}

export function AutoTranscribeToggle({
  checked,
  onCheckedChange,
  isPro,
  disabled,
}: Props) {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="space-y-2">
      <div
        className={cn(
          'flex items-start justify-between gap-4',
          !isPro && 'opacity-50 pointer-events-none select-none'
        )}
      >
        <div className="space-y-1 min-w-0">
          <Label
            htmlFor="auto-transcribe"
            className="text-[13px] font-medium text-foreground"
          >
            Auto-transcribe sessions with MeetSolis Notetaker
          </Label>
          <p className="text-[12px] text-muted-foreground">
            When enabled, a &apos;MeetSolis Notetaker&apos; bot will join your
            calendar sessions to capture transcripts. Your clients will see it
            listed as a participant.{' '}
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="text-primary hover:underline"
            >
              Learn more →
            </button>
          </p>
        </div>
        <Switch
          id="auto-transcribe"
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={!isPro || disabled}
        />
      </div>
      {!isPro && (
        <p className="text-[12px] text-muted-foreground">
          <Link href="/pricing" className="text-primary hover:underline">
            Upgrade to Pro
          </Link>{' '}
          to unlock auto-transcription.
        </p>
      )}
      <BotDisclosureModal open={showModal} onOpenChange={setShowModal} />
    </div>
  );
}
