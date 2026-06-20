/**
 * Story 7.6 — dashboard open-action-items summary.
 *
 * Aggregates open commitments across all of the coach's clients. Collapsed by
 * default to a one-line summary; expands inline to the 5 oldest open items
 * (urgency sort). Click an item to jump to its source session.
 */

'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { CheckCircle2, ChevronDown, ListTodo } from 'lucide-react';
import type { OpenActionItem, OpenItemsAcrossClients } from '@meetsolis/shared';
import { cn } from '@/lib/utils';
import { OpenItemRow } from '@/components/action-items/OpenItemRow';
import { useCompleteOpenItem } from '@/hooks/useCompleteOpenItem';

export function OpenActionItemsCard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(false);

  const queryKey = ['open-items-across'];
  const { data } = useQuery<OpenItemsAcrossClients>({
    queryKey,
    queryFn: async () => {
      const r = await fetch('/api/action-items/open');
      if (!r.ok) {
        return { totalCount: 0, topItems: [], clientsAffected: 0 };
      }
      return r.json();
    },
    staleTime: 30_000,
  });

  const { complete, completingId } = useCompleteOpenItem({
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  const total = data?.totalCount ?? 0;
  const navigate = (item: OpenActionItem) => {
    if (item.source_session_id) {
      router.push(
        `/clients/${item.client_id}/sessions/${item.source_session_id}`
      );
    }
  };

  if (total === 0) {
    return (
      <div className="flex items-center gap-2.5 rounded-[12px] bg-card shadow-card px-5 py-4">
        <CheckCircle2 className="h-4 w-4 text-primary" />
        <span className="text-[13px] text-muted-foreground">
          All action items are up to date ✓
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-[12px] bg-card shadow-card">
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <span className="flex items-center gap-2.5">
          <ListTodo className="h-4 w-4 text-primary" />
          <span className="text-[13px] font-medium text-foreground">
            {total} open client commitment{total !== 1 ? 's' : ''} across{' '}
            {data?.clientsAffected ?? 0} client
            {data?.clientsAffected !== 1 ? 's' : ''}
          </span>
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-foreground/30 transition-transform',
            expanded && 'rotate-180'
          )}
        />
      </button>

      {expanded && (data?.topItems.length ?? 0) > 0 && (
        <ul className="space-y-2.5 border-t border-border px-5 py-4">
          {data!.topItems.map(item => (
            <OpenItemRow
              key={item.id}
              item={item}
              completing={completingId === item.id}
              onToggle={i => complete(i.id)}
              onNavigate={navigate}
              showClientName
            />
          ))}
        </ul>
      )}
    </div>
  );
}
