/**
 * Story 7.6 — mark an open action item complete/incomplete.
 *
 * Tracks the in-flight item id so rows can fade out optimistically. Callers
 * pass an `onSettled` to refetch/invalidate their own query cache.
 */

'use client';

import { useState } from 'react';
import { toast } from 'sonner';

interface Options {
  onSettled?: () => void;
}

export function useCompleteOpenItem({ onSettled }: Options = {}) {
  const [completingId, setCompletingId] = useState<string | null>(null);

  async function complete(id: string, completed = true): Promise<void> {
    setCompletingId(id);
    try {
      const r = await fetch(`/api/action-items/${id}/complete`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed }),
      });
      if (!r.ok) throw new Error('request failed');
      onSettled?.();
    } catch {
      toast.error('Could not update action item.');
      setCompletingId(null);
    }
  }

  return { complete, completingId };
}
