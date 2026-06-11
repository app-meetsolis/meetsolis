/**
 * Story 7.2 — manual-refresh button on the AI Intelligence Strip.
 *
 * Free tier shows a disabled tooltip ("upgrade to Pro"). Pro tier shows
 * an enabled button that spins while a regen is in flight.
 */

'use client';

import { RefreshCw } from 'lucide-react';

interface Props {
  isPro: boolean;
  isPending: boolean;
  onClick: () => void;
}

export function RefreshButton({ isPro, isPending, onClick }: Props) {
  if (!isPro) {
    return (
      <button
        type="button"
        title="Refresh insights manually — upgrade to Pro"
        disabled
        className="inline-flex items-center gap-1.5 text-[11px] text-foreground/30 cursor-not-allowed"
      >
        <RefreshCw className="h-3.5 w-3.5" />
        Refresh insights
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isPending}
      className="inline-flex items-center gap-1.5 text-[11px] text-foreground/55 hover:text-foreground transition-colors disabled:opacity-50"
    >
      <RefreshCw className={`h-3.5 w-3.5 ${isPending ? 'animate-spin' : ''}`} />
      {isPending ? 'Refreshing…' : 'Refresh insights'}
    </button>
  );
}
