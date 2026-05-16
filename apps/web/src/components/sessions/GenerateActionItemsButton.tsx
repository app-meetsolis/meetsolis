'use client';

/**
 * GenerateActionItemsButton (Story 6.2c)
 * Per-session manual trigger for AI action-item generation.
 * Self-contained — drop in anywhere with a sessionId. No layout coupling.
 */

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ListChecks, Loader2 } from 'lucide-react';
import type { ClientActionItem, SessionStatus } from '@meetsolis/shared';

interface Props {
  sessionId: string;
  sessionStatus: SessionStatus;
  onGenerated?: () => void;
}

export function GenerateActionItemsButton({
  sessionId,
  sessionStatus,
  onGenerated,
}: Props) {
  const mutation = useMutation({
    mutationFn: async (): Promise<ClientActionItem[]> => {
      const r = await fetch(
        `/api/sessions/${sessionId}/action-items/generate`,
        { method: 'POST' }
      );
      if (!r.ok) {
        const body = await r.json().catch(() => null);
        throw new Error(body?.error?.message ?? 'Failed to generate');
      }
      return (await r.json()).action_items ?? [];
    },
    onSuccess: items => {
      toast.success(
        items.length > 0
          ? `Generated ${items.length} action item${items.length === 1 ? '' : 's'}`
          : 'No action items found in this session'
      );
      onGenerated?.();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const disabled = sessionStatus !== 'complete' || mutation.isPending;

  return (
    <button
      type="button"
      onClick={() => mutation.mutate()}
      disabled={disabled}
      title={
        sessionStatus !== 'complete'
          ? 'Available once the session summary is ready'
          : undefined
      }
      className="flex items-center gap-1.5 text-[12px] text-foreground/40 hover:text-foreground/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-foreground/40"
    >
      {mutation.isPending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <ListChecks className="h-3.5 w-3.5" />
      )}
      {mutation.isPending ? 'Generating…' : 'Generate Action Items'}
    </button>
  );
}
