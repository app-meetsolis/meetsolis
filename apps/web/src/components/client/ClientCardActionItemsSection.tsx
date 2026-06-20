/**
 * Story 7.6 — Open Action Items on the Client Card.
 *
 * Sits between the header and the AI Intelligence Strip (replaces the 7.7
 * placeholder slot). Splits open items into the client's vs the coach's
 * commitments; NULL/'unknown' assignees are hidden from this split (coach can
 * reassign on the session detail view). Completed items live in a collapsible
 * accordion at the bottom.
 */

'use client';

import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { ChevronDown } from 'lucide-react';
import type {
  ClientActionItem,
  OpenActionItem,
  Session,
} from '@meetsolis/shared';
import { cn } from '@/lib/utils';
import { OpenItemRow } from '@/components/action-items/OpenItemRow';
import { useCompleteOpenItem } from '@/hooks/useCompleteOpenItem';

interface Props {
  clientId: string;
  actionItems: ClientActionItem[];
  sessionById: Map<string, Session>;
}

export function ClientCardActionItemsSection({
  clientId,
  actionItems,
  sessionById,
}: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showCompleted, setShowCompleted] = useState(false);

  const openKey = ['open-items', clientId];
  const { data: open = [] } = useQuery<OpenActionItem[]>({
    queryKey: openKey,
    queryFn: async () => {
      const r = await fetch(`/api/action-items/open?client_id=${clientId}`);
      if (!r.ok) return [];
      return (await r.json()).items ?? [];
    },
    staleTime: 30_000,
  });

  const { complete, completingId } = useCompleteOpenItem({
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: openKey });
      queryClient.invalidateQueries({
        queryKey: ['all-action-items', clientId],
      });
    },
  });

  const clientItems = open.filter(i => i.assignee === 'client');
  const coachItems = open.filter(i => i.assignee === 'coach');
  const completed = useMemo(
    () => actionItems.filter(i => i.completed),
    [actionItems]
  );

  const openCount = clientItems.length + coachItems.length;
  // Nothing to show at all → render nothing (matches old slot behavior).
  if (openCount === 0 && completed.length === 0) return null;

  const navigate = (item: OpenActionItem) => {
    if (item.source_session_id) {
      router.push(`/clients/${clientId}/sessions/${item.source_session_id}`);
    }
  };

  return (
    <div className="rounded-[12px] bg-card shadow-card px-6 py-5">
      <div className="mb-4 flex items-center gap-2">
        <h2 className="text-[14px] font-semibold tracking-tight text-foreground">
          Open Action Items
        </h2>
        <span className="inline-flex items-center rounded-full bg-foreground/[0.08] px-2 py-0.5 text-[10px] font-semibold text-foreground/50">
          {openCount}
        </span>
      </div>

      {openCount === 0 ? (
        <p className="text-[12px] text-foreground/40">No open action items.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          <Column
            label="Client's commitments"
            items={clientItems}
            completingId={completingId}
            onToggle={i => complete(i.id)}
            onNavigate={navigate}
          />
          <Column
            label="My commitments"
            items={coachItems}
            completingId={completingId}
            onToggle={i => complete(i.id)}
            onNavigate={navigate}
          />
        </div>
      )}

      {completed.length > 0 && (
        <div className="mt-5 border-t border-border pt-3">
          <button
            type="button"
            onClick={() => setShowCompleted(v => !v)}
            className="flex items-center gap-1.5 text-[11px] font-medium text-foreground/45 hover:text-foreground/70"
          >
            <ChevronDown
              className={cn(
                'h-3.5 w-3.5 transition-transform',
                showCompleted && 'rotate-180'
              )}
            />
            Completed action items ({completed.length})
          </button>
          {showCompleted && (
            <ul className="mt-3 space-y-1.5">
              {completed.map(item => {
                const s = item.session_id
                  ? sessionById.get(item.session_id)
                  : undefined;
                return (
                  <li key={item.id} className="flex items-start gap-2.5">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/20" />
                    <p className="text-[12px] leading-relaxed text-foreground/40 line-through">
                      {item.description}
                      {s && (
                        <span className="ml-1.5 no-underline">
                          · {format(parseISO(s.session_date), 'MMM d')}
                        </span>
                      )}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

interface ColumnProps {
  label: string;
  items: OpenActionItem[];
  completingId: string | null;
  onToggle: (item: OpenActionItem) => void;
  onNavigate: (item: OpenActionItem) => void;
}

function Column({
  label,
  items,
  completingId,
  onToggle,
  onNavigate,
}: ColumnProps) {
  return (
    <div>
      <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-foreground/30">
        {label}
      </p>
      {items.length === 0 ? (
        <p className="text-[11.5px] text-foreground/30">None open.</p>
      ) : (
        <ul className="space-y-2.5">
          {items.map(item => (
            <OpenItemRow
              key={item.id}
              item={item}
              completing={completingId === item.id}
              onToggle={onToggle}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
