/**
 * Story 7.7 — per-row indicator: either "✦ AI" chip OR "Coach edited" chip +
 * one-click Regenerate button. Used inside AIIntelligenceStrip row headers.
 */

'use client';

import { RotateCcw } from 'lucide-react';
import { AIIndicator } from '../AIIndicator';

interface Props {
  isOverridden: boolean;
  onClearOverride: () => void;
}

export function RowIndicators({ isOverridden, onClearOverride }: Props) {
  if (!isOverridden) return <AIIndicator />;
  return (
    <>
      <span className="inline-flex items-center rounded-full bg-foreground/8 px-2 py-0.5 text-[10px] font-medium text-foreground/60 normal-case tracking-normal">
        Coach edited
      </span>
      <button
        type="button"
        onClick={onClearOverride}
        title="Regenerate this field from AI on next refresh"
        className="inline-flex items-center gap-0.5 text-[10px] text-primary/70 hover:text-primary normal-case tracking-normal"
      >
        <RotateCcw className="h-3 w-3" />
        Regenerate
      </button>
    </>
  );
}
