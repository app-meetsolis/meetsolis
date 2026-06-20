/**
 * Story 7.6 — shared presentational row for an open action item.
 *
 * Inline checkbox marks the item done (parent owns the mutation + optimistic
 * removal). Meta line shows source session + the "Open X sessions" indicator.
 */

'use client';

import { format, parseISO } from 'date-fns';
import { Check } from 'lucide-react';
import type { OpenActionItem } from '@meetsolis/shared';
import { cn } from '@/lib/utils';

interface Props {
  item: OpenActionItem;
  onToggle: (item: OpenActionItem) => void;
  completing?: boolean;
  showClientName?: boolean;
  showAssigneeBadge?: boolean;
  onNavigate?: (item: OpenActionItem) => void;
}

export function OpenItemRow({
  item,
  onToggle,
  completing = false,
  showClientName = false,
  showAssigneeBadge = false,
  onNavigate,
}: Props) {
  const carried = item.open_session_count > 1;

  return (
    <li
      className={cn(
        'flex items-start gap-3 transition-opacity',
        completing && 'opacity-40 pointer-events-none'
      )}
    >
      <button
        type="button"
        onClick={() => onToggle(item)}
        aria-label={`Mark "${item.description}" done`}
        className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-[5px] border border-foreground/25 text-transparent transition-colors hover:border-primary hover:bg-primary/10 hover:text-primary"
      >
        <Check className="h-3 w-3" />
      </button>

      <div className="min-w-0 flex-1">
        <button
          type="button"
          onClick={() => onNavigate?.(item)}
          disabled={!onNavigate}
          className={cn(
            'block text-left text-[12.5px] leading-relaxed text-foreground/80',
            onNavigate && 'hover:text-foreground'
          )}
        >
          {item.description}
        </button>

        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
          {showAssigneeBadge && item.assignee && (
            <span className="inline-block rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-primary">
              {item.assignee === 'coach' ? 'COACH' : 'CLIENT'}
            </span>
          )}
          {showClientName && item.client_name && (
            <span className="text-[10px] font-medium text-foreground/55">
              {item.client_name}
            </span>
          )}
          {item.source_session_date && (
            <span className="truncate text-[10px] text-foreground/35">
              {item.source_session_title
                ? `${item.source_session_title} · `
                : 'from '}
              {format(parseISO(item.source_session_date), 'MMM d')}
            </span>
          )}
          {carried && (
            <span
              className={cn(
                'text-[10px] font-medium',
                item.open_session_count >= 3
                  ? 'text-amber-600'
                  : 'text-primary/70'
              )}
            >
              Open {item.open_session_count} sessions
            </span>
          )}
        </div>
      </div>
    </li>
  );
}
