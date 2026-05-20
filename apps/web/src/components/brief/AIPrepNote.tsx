/**
 * AIPrepNote — the editable narrative prep note (Story 6.4 hero section).
 * On AI failure, shows a retry control instead of the note.
 */

'use client';

import { Sparkles, RefreshCw, AlertTriangle } from 'lucide-react';
import { EditableText } from './EditableText';
import { Button } from '@/components/ui/button';

export interface AIPrepNoteProps {
  note: string;
  edited: boolean;
  failed: boolean;
  onSave: (next: string) => void;
  onRetry: () => void;
  retrying: boolean;
}

export function AIPrepNote({
  note,
  edited,
  failed,
  onSave,
  onRetry,
  retrying,
}: AIPrepNoteProps) {
  return (
    <section className="rounded-[12px] bg-card px-6 py-5 shadow-card">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-foreground/40">
          AI Prep Note
        </h2>
        {edited && (
          <span className="text-[10px] text-foreground/30">· edited</span>
        )}
      </div>

      {failed && !note ? (
        <div className="flex items-center justify-between gap-4 rounded-md border border-amber-500/30 bg-amber-500/[0.06] px-4 py-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
            <p className="text-[12.5px] text-foreground/70">
              AI Prep Note unavailable.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            disabled={retrying}
            className="h-8 shrink-0 gap-1.5 border-border bg-transparent text-[12px]"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${retrying ? 'animate-spin' : ''}`}
            />
            {retrying ? 'Retrying…' : 'Retry'}
          </Button>
        </div>
      ) : (
        <EditableText
          value={note}
          onSave={onSave}
          edited={edited}
          multiline
          placeholder="Write a prep note…"
          ariaLabel="AI prep note"
          textClassName="text-[14px] leading-[1.7] text-foreground/90"
        />
      )}
    </section>
  );
}
