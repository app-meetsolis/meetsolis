/**
 * BriefHeader — title, live countdown, next-brief + dismiss controls (Story 6.4).
 */

'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, X } from 'lucide-react';
import { formatCountdown } from '@/lib/brief/format-countdown';
import { Button } from '@/components/ui/button';

export interface BriefHeaderProps {
  clientName: string;
  /** Session start (ISO). Null for manual briefs. */
  startTime: string | null;
  /** Event id of the next brief later today, or null. */
  nextEventId: string | null;
  onNext: () => void;
  onDismiss: () => void;
  dismissing: boolean;
}

/** Re-renders every minute to keep the countdown fresh. */
function useCountdown(startTime: string | null): string | null {
  const [, tick] = useState(0);
  useEffect(() => {
    if (!startTime) return;
    const t = setInterval(() => tick(n => n + 1), 60_000);
    return () => clearInterval(t);
  }, [startTime]);
  if (!startTime) return null;
  return formatCountdown(new Date(startTime));
}

export function BriefHeader({
  clientName,
  startTime,
  nextEventId,
  onNext,
  onDismiss,
  dismissing,
}: BriefHeaderProps) {
  const countdown = useCountdown(startTime);

  return (
    <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">
          Coach Brief
        </p>
        <h1 className="mt-1 text-[22px] font-bold tracking-[-0.02em] text-foreground">
          {clientName}
        </h1>
        {countdown && (
          <p className="mt-0.5 text-[13px] text-foreground/45">{countdown}</p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {nextEventId && (
          <Button
            variant="outline"
            size="sm"
            onClick={onNext}
            className="h-8 gap-1.5 border-border bg-transparent text-[12px] text-foreground/70 hover:text-foreground"
          >
            Next brief
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          disabled={dismissing}
          className="h-8 gap-1.5 text-[12px] text-foreground/35 hover:text-foreground/70"
        >
          <X className="h-3.5 w-3.5" />
          Dismiss
        </Button>
      </div>
    </div>
  );
}
