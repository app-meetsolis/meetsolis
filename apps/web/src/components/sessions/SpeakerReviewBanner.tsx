'use client';

/**
 * SpeakerReviewBanner (Story 6.3)
 * Yellow notice shown when Gladia diarization detected an unexpected number
 * of speakers (>2 or 1) and the coach should verify the speaker labels.
 */

import { AlertTriangle } from 'lucide-react';

export function SpeakerReviewBanner({ note }: { note?: string | null }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
      <div className="text-[13px] leading-relaxed text-amber-200">
        <p className="font-semibold">Please verify the speaker labels</p>
        <p className="text-amber-200/80">
          {note ??
            'Multiple speakers detected. Confirm who said what below before relying on the summary.'}
        </p>
      </div>
    </div>
  );
}
