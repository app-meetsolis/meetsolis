/**
 * Story 7.7 — Open Action Items slot.
 *
 * Placeholder for Story 7.6, which will replace this with the rich
 * action items section. Until 7.6 ships, this renders a simple list of
 * pending items so the UX doesn't regress from Epic 2.
 *
 * TODO Story 7.6: replace this component's contents with the rich version.
 */

'use client';

import { format, parseISO } from 'date-fns';
import type { ClientActionItem, Session } from '@meetsolis/shared';

interface Props {
  actionItems: ClientActionItem[];
  sessionById: Map<string, Session>;
}

export function OpenActionItemsSlot({ actionItems, sessionById }: Props) {
  const pending = actionItems.filter(i => !i.completed);
  if (pending.length === 0) return null;

  return (
    <div className="rounded-[12px] bg-card shadow-card px-6 py-5">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-[14px] font-semibold text-foreground tracking-tight">
          Open actions
        </h2>
        <span className="inline-flex items-center rounded-full bg-foreground/[0.08] px-2 py-0.5 text-[10px] font-semibold text-foreground/50">
          {pending.length}
        </span>
      </div>
      <ul className="space-y-2">
        {pending.slice(0, 8).map(item => {
          const fromSession = item.session_id
            ? sessionById.get(item.session_id)
            : undefined;
          return (
            <li key={item.id} className="flex items-start gap-3">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[12.5px] text-foreground/80 leading-relaxed">
                  {item.description}
                </p>
                <div className="mt-0.5 flex items-center gap-2">
                  {item.assignee && (
                    <span className="inline-block rounded px-1.5 py-0.5 text-[9px] font-bold tracking-wide bg-primary/10 text-primary">
                      {item.assignee === 'coach' ? 'COACH' : 'CLIENT'}
                    </span>
                  )}
                  {fromSession && (
                    <span className="truncate text-[10px] text-foreground/35">
                      {fromSession.title} ·{' '}
                      {format(parseISO(fromSession.session_date), 'MMM d')}
                    </span>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
